import { Pool } from "pg";
import dotenv from "dotenv";

// Reads DB_HOST, DB_PORT, DB_NAME, DB_USER and DB_PASSWORD from the .env file
dotenv.config();

// One shared connection pool for the whole application
export const pool = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? "svt_project_db",
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD,
});

// Returns the PostgreSQL version text; fails if the database cannot be reached
export async function testConnection(): Promise<string> {
  const result = await pool.query<{ version: string }>("SELECT version()");
  return result.rows[0].version;
}
