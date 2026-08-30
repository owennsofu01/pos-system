import { RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import { pool } from "../config/db";
import { Customer } from "../types/domain";

interface CustomerRow extends RowDataPacket {
  id: number;
  name: string;
  phone: string;
  email: string;
  points: number;
  visits: number;
  spend: string;
}

const toCustomer = (r: CustomerRow): Customer => ({
  id: r.id, name: r.name, phone: r.phone, email: r.email,
  points: r.points, visits: r.visits, spend: Number(r.spend)
});

export const customerRepository = {
  async findAll(): Promise<Customer[]> {
    const [rows] = await pool.query<CustomerRow[]>(
      "SELECT id, name, phone, email, points, visits, spend FROM customers ORDER BY name ASC"
    );
    return rows.map(toCustomer);
  },

  async findById(id: number): Promise<Customer | null> {
    const [rows] = await pool.query<CustomerRow[]>(
      "SELECT id, name, phone, email, points, visits, spend FROM customers WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] ? toCustomer(rows[0]) : null;
  },

  async create(data: Omit<Customer, "id" | "points" | "visits" | "spend">): Promise<Customer> {
    const [res]: any = await pool.query(
      "INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)",
      [data.name, data.phone, data.email]
    );
    return { id: res.insertId, ...data, points: 0, visits: 0, spend: 0 };
  },

  async remove(id: number): Promise<void> {
    await pool.query("DELETE FROM customers WHERE id = ?", [id]);
  },

  async creditLoyaltyTx(conn: PoolConnection, id: number, pointsEarned: number, total: number): Promise<void> {
    await conn.query(
      "UPDATE customers SET points = points + ?, visits = visits + 1, spend = spend + ? WHERE id = ?",
      [pointsEarned, total, id]
    );
  }
};
