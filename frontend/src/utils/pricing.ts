// Mirrors backend/src/utils/pricing.ts — used only for the live cart preview
// (subtotal/discount/tax/total shown before Charge is pressed). The server
// recomputes everything authoritatively at checkout.
const COUPONS: Record<string, number> = { SAVE10: 10 };

export function discountPercent(input: string): number {
  const raw = (input || "").trim();
  if (!raw) return 0;
  if (/^[\d.]+%?$/.test(raw)) return Math.min(100, Math.max(0, parseFloat(raw) || 0));
  return COUPONS[raw.toUpperCase()] || 0;
}

function round2(n: number): number {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function computeTotals(lines: Array<{ unit: number; qty: number }>, discountInput: string, taxRatePct: number) {
  const subtotal = round2(lines.reduce((sum, l) => sum + l.unit * l.qty, 0));
  const discount = round2((subtotal * discountPercent(discountInput)) / 100);
  const taxable = subtotal - discount;
  const tax = round2((taxable * (Number(taxRatePct) || 0)) / 100);
  const total = round2(taxable + tax);
  return { subtotal, discount, tax, total };
}
