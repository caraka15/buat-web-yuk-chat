// backend/routes/orders.ts
import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { createOrder, getOrdersByUserId } from "../services/orderService.ts";
import { getUserIdFromHeader } from "../middlewares/auth.ts";

const router = new Router();

router
  // CREATE order (user)
  .post("/orders", async (ctx) => {
    try {
      const authHeader = ctx.request.headers.get("Authorization");
      const userId = await getUserIdFromHeader(authHeader);

      const { service_type, description, budget } = await ctx.request.body({
        type: "json",
      }).value;

      const result = await createOrder(userId, {
        service_type,
        description,
        budget: Number(budget),
      });

      ctx.response.status = 201;
      ctx.response.body = result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ctx.response.status = err.message === "Unauthorized" ? 401 : 500;
      ctx.response.body = { error: err.message };
    }
  })

  // LIST orders milik user (final_link akan dimasking jika belum completed)
  .get("/orders", async (ctx) => {
    try {
      const authHeader = ctx.request.headers.get("Authorization");
      const userId = await getUserIdFromHeader(authHeader);

      const orders = await getOrdersByUserId(userId);
      ctx.response.status = 200;
      ctx.response.body = orders;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ctx.response.status = err.message === "Unauthorized" ? 401 : 500;
      ctx.response.body = { error: err.message };
    }
  });

export default router;
