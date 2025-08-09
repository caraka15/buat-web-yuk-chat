// backend/routes/adminOrders.ts
import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { query, execute } from "../db.ts";
import { verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;
const router = new Router();

// helper: verifikasi JWT dan cek role admin
async function requireAdmin(
  authHeader: string | null
): Promise<{ userId: string }> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split(" ")[1];
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const payload = (await verify(token, key)) as {
    userId: string;
    email: string;
    exp: number;
  };

  // cek is_admin dari DB
  const rows = await query<{ is_admin: number }>(
    "SELECT is_admin FROM users WHERE id = ? LIMIT 1",
    [payload.userId]
  );
  if (rows.length === 0) throw new Error("Unauthorized");
  if ((rows[0].is_admin ?? 0) !== 1) {
    const e = new Error("Forbidden");
    // @ts-ignore
    e.code = 403;
    throw e;
  }

  return { userId: payload.userId };
}

/**
 * GET /admin/orders
 * Mengembalikan SEMUA order (untuk admin) + email user
 */
router.get("/admin/orders", async (ctx) => {
  try {
    await requireAdmin(ctx.request.headers.get("Authorization"));

    const orders = await query<Record<string, unknown>>(
      `SELECT o.*, u.email AS user_email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );

    ctx.response.status = 200;
    ctx.response.body = orders;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if ((err as any).code === 403) {
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

/**
 * PUT /admin/orders/:id/status
 * Update status order oleh admin
 */
router.put("/admin/orders/:id/status", async (ctx) => {
  try {
    await requireAdmin(ctx.request.headers.get("Authorization"));

    const { id } = ctx.params as { id: string };
    const body = (await ctx.request.body({ type: "json" }).value) as {
      status: string;
    };

    if (!id || !body?.status) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing id or status" };
      return;
    }

    const result = await execute(
      "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?",
      [body.status, id]
    );
    if (!result.affectedRows) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Order not found" };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = { message: "Order status updated" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if ((err as any).code === 403) {
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

/**
 * PUT /admin/orders/:id/demo
 * Set / update demo_link. Default akan set status ke 'demo_ready' (bisa di-override).
 * Body: { demo_link: string, status?: string }
 */
router.put("/admin/orders/:id/demo", async (ctx) => {
  try {
    await requireAdmin(ctx.request.headers.get("Authorization"));

    const { id } = ctx.params as { id: string };
    const body = (await ctx.request.body({ type: "json" }).value) as {
      demo_link?: string;
      status?: string; // opsional, default 'demo_ready'
    };

    if (!id || !body?.demo_link) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing id or demo_link" };
      return;
    }

    const nextStatus = body.status ?? "demo_ready";
    const result = await execute(
      "UPDATE orders SET demo_link = ?, status = ?, updated_at = NOW() WHERE id = ?",
      [body.demo_link, nextStatus, id]
    );

    if (!result.affectedRows) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Order not found" };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = { message: "Demo link updated", status: nextStatus };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if ((err as any).code === 403) {
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

/**
 * PUT /admin/orders/:id/final
 * Set / update final_link. Tidak otomatis ubah status kecuali dikirim 'status' (mis. 'completed').
 * Body: { final_link: string, status?: string }
 */
router.put("/admin/orders/:id/final", async (ctx) => {
  try {
    await requireAdmin(ctx.request.headers.get("Authorization"));

    const { id } = ctx.params as { id: string };
    const body = (await ctx.request.body({ type: "json" }).value) as {
      final_link?: string;
      status?: string; // opsional, mis. 'completed'
    };

    if (!id || !body?.final_link) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing id or final_link" };
      return;
    }

    let result;
    if (body.status) {
      result = await execute(
        "UPDATE orders SET final_link = ?, status = ?, updated_at = NOW() WHERE id = ?",
        [body.final_link, body.status, id]
      );
    } else {
      result = await execute(
        "UPDATE orders SET final_link = ?, updated_at = NOW() WHERE id = ?",
        [body.final_link, id]
      );
    }

    if (!result.affectedRows) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Order not found" };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      message: "Final link updated",
      ...(body.status ? { status: body.status } : {}),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if ((err as any).code === 403) {
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
