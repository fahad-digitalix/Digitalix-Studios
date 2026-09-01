import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getPackageById } from '@/lib/packages';
import { PENDING_ORDER_COOKIE } from '@/lib/payment';

const ZIONPE_API_BASE = 'https://zionpe.com/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { packageId, fullName, email, phone } = body as {
    packageId?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };

  const pkg = getPackageById(packageId);
  if (!pkg) {
    return NextResponse.json({ error: 'Invalid package selected.' }, { status: 400 });
  }

  if (typeof fullName !== 'string' || !fullName.trim()) {
    return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
  }
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  if (!EMAIL_RE.test(trimmedEmail)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
  }
  if (typeof phone !== 'string' || !phone.trim()) {
    return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
  }

  const siteKey = process.env.ZIONPE_SITE_KEY;
  if (!siteKey) {
    console.error('[payment/create] ZIONPE_SITE_KEY is not configured.');
    return NextResponse.json(
      { error: 'Online payments are temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }

  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const origin = new URL(req.url).origin;

  let zionpeRes: Response;
  try {
    zionpeRes = await fetch(`${ZIONPE_API_BASE}/checkout/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_key: siteKey,
        line_items: [
          {
            name: pkg.title,
            description: pkg.service,
            // ZionPe's live API expects whole currency units here (e.g. 300
            // for $300), not the smallest unit as its written docs describe —
            // confirmed by testing: sending pkg.amount (cents) directly for
            // the $1300 package produced "Payment amount US$130,000.00" in
            // ZionPe's own error response. pkg.amount stays in cents
            // internally (used as-is for the verify-payment orderTotal
            // string below), so it's only converted here.
            amount: pkg.amount / 100,
            quantity: 1,
          },
        ],
        currency: pkg.currency,
        customer_email: trimmedEmail,
        success_url: `${origin}/payment/success`,
        cancel_url: `${origin}/payment/cancel`,
        metadata: {
          order_id: orderId,
          package_id: pkg.id,
          customer_email: trimmedEmail,
        },
      }),
    });
  } catch (err) {
    console.error('[payment/create] Network error contacting ZionPe:', err);
    return NextResponse.json(
      { error: 'Unable to reach the payment provider. Please try again.' },
      { status: 502 }
    );
  }

  let data: { success?: boolean; checkout_url?: string; session_id?: string } | null = null;
  try {
    data = await zionpeRes.json();
  } catch {
    data = null;
  }

  if (!zionpeRes.ok || !data?.success || !data.checkout_url || !data.session_id) {
    console.error('[payment/create] ZionPe rejected session creation. status:', zionpeRes.status, 'body:', data);
    return NextResponse.json(
      { error: 'Unable to start payment session. Please try again.' },
      { status: 502 }
    );
  }

  const response = NextResponse.json({ checkoutUrl: data.checkout_url, orderId });

  // No database exists for this project (see final report). We track the
  // orderId <-> package <-> ZionPe session relationship in a short-lived,
  // httpOnly cookie instead of trusting anything the browser sends back
  // after redirect. The authoritative amount is always re-resolved from
  // packages.ts during verification, never read from this cookie.
  response.cookies.set(
    PENDING_ORDER_COOKIE,
    JSON.stringify({
      orderId,
      packageId: pkg.id,
      sessionId: data.session_id,
      email: trimmedEmail,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 30,
      path: '/',
    }
  );

  return response;
}
