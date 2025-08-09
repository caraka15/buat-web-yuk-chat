import { Application, Router } from "oak";
import { oakCors } from "https://deno.land/x/cors/mod.ts"; // <-- tambahkan ini

import authRouter from "./routes/auth.ts";
import orderRouter from "./routes/orders.ts";
import paymentRouter from "./routes/payments.ts";
import meRouter from "./routes/me.ts";
import adminOrdersRouter from "./routes/adminOrders.ts";

const PORT = 8000;

const app = new Application();
const router = new Router();

// 🔹 Middleware CORS - letakkan PALING ATAS
app.use(
  oakCors({
    origin: Deno.env.get("FRONTEND_URL"),
    credentials: true,
  })
);

app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.response.status === 404 && !ctx.response.body) {
      ctx.response.body = { error: "Not Found" };
    }
  } catch (err) {
    const status = (err as any).status ?? 500;
    const message = (err as Error).message ?? "Internal Server Error";
    ctx.response.status = status;
    ctx.response.body = { error: message };
    console.error("[ERROR]", status, message);
  }
});

router.get("/", (context) => {
  context.response.body = "Welcome to the API!";
});

app.use(adminOrdersRouter.routes());
app.use(adminOrdersRouter.allowedMethods());

app.use(meRouter.routes());
app.use(meRouter.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

app.use(orderRouter.routes());
app.use(orderRouter.allowedMethods());

app.use(paymentRouter.routes());
app.use(paymentRouter.allowedMethods());

console.log(`Server running on port ${PORT}`);
await app.listen({ port: Number(PORT) });
