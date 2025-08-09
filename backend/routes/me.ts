// routes/me.ts
import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { query } from "../db.ts";
import { verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;
const router = new Router();

router.get("/me", async (ctx) => {
  //   console.log(
  //     "[/me] hit",
  //     new Date().toISOString(),
  //     ctx.request.headers.get("authorization")?.slice(0, 20) + "..."
  //   );
  try {
    const auth = ctx.request.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Unauthorized" };
      return;
    }

    const token = auth.split(" ")[1];

    // Verify JWT
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

    // Ambil data user dari DB
    const [user] = await query<{
      id: string;
      name: string;
      email: string;
      is_admin: number;
      created_at: string;
    }>(
      "SELECT id, name, email, is_admin, created_at FROM users WHERE id = ? LIMIT 1",
      [payload.userId]
    );

    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: "User not found" };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin ?? 0,
      created_at: user.created_at,
    };
  } catch (_err) {
    // Biasanya error di sini karena token expired/invalid
    ctx.response.status = 401;
    ctx.response.body = { error: "The jwt is expired." };
  }
});

export default router;
