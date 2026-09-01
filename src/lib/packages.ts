// Authoritative package catalog for checkout/payment.
// This is the single source of truth for package pricing — the server
// resolves the final amount from here, never from client input.
// Safe to import from both server code and client components: it holds
// no secrets, only public catalog data.

export type Currency = "USD";

export interface PackageDefinition {
  id: string;
  title: string;
  service: string;
  /** Authoritative price in the smallest currency unit (cents for USD). */
  amount: number;
  currency: Currency;
  /** Display-only string, e.g. "$300". Never used for payment calculations. */
  priceDisplay: string;
}

const PACKAGES: Record<string, PackageDefinition> = {
  "10-vid": { id: "10-vid", title: "10 Videos Package", service: "Real Estate Media", amount: 30000, currency: "USD", priceDisplay: "$300" },
  "20-vid": { id: "20-vid", title: "20 Videos Package", service: "Real Estate Media", amount: 50000, currency: "USD", priceDisplay: "$500" },
  "30-vid": { id: "30-vid", title: "30 Videos Package", service: "Real Estate Media", amount: 70000, currency: "USD", priceDisplay: "$700" },

  "30-sec": { id: "30-sec", title: "30 Seconds Launch Video", service: "SaaS Launch Videos", amount: 45000, currency: "USD", priceDisplay: "$450" },
  "1-min": { id: "1-min", title: "1 Minute Launch Video", service: "SaaS Launch Videos", amount: 80000, currency: "USD", priceDisplay: "$800" },
  "2-min": { id: "2-min", title: "2 Minutes Explainer Suite", service: "SaaS Launch Videos", amount: 130000, currency: "USD", priceDisplay: "$1300" },

  // TEMPORARY: priced at $0.20 for a live end-to-end payment test with a real
  // card. Revert amount to 19900 and priceDisplay to "$199" immediately after.
  "short-starter": { id: "short-starter", title: "10 Short-Form Videos Pack", service: "Short-Form Video Editing", amount: 20, currency: "USD", priceDisplay: "$0.20" },
  "short-growth": { id: "short-growth", title: "20 Short-Form Videos Pack", service: "Short-Form Video Editing", amount: 24900, currency: "USD", priceDisplay: "$249" },
  "short-pro": { id: "short-pro", title: "30 Short-Form Videos Pack", service: "Short-Form Video Editing", amount: 29900, currency: "USD", priceDisplay: "$299" },

  "long-single": { id: "long-single", title: "10 Long-Form Videos Package", service: "Long-Form Video Editing", amount: 40000, currency: "USD", priceDisplay: "$400" },
  "long-bundle": { id: "long-bundle", title: "20 Long-Form Videos Package", service: "Long-Form Video Editing", amount: 70000, currency: "USD", priceDisplay: "$700" },
  "long-agency": { id: "long-agency", title: "30 Long-Form Videos Package", service: "Long-Form Video Editing", amount: 100000, currency: "USD", priceDisplay: "$1000" },
};

export function getPackageById(id: string | null | undefined): PackageDefinition | undefined {
  if (!id) return undefined;
  return PACKAGES[id];
}
