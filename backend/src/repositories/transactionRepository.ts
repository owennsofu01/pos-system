import { RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import { pool } from "../config/db";
import { PaymentMethod, Transaction, TransactionLine, TransactionStatus } from "../types/domain";

interface TxRow extends RowDataPacket {
  id: number; receipt_no: string; occurred_date: string; occurred_time: string;
  cashier_id: number | null; cashier_name: string; method: PaymentMethod; status: TransactionStatus;
  subtotal: string; discount: string; tax: string; total: string; paid: string; change_due: string;
  customer_id: number | null; points_earned: number;
}
interface LineRow extends RowDataPacket {
  id: number; transaction_id: number; product_id: number | null; name: string;
  unit_price: string; qty: number; is_manual: number;
}

const TX_COLUMNS = `id, receipt_no, occurred_date, occurred_time, cashier_id, cashier_name, method, status,
  subtotal, discount, tax, total, paid, change_due, customer_id, points_earned`;

function toTransaction(r: TxRow, lines: TransactionLine[]): Transaction {
  return {
    id: r.id, receiptNo: r.receipt_no, date: r.occurred_date, time: r.occurred_time,
    cashierId: r.cashier_id, cashierName: r.cashier_name, method: r.method, status: r.status,
    subtotal: Number(r.subtotal), discount: Number(r.discount), tax: Number(r.tax), total: Number(r.total),
    paid: Number(r.paid), changeDue: Number(r.change_due), customerId: r.customer_id,
    pointsEarned: r.points_earned, lines
  };
}
function toLine(r: LineRow): TransactionLine {
  return { id: r.id, productId: r.product_id, name: r.name, unitPrice: Number(r.unit_price), qty: r.qty, isManual: !!r.is_manual };
}

async function attachLines(rows: TxRow[]): Promise<Transaction[]> {
  if (!rows.length) return [];
  const ids = rows.map(r => r.id);
  const [lineRows] = await pool.query<LineRow[]>(
    `SELECT id, transaction_id, product_id, name, unit_price, qty, is_manual FROM transaction_lines WHERE transaction_id IN (${ids.map(() => "?").join(",")})`,
    ids
  );
  const byTx = new Map<number, TransactionLine[]>();
  for (const lr of lineRows) {
    const list = byTx.get(lr.transaction_id) ?? [];
    list.push(toLine(lr));
    byTx.set(lr.transaction_id, list);
  }
  return rows.map(r => toTransaction(r, byTx.get(r.id) ?? []));
}

export const transactionRepository = {
  async findAll(): Promise<Transaction[]> {
    const [rows] = await pool.query<TxRow[]>(`SELECT ${TX_COLUMNS} FROM transactions ORDER BY id DESC`);
    return attachLines(rows);
  },

  async findById(id: number): Promise<Transaction | null> {
    const [rows] = await pool.query<TxRow[]>(`SELECT ${TX_COLUMNS} FROM transactions WHERE id = ? LIMIT 1`, [id]);
    if (!rows[0]) return null;
    return (await attachLines(rows))[0];
  },

  // All completed rows with lines — the shape reportService's ported
  // POS.reports.* functions expect to compute hourly/category/top-seller aggregates.
  async findCompletedWithLines(): Promise<Transaction[]> {
    const [rows] = await pool.query<TxRow[]>(`SELECT ${TX_COLUMNS} FROM transactions WHERE status = 'completed' ORDER BY id DESC`);
    return attachLines(rows);
  },

  async nextReceiptNoTx(conn: PoolConnection): Promise<string> {
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_no, 3) AS UNSIGNED)), 24806) AS max_num FROM transactions"
    );
    return `R-${Number(rows[0].max_num) + 1}`;
  },

  async createTx(conn: PoolConnection, data: Omit<Transaction, "id" | "lines">): Promise<number> {
    const [res]: any = await conn.query(
      `INSERT INTO transactions
        (receipt_no, occurred_date, occurred_time, cashier_id, cashier_name, method, status,
         subtotal, discount, tax, total, paid, change_due, customer_id, points_earned)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.receiptNo, data.date, data.time, data.cashierId, data.cashierName, data.method, data.status,
        data.subtotal, data.discount, data.tax, data.total, data.paid, data.changeDue, data.customerId, data.pointsEarned]
    );
    return res.insertId;
  },

  async insertLinesTx(conn: PoolConnection, transactionId: number, lines: TransactionLine[]): Promise<void> {
    for (const line of lines) {
      await conn.query(
        "INSERT INTO transaction_lines (transaction_id, product_id, name, unit_price, qty, is_manual) VALUES (?, ?, ?, ?, ?, ?)",
        [transactionId, line.productId, line.name, line.unitPrice, line.qty, line.isManual]
      );
    }
  },

  async markStatusTx(conn: PoolConnection, id: number, status: TransactionStatus): Promise<void> {
    await conn.query("UPDATE transactions SET status = ? WHERE id = ?", [status, id]);
  }
};
