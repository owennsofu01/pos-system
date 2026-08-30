import { CURRENCIES } from "../types/domain";

export function currencyFor(code: string) {
  return CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0];
}

export function formatMoney(amount: number, code: string): string {
  const c = currencyFor(code);
  const v = (Math.round((Number(amount) || 0) * 100) / 100).toFixed(c.code === "JPY" ? 0 : 2);
  return c.symbol + (c.space ? " " : "") + v;
}
