import { RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import { pool } from "../config/db";
import { InventoryLogEntry, InventoryLogType, TransactionLine } from "../types/domain";

interface LogRow extends RowDataPacket {
  id: number;
  product_id: number | null;
  product_name: string;
  delta: number;
  type: InventoryLogType;
  reference: string;
  occurred_at: string;
}

const toEntry = (r: LogRow): InventoryLogEntry => ({
  id: r.id, productId: r.product_id, productName: r.product_name,
  delta: r.delta, type: r.type, reference: r.reference, occurredAt: r.occurred_at
});

export const inventoryRepository = {
  async recent(limit: number): Promise<InventoryLogEntry[]> {
    const [rows] = await pool.query<LogRow[]>(
      "SELECT id, product_id, product_name, delta, type, reference, occurred_at FROM inventory_log ORDER BY occurred_at DESC, id DESC LIMIT ?",
      [limit]
    );
    return rows.map(toEntry);
  },

  async logTx(conn: PoolConnection, productId: number | null, productName: string, delta: number, type: InventoryLogType, reference: string): Promise<void> {
    await conn.query(
      "INSERT INTO inventory_log (product_id, product_name, delta, type, reference) VALUES (?, ?, ?, ?, ?)",
      [productId, productName, delta, type, reference]
    );
  },

  async logManyForLinesTx(conn: PoolConnection, lines: TransactionLine[], type: InventoryLogType, reference: string, sign: 1 | -1): Promise<void> {
    for (const line of lines) {
      if (!line.productId) continue; // manual/off-catalog lines aren't tracked against stock
      await inventoryRepository.logTx(conn, line.productId, line.name, sign * line.qty, type, reference);
    }
  },

  async adjustSingle(productId: number, delta: number, productName: string): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("UPDATE products SET qty = GREATEST(0, qty + ?) WHERE id = ?", [delta, productId]);
      await inventoryRepository.logTx(conn, productId, productName, delta, "adjustment", "Manual");
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
};
