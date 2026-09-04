import { createHmac } from 'crypto';

// Server-only. Never import this from a client component — ZIONPE_SITE_SECRET
// must never reach the browser bundle.

export interface SignedRequest {
  timestamp: string;
  signature: string;
  /** The exact string that was signed — send this unmodified as the request body. */
  body: string;
}

/**
 * Signs a ZionPe Custom Checkout API request body with HMAC-SHA256.
 *
 * The signature is calculated over the exact JSON string returned here —
 * callers must send `body` byte-for-byte as the HTTP request body, not
 * re-serialize `requestBody` again, or the signature will not match.
 */
export function signZionPeRequest(requestBody: unknown): SignedRequest {
  const siteSecret = process.env.ZIONPE_SITE_SECRET;
  if (!siteSecret) {
    throw new Error('ZIONPE_SITE_SECRET is not configured.');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const body = JSON.stringify(requestBody);
  const signature = createHmac('sha256', siteSecret).update(body).digest('hex');

  return { timestamp, signature, body };
}
