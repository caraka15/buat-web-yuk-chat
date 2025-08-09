// routes/auth.ts
import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { registerUser, loginUser } from "../services/authService.ts";

const authRouter = new Router();

/**
 * Helper aman untuk baca JSON body
 */
async function readJson<T>(ctx: any): Promise<T> {
  try {
    return await ctx.request.body({ type: "json" }).value;
  } catch {
    throw Object.assign(new Error("Invalid JSON body"), { status: 400 });
  }
}

/**
 * POST /register
 * body: { name, email, password }
 */
authRouter.post("/register", async (ctx) => {
  try {
    const { name, email, password } = await readJson<{
      name: string;
      email: string;
      password: string;
    }>(ctx);

    if (!name || !email || !password) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Name, email, and password are required" };
      return;
    }

    const userId = await registerUser(name.trim(), email.trim(), password);
    ctx.response.status = 201;
    ctx.response.body = { message: "User registered successfully", userId };
  } catch (e) {
    const msg = (e as Error).message || "Internal Server Error";
    const status = (e as any).status;

    if (msg === "EMAIL_TAKEN") {
      ctx.response.status = 409; // Conflict
      ctx.response.body = { error: "Email already in use" };
      return;
    }
    if (status) {
      ctx.response.status = status;
      ctx.response.body = { error: msg };
      return;
    }

    console.error("[register] error:", e);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal Server Error" };
  }
});

/**
 * POST /login
 * body: { email, password }
 */
authRouter.post("/login", async (ctx) => {
  try {
    const { email, password } = await readJson<{
      email: string;
      password: string;
    }>(ctx);

    if (!email || !password) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Email and password are required" };
      return;
    }

    const userData = await loginUser(email.trim(), password);
    ctx.response.status = 200;
    ctx.response.body = {
      message: "Login successful",
      ...userData, // { id, name, email, token }
    };
  } catch (e) {
    const msg = (e as Error).message || "Invalid credentials";
    if (msg === "INVALID_CREDENTIALS") {
      ctx.response.status = 401;
      ctx.response.body = { error: "Invalid credentials" };
      return;
    }

    console.error("[login] error:", e);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal Server Error" };
  }
});

export default authRouter;
