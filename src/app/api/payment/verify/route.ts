import { NextRequest, NextResponse } from 'next/server';
import { getPackageById, type PackageDefinition } from '@/lib/packages';
import { PENDING_ORDER_COOKIE } from '@/lib/payment';

const ZIONPE_API_BASE = 'https://zionpe.com/api';

const KNOWN_ZIONPE_STATUSES = [
  'succeeded',
  'processing',
  'requires_payment_method',
  'requires_action',
  'requires_confirmation',
  'canceled',
] as const;

interface PendingOrder {
  orderId: string;
  packageId: string;
  sessionId: string;
  email: string;
}

interface VerifyPaymentResponse {
  success?: boolean;
  status?: string;
  amount?: number;
  currency?: string;
  cardBrand?: string;
  cardLast4?: string;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { sessionId, paymentIntentId } = body as { sessionId?: string; paymentIntentId?: string };
  if (!sessionId || !paymentIntentId) {
    return NextResponse.json({ error: 'Missing payment identifier.' }, { status: 400 });
  }

  const pendingCookie = req.cookies.get(PENDING_ORDER_COOKIE)?.value;
  if (!pendingCookie) {
    return NextResponse.json(
      { error: 'We could not find your order. If you were charged, please contact support.' },
      { status: 400 }
    );
  }

  let pending: PendingOrder;
  try {
    pending = JSON.parse(pendingCookie);
  } catch {
    return NextResponse.json(
      { error: 'We could not find your order. If you were charged, please contact support.' },
      { status: 400 }
    );
  }

  if (pending.sessionId !== sessionId) {
    return NextResponse.json(
      { error: 'This payment session does not match your order. Please contact support if you were charged.' },
      { status: 400 }
    );
  }

  // Never trust pending.amount (there isn't one) or anything from ZionPe's
  // echoed amount alone — always re-resolve the authoritative price here.
  const pkg = getPackageById(pending.packageId);
  if (!pkg) {
    console.error('[payment/verify] Pending order references unknown package:', pending.packageId);
    return NextResponse.json({ error: 'Unable to verify your order.' }, { status: 500 });
  }

  const siteKey = process.env.ZIONPE_SITE_KEY;
  if (!siteKey) {
    console.error('[payment/verify] ZIONPE_SITE_KEY is not configured.');
    return NextResponse.json(
      { error: 'Payment verification is temporarily unavailable. Please contact support.' },
      { status: 503 }
    );
  }

  let zionpeRes: Response;
  try {
    zionpeRes = await fetch(`${ZIONPE_API_BASE}/wp/checkout/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteKey,
        paymentIntentId,
        orderId: pending.orderId,
        orderTotal: (pkg.amount / 100).toFixed(2),
        currency: pkg.currency,
      }),
    });
  } catch (err) {
    console.error('[payment/verify] Network error contacting ZionPe:', err);
    return NextResponse.json({ error: 'Unable to verify payment right now. Please try again.' }, { status: 502 });
  }

  let data: VerifyPaymentResponse | null = null;
  try {
    data = await zionpeRes.json();
  } catch {
    data = null;
  }

  const payload = buildVerifyPayload(zionpeRes.ok, data, pkg, pending);

  const response = NextResponse.json(payload);
  // Single-use: once verification has been attempted, drop the pending
  // order so a stale cookie can't be reused for a different session.
  response.cookies.delete(PENDING_ORDER_COOKIE);
  return response;
}

function buildVerifyPayload(
  ok: boolean,
  data: VerifyPaymentResponse | null,
  pkg: PackageDefinition,
  pending: PendingOrder
) {
  if (!ok || !data) {
    console.error('[payment/verify] ZionPe verification call failed:', data);
    return { outcome: 'error' as const, orderId: pending.orderId };
  }

  // Defensive cross-check: the amount ZionPe confirms must match the
  // authoritative price we calculated, or something is wrong — never
  // report success based on client- or provider-supplied amounts alone.
  // ZionPe's live API reports amounts in whole currency units (e.g. 300 for
  // $300), matching what create/route.ts now sends — see the comment there.
  // pkg.amount is kept in cents internally, so it's converted for this
  // comparison only.
  const expectedAmount = pkg.amount / 100;
  if (typeof data.amount === 'number' && data.amount !== expectedAmount) {
    console.error(
      '[payment/verify] Amount mismatch for order',
      pending.orderId,
      'expected',
      expectedAmount,
      'got',
      data.amount
    );
    return { outcome: 'error' as const, orderId: pending.orderId };
  }

  const zionpeStatus = KNOWN_ZIONPE_STATUSES.includes(data.status as (typeof KNOWN_ZIONPE_STATUSES)[number])
    ? data.status
    : 'unknown';

  const paid = data.success === true && zionpeStatus === 'succeeded';

  const outcome = paid
    ? ('paid' as const)
    : zionpeStatus === 'canceled'
    ? ('cancelled' as const)
    : zionpeStatus === 'processing'
    ? ('processing' as const)
    : ('failed' as const);

  return {
    outcome,
    orderId: pending.orderId,
    package: { id: pkg.id, title: pkg.title, service: pkg.service },
    amount: pkg.amount,
    currency: pkg.currency,
    cardBrand: typeof data.cardBrand === 'string' ? data.cardBrand : undefined,
    cardLast4: typeof data.cardLast4 === 'string' ? data.cardLast4 : undefined,
  };
}
