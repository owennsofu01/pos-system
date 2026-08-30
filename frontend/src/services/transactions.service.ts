import { api, unwrap } from "./api";
import { PaymentMethod, Transaction } from "../types/domain";

export interface CheckoutLineInput {
  productId: number | null;
  name?: string;
  unitPrice?: number;
  qty: number;
}

export interface CheckoutInput {
  lines: CheckoutLineInput[];
  discountInput: string;
  method: PaymentMethod;
  tendered?: number;
  customerId: number | null;
}

export const transactionsService = {
  list: () => unwrap<Transaction[]>(api.get("/transactions")),
  get: (id: number) => unwrap<Transaction>(api.get(`/transactions/${id}`)),
  checkout: (input: CheckoutInput) => unwrap<Transaction>(api.post("/transactions/checkout", input)),
  refund: (id: number) => unwrap<Transaction>(api.post(`/transactions/${id}/refund`))
};
