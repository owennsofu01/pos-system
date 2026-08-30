import bcrypt from "bcrypt";
import { pool } from "../config/db";

// Recreates the exact sample state from the design prototype's pos-core.js
// (PRODUCTS/TRANSACTIONS/CUSTOMERS/STAFF/CHANNELS) so the app starts looking
// like the prototype on first run. Re-runnable: truncates in FK-safe order first.
async function seed() {
  const conn = await pool.getConnection();
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    for (const table of [
      "messages", "channels", "inventory_log", "transaction_lines", "transactions",
      "customers", "products", "email_settings", "settings", "staff"
    ]) {
      await conn.query(`TRUNCATE TABLE ${table}`);
    }
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");

    const passwordHash = await bcrypt.hash("till-2026", 10);
    const staff: Array<[string, string, string]> = [
      ["R. Vasquez", "r.vasquez@meridian.co", "manager"],
      ["D. Okafor", "d.okafor@meridian.co", "cashier"],
      ["A. Whitfield", "a.whitfield@meridian.co", "admin"],
      ["S. Pham", "s.pham@meridian.co", "viewer"]
    ];
    const staffIds: Record<string, number> = {};
    for (const [name, email, role] of staff) {
      const [res]: any = await conn.query(
        "INSERT INTO staff (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        [name, email, passwordHash, role]
      );
      staffIds[name] = res.insertId;
    }

    const products: Array<[string, string, string, number, number, number]> = [
      ["Hex Bolt M8 ×50", "FST-0801", "Fasteners", 0.65, 0.24, 480],
      ["Wood Screw #8 Box", "FST-1204", "Fasteners", 12.4, 6.1, 36],
      ["Anchor Set 12pc", "FST-2201", "Fasteners", 8.95, 3.7, 5],
      ["Claw Hammer 16oz", "TLS-1601", "Tools", 24.5, 11.8, 22],
      ["Tape Measure 8m", "TLS-0805", "Tools", 18.0, 7.9, 41],
      ["Cordless Driver 12V", "TLS-4412", "Tools", 129.0, 78.0, 7],
      ["Adjustable Wrench", "TLS-3302", "Tools", 21.75, 9.4, 18],
      ["Utility Knife", "TLS-0910", "Tools", 9.25, 3.2, 64],
      ["Conduit 20mm ×3m", "ELC-2003", "Electrical", 6.4, 2.6, 96],
      ["Junction Box", "ELC-1102", "Electrical", 4.8, 1.9, 3],
      ["LED Batten 4ft", "ELC-4004", "Electrical", 32.0, 17.5, 14],
      ["Cable 2.5mm ×10m", "ELC-2510", "Electrical", 22.9, 12.0, 27],
      ["Matt Emulsion 5L", "PNT-5001", "Paint", 38.5, 19.6, 12],
      ["Roller Kit 9in", "PNT-0909", "Paint", 14.2, 5.4, 30],
      ["Masking Tape 48mm", "PNT-4801", "Paint", 3.95, 1.2, 88],
      ["Brush Set 4pc", "PNT-0404", "Paint", 11.5, 4.3, 4]
    ];
    const productIds: Record<string, number> = {};
    for (const [name, sku, category, price, cost, qty] of products) {
      const [res]: any = await conn.query(
        "INSERT INTO products (name, sku, category, price, cost, qty) VALUES (?, ?, ?, ?, ?, ?)",
        [name, sku, category, price, cost, qty]
      );
      productIds[sku] = res.insertId;
    }

    const customers: Array<[string, string, string, number, number, number]> = [
      ["H. Lindqvist", "415 555 0188", "h.lindqvist@mail.com", 340, 12, 1284.5],
      ["Bay Fit-Out Ltd", "415 555 0231", "accounts@bayfitout.com", 1120, 31, 8940.2],
      ["M. Osei", "415 555 0104", "m.osei@mail.com", 85, 4, 312.75],
      ["T. Brennan", "415 555 0177", "tbrennan@mail.com", 0, 1, 42.1]
    ];
    for (const [name, phone, email, points, visits, spend] of customers) {
      await conn.query(
        "INSERT INTO customers (name, phone, email, points, visits, spend) VALUES (?, ?, ?, ?, ?, ?)",
        [name, phone, email, points, visits, spend]
      );
    }

    await conn.query(
      `INSERT INTO settings (id, business_name, business_type, tax_rate, currency, low_stock_threshold, points_per_unit, receipt_footer)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
      ["Meridian Supply", "Retail", 8.5, "USD", 6, 1, "Returns accepted within 30 days with this receipt."]
    );

    await conn.query(
      `INSERT INTO email_settings (id, from_name, from_address, reply_to, host, port, username, password_secret, security, subject_template, auto_send)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ["Meridian Supply", "receipts@meridian.co", "shop@meridian.co", "smtp.mailprovider.com", 587,
        "receipts@meridian.co", "", "TLS", "Your receipt from {business} — {receipt}", true]
    );

    type Line = { sku: string; qty: number; unit: number };
    type Tx = {
      id: string; date: string; time: string; cashier: string; method: string; status: string;
      lines: Line[]; subtotal: number; discount: number; tax: number; total: number; paid: number; change: number;
    };
    const transactions: Tx[] = [
      { id: "R-24807", date: "2026-08-25", time: "09:14", cashier: "R. Vasquez", method: "cash", status: "completed",
        lines: [{ sku: "TLS-1601", qty: 1, unit: 24.5 }, { sku: "PNT-4801", qty: 2, unit: 3.95 }],
        subtotal: 32.4, discount: 0, tax: 2.75, total: 35.15, paid: 40, change: 4.85 },
      { id: "R-24808", date: "2026-08-25", time: "10:02", cashier: "D. Okafor", method: "card", status: "completed",
        lines: [{ sku: "TLS-4412", qty: 1, unit: 129 }],
        subtotal: 129, discount: 12.9, tax: 9.86, total: 125.96, paid: 125.96, change: 0 },
      { id: "R-24809", date: "2026-08-25", time: "11:47", cashier: "R. Vasquez", method: "mobile_money", status: "refunded",
        lines: [{ sku: "PNT-5001", qty: 2, unit: 38.5 }],
        subtotal: 77, discount: 0, tax: 6.55, total: 83.55, paid: 83.55, change: 0 },
      { id: "R-24810", date: "2026-08-25", time: "12:23", cashier: "D. Okafor", method: "cash", status: "completed",
        lines: [{ sku: "ELC-2003", qty: 6, unit: 6.4 }, { sku: "ELC-1102", qty: 3, unit: 4.8 }],
        subtotal: 52.8, discount: 0, tax: 4.49, total: 57.29, paid: 60, change: 2.71 },
      { id: "R-24811", date: "2026-08-25", time: "13:05", cashier: "R. Vasquez", method: "card", status: "completed",
        lines: [{ sku: "TLS-0805", qty: 1, unit: 18 }, { sku: "TLS-0910", qty: 2, unit: 9.25 }],
        subtotal: 36.5, discount: 3.65, tax: 2.79, total: 35.64, paid: 35.64, change: 0 }
    ];
    for (const tx of transactions) {
      const [res]: any = await conn.query(
        `INSERT INTO transactions
          (receipt_no, occurred_date, occurred_time, cashier_id, cashier_name, method, status,
           subtotal, discount, tax, total, paid, change_due)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tx.id, tx.date, tx.time, staffIds[tx.cashier] ?? null, tx.cashier, tx.method, tx.status,
          tx.subtotal, tx.discount, tx.tax, tx.total, tx.paid, tx.change]
      );
      const txId = res.insertId;
      for (const line of tx.lines) {
        const productId = productIds[line.sku];
        const [prodRow]: any = await conn.query("SELECT name FROM products WHERE id = ?", [productId]);
        await conn.query(
          "INSERT INTO transaction_lines (transaction_id, product_id, name, unit_price, qty, is_manual) VALUES (?, ?, ?, ?, ?, 0)",
          [txId, productId, prodRow[0].name, line.unit, line.qty]
        );
      }
    }

    const log: Array<[string, number, string, string, string]> = [
      ["TLS-4412", -1, "sale", "R-24808", "10:02"],
      ["PNT-5001", 2, "purchase_return", "R-24809", "11:52"],
      ["FST-2201", -6, "adjustment", "Cycle count", "08:30"]
    ];
    for (const [sku, delta, type, reference, time] of log) {
      const productId = productIds[sku];
      const [prodRow]: any = await conn.query("SELECT name FROM products WHERE id = ?", [productId]);
      await conn.query(
        "INSERT INTO inventory_log (product_id, product_name, delta, type, reference, occurred_at) VALUES (?, ?, ?, ?, ?, TIMESTAMP(CURDATE(), ?))",
        [productId, prodRow[0].name, delta, type, reference, `${time}:00`]
      );
    }

    const channels: Array<{ id: string; name: string; kind: string; members: number; unread: number; messages: Array<[string, string, string]> }> = [
      { id: "floor", name: "Shop floor", kind: "channel", members: 6, unread: 2, messages: [
        ["D. Okafor", "12:41", "Till 2 is out of receipt paper, using the back roll."],
        ["A. Whitfield", "12:44", "Noted. New box is on the delivery due Thursday."],
        ["D. Okafor", "13:02", "Customer asking if the 12V driver comes with a spare battery?"]
      ] },
      { id: "managers", name: "Managers", kind: "channel", members: 3, unread: 1, messages: [
        ["A. Whitfield", "11:15", "Emulsion refund on R-24809 approved — logged against stock."],
        ["A. Whitfield", "11:16", "Watch the anchor sets, we are down to five."]
      ] },
      { id: "stock", name: "Stock room", kind: "channel", members: 4, unread: 0, messages: [
        ["S. Pham", "09:50", "Cycle count on fasteners done, adjustment posted."]
      ] },
      { id: "dm-okafor", name: "D. Okafor", kind: "direct", members: 2, unread: 0, messages: [
        ["D. Okafor", "10:05", "Can you approve a 10% trade discount for Bay Fit-Out?"],
        ["R. Vasquez", "10:07", "Yes — use SAVE10 on the basket and note it on the receipt."]
      ] }
    ];
    for (const c of channels) {
      await conn.query(
        "INSERT INTO channels (id, name, kind, member_count, unread) VALUES (?, ?, ?, ?, ?)",
        [c.id, c.name, c.kind, c.members, c.unread]
      );
      for (const [from, time, body] of c.messages) {
        await conn.query(
          "INSERT INTO messages (channel_id, from_name, body, occurred_at) VALUES (?, ?, ?, TIMESTAMP(CURDATE(), ?))",
          [c.id, from, body, `${time}:00`]
        );
      }
    }

    console.log("Seed complete.");
  } finally {
    conn.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
