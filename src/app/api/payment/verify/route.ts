import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getPackageById } from '@/lib/packages';
import { PENDING_ORDER_COOKIE } from '@/lib/payment';

const ZIONPE_API_BASE = 'https://zionpe.com/api';

interface PendingOrder {
  orderId: string;
  packageId: string;
  sessionId: string;
  email: string;
}

interface ZionPeSession {
  id?: string;
  status?: string;
  amount?: number;
  currency?: string;
  payment_intent_id?: string;
  metadata?: Record<string, unknown>;
}

interface ZionPeSessionResponse {
  success?: boolean;
  session?: ZionPeSession;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { sessionId, paymentIntentId } = body as { sessionId?: string; paymentIntentId?: string };
  if (typeof sessionId !== 'string' || !sessionId || typeof paymentIntentId !== 'string' || !paymentIntentId) {
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
    pending = JSON.parse(pendingCookie) as PendingOrder;
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

  const pkg = getPackageById(pending.packageId);
  if (!pkg) {
    console.error('[payment/verify] Pending order references unknown package:', pending.packageId);
    return NextResponse.json({ error: 'Unable to verify your order.' }, { status: 500 });
  }

  const siteKey = process.env.ZIONPE_SITE_KEY;
  const siteSecret = process.env.ZIONPE_SITE_SECRET;
  if (!siteKey || !siteSecret) {
    console.error('[payment/verify] ZionPe credentials are not configured.');
    return NextResponse.json(
      { error: 'Payment verification is temporarily unavailable. Please contact support.' },
      { status: 503 }
    );
  }

  // ZionPe's supported confirmation API is a signed read. The empty GET body
  // is signed as `${timestamp}.`; the Site Key travels in its documented header.
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac('sha256', siteSecret).update(`${timestamp}.`).digest('hex');

  let zionpeRes: Response;
  try {
    zionpeRes = await fetch(
      `${ZIONPE_API_BASE}/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        method: 'GET',
        headers: {
          'X-ZionPe-Site-Key': siteKey,
          'X-ZionPe-Timestamp': timestamp,
          'X-ZionPe-Signature': signature,
        },
        cache: 'no-store',
      }
    );
  } catch (err) {
    console.error('[payment/verify] Network error contacting ZionPe:', err);
    return NextResponse.json({ error: 'Unable to verify payment right now. Please try again.' }, { status: 502 });
  }

  let data: ZionPeSessionResponse | null = null;
  try {
    data = await zionpeRes.json() as ZionPeSessionResponse;
  } catch {
    data = null;
  }

  if (!zionpeRes.ok || !data?.success || !data.session) {
    console.error('[payment/verify] ZionPe session read failed. status:', zionpeRes.status);
    return NextResponse.json({ outcome: 'error', orderId: pending.orderId });
  }

  const session = data.session;
  if (
    session.id !== sessionId ||
    session.payment_intent_id !== paymentIntentId ||
    session.metadata?.order_id !== pending.orderId ||
    session.metadata?.package_id !== pkg.id ||
    typeof session.amount !== 'number' ||
    Math.round(session.amount * 100) !== pkg.amount ||
    typeof session.currency !== 'string' ||
    session.currency.toUpperCase() !== pkg.currency
  ) {
    console.error('[payment/verify] ZionPe session did not match the pending order:', pending.orderId);
    return NextResponse.json({ outcome: 'error', orderId: pending.orderId });
  }

  const outcome = session.status === 'completed'
    ? 'paid'
    : session.status === 'processing' || session.status === 'pending'
      ? 'processing'
      : session.status === 'cancelled' || session.status === 'expired'
        ? 'cancelled'
        : 'failed';

  return NextResponse.json({
    outcome,
    orderId: pending.orderId,
    package: { id: pkg.id, title: pkg.title, service: pkg.service },
    amount: pkg.amount,
    currency: pkg.currency,
  });
}
