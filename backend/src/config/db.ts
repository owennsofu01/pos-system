import mysql from "mysql2/promise";
import { env } from "./env";

// Single pool shared by every repository — mysql2 queues connections
// internally so this is safe under concurrent requests.
export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: false,
  dateStrings: true
});
