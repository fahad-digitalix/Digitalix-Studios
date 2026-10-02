import { createHmac } from 'crypto';

// Server-only. Never import this from a client component — ZIONPE_SITE_SECRET
// must never reach the browser bundle.
//
// Header names and signed-string format are taken from ZionPe's official
// open-source PHP SDK (github.com/micahguru/zionpe-php, src/ZionPe.php),
// since this project's own docs/dashboard did not spell them out. That SDK's
// sign() method computes:
//   hash_hmac('sha256', "$timestamp.$body", $siteSecret)
// and sends it as the X-ZionPe-Timestamp / X-ZionPe-Signature headers below.

export const ZIONPE_TIMESTAMP_HEADER = 'X-ZionPe-Timestamp';
export const ZIONPE_SIGNATURE_HEADER = 'X-ZionPe-Signature';

export interface SignedRequest {
  timestamp: string;
  signature: string;
  /** The exact string that was signed — send this unmodified as the request body. */
  body: string;
}

/**
 * Signs a ZionPe Custom Checkout API request body with HMAC-SHA256.
 *
 * The signature is calculated over `${timestamp}.${body}` (matching ZionPe's
 * official SDK), where `body` is the exact JSON string returned here —
 * callers must send it byte-for-byte as the HTTP request body, not
 * re-serialize `requestBody` again, or the signature will not match.
 */
export function signZionPeRequest(requestBody: unknown): SignedRequest {
  const siteSecret = process.env.ZIONPE_SITE_SECRET;
  if (!siteSecret) {
    throw new Error('ZIONPE_SITE_SECRET is not configured.');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const body = JSON.stringify(requestBody);
  const signature = createHmac('sha256', siteSecret)
    .update(`${timestamp}.${body}`)
    .digest('hex');

  return { timestamp, signature, body };
}
