import { RowDataPacket } from "mysql2";
import { pool } from "../config/db";
import { Staff, StaffWithPasswordHash } from "../types/domain";
import { Role } from "../types/roles";

interface StaffRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  created_at: string;
}

const toStaff = (r: StaffRow): Staff => ({ id: r.id, name: r.name, email: r.email, role: r.role, createdAt: r.created_at });
const toStaffWithHash = (r: StaffRow): StaffWithPasswordHash => ({ ...toStaff(r), passwordHash: r.password_hash });

export const staffRepository = {
  async findAll(): Promise<Staff[]> {
    const [rows] = await pool.query<StaffRow[]>("SELECT id, name, email, password_hash, role, created_at FROM staff ORDER BY id ASC");
    return rows.map(toStaff);
  },

  async findByEmail(email: string): Promise<StaffWithPasswordHash | null> {
    const [rows] = await pool.query<StaffRow[]>(
      "SELECT id, name, email, password_hash, role, created_at FROM staff WHERE email = ? LIMIT 1",
      [email]
    );
    return rows[0] ? toStaffWithHash(rows[0]) : null;
  },

  async findById(id: number): Promise<Staff | null> {
    const [rows] = await pool.query<StaffRow[]>(
      "SELECT id, name, email, password_hash, role, created_at FROM staff WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] ? toStaff(rows[0]) : null;
  },

  async create(name: string, email: string, passwordHash: string, role: Role): Promise<Staff> {
    const [res]: any = await pool.query(
      "INSERT INTO staff (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, passwordHash, role]
    );
    return { id: res.insertId, name, email, role, createdAt: new Date().toISOString() };
  },

  async remove(id: number): Promise<void> {
    await pool.query("DELETE FROM staff WHERE id = ?", [id]);
  }
};
