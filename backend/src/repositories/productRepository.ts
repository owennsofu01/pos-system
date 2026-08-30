import { RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import { pool } from "../config/db";
import { Product } from "../types/domain";

interface ProductRow extends RowDataPacket {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: string;
  cost: string;
  qty: number;
}

const toProduct = (r: ProductRow): Product => ({
  id: r.id, name: r.name, sku: r.sku, category: r.category,
  price: Number(r.price), cost: Number(r.cost), qty: r.qty
});

export const productRepository = {
  async findAll(): Promise<Product[]> {
    const [rows] = await pool.query<ProductRow[]>(
      "SELECT id, name, sku, category, price, cost, qty FROM products ORDER BY name ASC"
    );
    return rows.map(toProduct);
  },

  async findById(id: number): Promise<Product | null> {
    const [rows] = await pool.query<ProductRow[]>(
      "SELECT id, name, sku, category, price, cost, qty FROM products WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] ? toProduct(rows[0]) : null;
  },

  async findBySkuOrName(term: string): Promise<Product | null> {
    const [exact] = await pool.query<ProductRow[]>(
      "SELECT id, name, sku, category, price, cost, qty FROM products WHERE LOWER(sku) = LOWER(?) OR LOWER(name) = LOWER(?) LIMIT 1",
      [term, term]
    );
    if (exact[0]) return toProduct(exact[0]);
    const [prefix] = await pool.query<ProductRow[]>(
      "SELECT id, name, sku, category, price, cost, qty FROM products WHERE sku LIKE CONCAT(?, '%') OR name LIKE CONCAT(?, '%') LIMIT 1",
      [term, term]
    );
    return prefix[0] ? toProduct(prefix[0]) : null;
  },

  async create(data: Omit<Product, "id">): Promise<Product> {
    const [res]: any = await pool.query(
      "INSERT INTO products (name, sku, category, price, cost, qty) VALUES (?, ?, ?, ?, ?, ?)",
      [data.name, data.sku, data.category, data.price, data.cost, data.qty]
    );
    return { id: res.insertId, ...data };
  },

  async update(id: number, data: Omit<Product, "id">): Promise<void> {
    await pool.query(
      "UPDATE products SET name = ?, sku = ?, category = ?, price = ?, cost = ?, qty = ? WHERE id = ?",
      [data.name, data.sku, data.category, data.price, data.cost, data.qty, id]
    );
  },

  async remove(id: number): Promise<void> {
    await pool.query("DELETE FROM products WHERE id = ?", [id]);
  },

  // Used inside the checkout/refund/adjust DB transaction — takes the caller's
  // connection so the qty change commits (or rolls back) atomically with it.
  async adjustQtyTx(conn: PoolConnection, id: number, delta: number): Promise<void> {
    await conn.query("UPDATE products SET qty = GREATEST(0, qty + ?) WHERE id = ?", [delta, id]);
  }
};
