import { RowDataPacket } from "mysql2";
import { pool } from "../config/db";
import { EmailSecurity, EmailSettings, Settings } from "../types/domain";

interface SettingsRow extends RowDataPacket {
  business_name: string; business_type: string; tax_rate: string; currency: string;
  low_stock_threshold: number; points_per_unit: string; receipt_footer: string;
}
interface EmailRow extends RowDataPacket {
  from_name: string; from_address: string; reply_to: string; host: string; port: number;
  username: string; security: EmailSecurity; subject_template: string; auto_send: number;
}

const toSettings = (r: SettingsRow): Settings => ({
  businessName: r.business_name, businessType: r.business_type, taxRate: Number(r.tax_rate),
  currency: r.currency, lowStockThreshold: r.low_stock_threshold,
  pointsPerUnit: Number(r.points_per_unit), receiptFooter: r.receipt_footer
});

const toEmailSettings = (r: EmailRow): EmailSettings => ({
  fromName: r.from_name, fromAddress: r.from_address, replyTo: r.reply_to,
  host: r.host, port: r.port, username: r.username, security: r.security,
  subjectTemplate: r.subject_template, autoSend: !!r.auto_send
});

export const settingsRepository = {
  async get(): Promise<Settings> {
    const [rows] = await pool.query<SettingsRow[]>(
      "SELECT business_name, business_type, tax_rate, currency, low_stock_threshold, points_per_unit, receipt_footer FROM settings WHERE id = 1"
    );
    return toSettings(rows[0]);
  },

  async update(data: Settings): Promise<Settings> {
    await pool.query(
      `UPDATE settings SET business_name = ?, business_type = ?, tax_rate = ?, currency = ?,
        low_stock_threshold = ?, points_per_unit = ?, receipt_footer = ? WHERE id = 1`,
      [data.businessName, data.businessType, data.taxRate, data.currency, data.lowStockThreshold, data.pointsPerUnit, data.receiptFooter]
    );
    return data;
  },

  async getEmail(): Promise<EmailSettings> {
    const [rows] = await pool.query<EmailRow[]>(
      "SELECT from_name, from_address, reply_to, host, port, username, security, subject_template, auto_send FROM email_settings WHERE id = 1"
    );
    return toEmailSettings(rows[0]);
  },

  async updateEmail(data: EmailSettings): Promise<EmailSettings> {
    await pool.query(
      `UPDATE email_settings SET from_name = ?, from_address = ?, reply_to = ?, host = ?, port = ?,
        username = ?, security = ?, subject_template = ?, auto_send = ? WHERE id = 1`,
      [data.fromName, data.fromAddress, data.replyTo, data.host, data.port, data.username, data.security, data.subjectTemplate, data.autoSend]
    );
    return data;
  }
};
