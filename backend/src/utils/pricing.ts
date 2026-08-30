import { round2 } from "./money";

// Ported 1:1 from POS.pricing in the prototype's pos-core.js.
const COUPONS: Record<string, number> = { SAVE10: 10 };

export function discountPercent(input: string): number {
  const raw = (input || "").trim();
  if (!raw) return 0;
  if (/^[\d.]+%?$/.test(raw)) return Math.min(100, Math.max(0, parseFloat(raw) || 0));
  return COUPONS[raw.toUpperCase()] || 0;
}

export interface CartLineInput {
  unitPrice: number;
  qty: number;
}

export function computeTotals(lines: CartLineInput[], discountInput: string, taxRatePct: number) {
  const subtotal = round2(lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0));
  const discount = round2((subtotal * discountPercent(discountInput)) / 100);
  const taxable = subtotal - discount;
  const tax = round2((taxable * (Number(taxRatePct) || 0)) / 100);
  const total = round2(taxable + tax);
  return { subtotal, discount, tax, total };
}
