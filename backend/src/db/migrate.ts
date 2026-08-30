import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { env } from "../config/env";

// Deliberately opens its own connection (with multipleStatements enabled,
// which the shared app pool does not use) rather than the pool in config/db —
// migrations run once, outside request handling.
async function migrate() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    multipleStatements: true
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const dir = path.join(__dirname, "migrations");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".sql")).sort();

  const [rows] = await connection.query<mysql.RowDataPacket[]>("SELECT filename FROM schema_migrations");
  const applied = new Set(rows.map(r => r.filename as string));

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    console.log(`Applying migration ${file}...`);
    await connection.query(sql);
    await connection.query("INSERT INTO schema_migrations (filename) VALUES (?)", [file]);
  }

  console.log("Migrations up to date.");
  await connection.end();
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
