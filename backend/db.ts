// db.ts
import { Client, ExecuteResult } from "https://deno.land/x/mysql/mod.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const client = await new Client().connect({
  hostname: Deno.env.get("DB_HOST") ?? "127.0.0.1",
  username: Deno.env.get("DB_USER") ?? "root",
  db: Deno.env.get("DB_NAME") ?? "shop",
  password: Deno.env.get("DB_PASSWORD") ?? "",
});

// Untuk SELECT
export async function query<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const rows = (await client.query(sql, params)) as T[];
  return rows;
}

// Untuk INSERT/UPDATE/DELETE
export async function execute(
  sql: string,
  params: unknown[] = []
): Promise<ExecuteResult> {
  const result = await client.execute(sql, params);
  return result;
}
