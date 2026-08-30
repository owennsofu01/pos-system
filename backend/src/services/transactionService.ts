import { pool } from "../config/db";
import { transactionRepository } from "../repositories/transactionRepository";
import { productRepository } from "../repositories/productRepository";
import { customerRepository } from "../repositories/customerRepository";
import { inventoryRepository } from "../repositories/inventoryRepository";
import { settingsRepository } from "../repositories/settingsRepository";
import { AppError } from "../utils/AppError";
import { computeTotals } from "../utils/pricing";
import { round2 } from "../utils/money";
import { PaymentMethod, Transaction, TransactionLine } from "../types/domain";

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
  cashierId: number;
  cashierName: string;
}

export const transactionService = {
  list: (): Promise<Transaction[]> => transactionRepository.findAll(),
  get: (id: number): Promise<Transaction | null> => transactionRepository.findById(id),

  async checkout(input: CheckoutInput): Promise<Transaction> {
    if (!input.lines.length) throw AppError.badRequest("Cart is empty.");

    // Resolve each line against the current catalog so price/name/stock are
    // authoritative from the server, not whatever the client cached.
    const resolvedLines: TransactionLine[] = [];
    for (const line of input.lines) {
      if (line.productId) {
        const product = await productRepository.findById(line.productId);
        if (!product) throw AppError.badRequest(`Product ${line.productId} no longer exists.`);
        if (product.qty < line.qty) throw AppError.conflict(`Only ${product.qty} of "${product.name}" left in stock.`);
        resolvedLines.push({ productId: product.id, name: product.name, unitPrice: product.price, qty: line.qty, isManual: false });
      } else {
        if (!line.name || !(Number(line.unitPrice) > 0)) throw AppError.badRequest("Manual lines need a description and a price.");
        resolvedLines.push({ productId: null, name: line.name, unitPrice: round2(line.unitPrice!), qty: line.qty, isManual: true });
      }
    }

    const settings = await settingsRepository.get();
    const totals = computeTotals(resolvedLines.map(l => ({ unitPrice: l.unitPrice, qty: l.qty })), input.discountInput, settings.taxRate);
    const paid = input.method === "cash" ? round2(Number(input.tendered) || 0) : totals.total;
    if (paid + 0.001 < totals.total) throw AppError.badRequest("Payment is short of the total.");

    const pointsEarned = input.customerId ? Math.floor(totals.total * (Number(settings.pointsPerUnit) || 0)) : 0;
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const receiptNo = await transactionRepository.nextReceiptNoTx(conn);
      const txId = await transactionRepository.createTx(conn, {
        receiptNo, date, time, cashierId: input.cashierId, cashierName: input.cashierName,
        method: input.method, status: "completed",
        subtotal: totals.subtotal, discount: totals.discount, tax: totals.tax, total: totals.total,
        paid, changeDue: round2(paid - totals.total), customerId: input.customerId, pointsEarned
      });
      await transactionRepository.insertLinesTx(conn, txId, resolvedLines);

      for (const line of resolvedLines) {
        if (!line.productId) continue;
        await productRepository.adjustQtyTx(conn, line.productId, -line.qty);
      }
      await inventoryRepository.logManyForLinesTx(conn, resolvedLines, "sale", receiptNo, -1);

      if (input.customerId) {
        await customerRepository.creditLoyaltyTx(conn, input.customerId, pointsEarned, totals.total);
      }

      await conn.commit();
      return (await transactionRepository.findById(txId))!;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async refund(id: number): Promise<Transaction> {
    const tx = await transactionRepository.findById(id);
    if (!tx) throw AppError.notFound("Transaction not found.");
    if (tx.status === "refunded") throw AppError.badRequest("Transaction is already refunded.");

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await transactionRepository.markStatusTx(conn, id, "refunded");
      for (const line of tx.lines) {
        if (!line.productId) continue;
        await productRepository.adjustQtyTx(conn, line.productId, line.qty);
      }
      await inventoryRepository.logManyForLinesTx(conn, tx.lines, "purchase_return", tx.receiptNo, 1);
      await conn.commit();
      return (await transactionRepository.findById(id))!;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
};
