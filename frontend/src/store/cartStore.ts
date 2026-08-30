import { create } from "zustand";
import { Product } from "../types/domain";

export interface CartLine {
  id: number; // product id, or a negative synthetic id for manual lines
  name: string;
  unit: number;
  qty: number;
  productId: number | null;
  manual: boolean;
}

interface CartState {
  lines: CartLine[];
  customerId: number | null;
  discountInput: string;
  method: "cash" | "card" | "mobile_money";
  tendered: string;

  addProduct: (product: Product, qty?: number) => void;
  addManual: (description: string, price: number, qty: number) => void;
  step: (id: number, delta: number, cap?: number) => void;
  removeLine: (id: number) => void;
  setCustomerId: (id: number | null) => void;
  setDiscountInput: (v: string) => void;
  setMethod: (m: "cash" | "card" | "mobile_money") => void;
  setTendered: (v: string) => void;
  clear: () => void;
  count: () => number;
  toApiLines: () => Array<{ productId: number | null; name?: string; unitPrice?: number; qty: number }>;
}

// Client-side cart, exactly like the prototype's state.cart — only hits the
// API when the sale is charged (transactionsService.checkout).
export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  customerId: null,
  discountInput: "",
  method: "cash",
  tendered: "",

  addProduct(product, qty = 1) {
    set(s => {
      const want = Math.max(1, Math.floor(qty));
      const existing = s.lines.find(l => l.id === product.id);
      const cap = product.qty;
      if (existing) {
        const next = Math.min(cap, existing.qty + want);
        if (next === existing.qty) return s;
        return { lines: s.lines.map(l => (l.id === product.id ? { ...l, qty: next } : l)) };
      }
      if (cap < 1) return s;
      return {
        lines: [...s.lines, { id: product.id, name: product.name, unit: product.price, qty: Math.min(cap, want), productId: product.id, manual: false }]
      };
    });
  },

  addManual(description, price, qty) {
    set(s => ({
      lines: [...s.lines, { id: -Date.now(), name: description, unit: price, qty: Math.max(1, Math.floor(qty || 1)), productId: null, manual: true }]
    }));
  },

  step(id, delta, cap = 99) {
    set(s => ({
      lines: s.lines
        .map(l => (l.id === id ? { ...l, qty: Math.max(0, Math.min(cap, l.qty + delta)) } : l))
        .filter(l => l.qty > 0)
    }));
  },

  removeLine(id) {
    set(s => ({ lines: s.lines.filter(l => l.id !== id) }));
  },

  setCustomerId: id => set({ customerId: id }),
  setDiscountInput: v => set({ discountInput: v }),
  setMethod: m => set({ method: m }),
  setTendered: v => set({ tendered: v }),

  clear() {
    set({ lines: [], customerId: null, discountInput: "", tendered: "", method: "cash" });
  },

  count() {
    return get().lines.reduce((a, l) => a + l.qty, 0);
  },

  toApiLines() {
    return get().lines.map(l =>
      l.manual ? { productId: null, name: l.name, unitPrice: l.unit, qty: l.qty } : { productId: l.productId, qty: l.qty }
    );
  }
}));

export function lineTotal(line: CartLine): number {
  return line.unit * line.qty;
}
