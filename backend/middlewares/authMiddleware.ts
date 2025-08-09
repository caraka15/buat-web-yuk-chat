import { RouterContext } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { getUserIdFromHeader } from "../middlewares/auth.ts";

export async function authMiddleware(
  ctx: RouterContext<string, Record<string, string>, Record<string, unknown>>,
  next: () => Promise<unknown>
) {
  try {
    const authHeader = ctx.request.headers.get("Authorization");
    const userId = await getUserIdFromHeader(authHeader);
    ctx.state.userId = userId;
    await next();
  } catch (_e) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Unauthorized" };
  }
}
