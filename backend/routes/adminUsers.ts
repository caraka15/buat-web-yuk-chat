import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { query, execute } from "../db.ts";
import { verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;
const router = new Router();

async function requireAdmin(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.split(" ")[1];
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const payload = (await verify(token, key)) as { userId: string };
  const rows = await query<{ is_admin: number }>(
    "SELECT is_admin FROM users WHERE id = ? LIMIT 1",
    [payload.userId],
  );
  if (rows.length === 0 || (rows[0].is_admin ?? 0) !== 1) {
    const e = new Error("Forbidden");
    // @ts-ignore
    e.code = rows.length === 0 ? 401 : 403;
    throw e;
  }
  return payload.userId;
}

router.get("/admin/users", async (ctx) => {
  try {
    await requireAdmin(ctx.request.headers.get("Authorization"));
    const users = await query<{
      id: string;
      name: string;
      email: string;
      is_admin: number;
      created_at: string;
    }>(
      "SELECT id, name, email, is_admin, created_at FROM users ORDER BY created_at DESC",
    );
    ctx.response.status = 200;
    ctx.response.body = users;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = (err as any).code;
    if (code === 403) {
      ctx.response.status = 403;
      ctx.response.body = { error: "Forbidden" };
      return;
    }
    ctx.response.status = msg === "Unauthorized" ? 401 : 500;
    ctx.response.body = {
      error: msg === "Unauthorized" ? "Unauthorized" : "Internal Server Error",
    };
  }
});

router.put("/admin/users/:id/role", async (ctx) => {
  try {
    await requireAdmin(ctx.request.headers.get("Authorization"));
    const { id } = ctx.params as { id: string };
    const body = (await ctx.request.body({ type: "json" }).value) as {
      is_admin?: number | boolean;
    };
    if (!id || typeof body.is_admin === "undefined") {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing id or is_admin" };
      return;
    }
    const value = body.is_admin ? 1 : 0;
    const result = await execute(
      "UPDATE users SET is_admin = ? WHERE id = ?",
      [value, id],
    );
    if (!result.affectedRows) {
      ctx.response.status = 404;
      ctx.response.body = { error: "User not found" };
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = { message: "User role updated" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = (err as any).code;
    if (code === 403) {
      ctx.response.status = 403;
      ctx.response.body = { error: "Forbidden" };
      return;
    }
    ctx.response.status = msg === "Unauthorized" ? 401 : 500;
    ctx.response.body = {
      error: msg === "Unauthorized" ? "Unauthorized" : "Internal Server Error",
    };
  }
});

export default router;
