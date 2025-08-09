import { Application, Router } from "oak";
import { oakCors } from "https://deno.land/x/cors/mod.ts"; // <-- tambahkan ini
import "https://deno.land/std@0.224.0/dotenv/load.ts";

import authRouter from "./routes/auth.ts";
import orderRouter from "./routes/orders.ts";
import paymentRouter from "./routes/payments.ts";
import meRouter from "./routes/me.ts";
import adminOrdersRouter from "./routes/adminOrders.ts";

const PORT = Deno.env.get("PORT");

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

const allEnv = Deno.env.toObject();

// list key yang kamu definisikan di .env
const envKeys = [
  "FRONTEND_URL",
  "BACKEND_URL",
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "DB_PORT",
  "JWT_SECRET",
  "IPAYMU_API_KEY",
  "IPAYMU_API_URL",
  "IPAYMU_VA",
];

console.log("=== ENV dari .env ===");
for (const key of envKeys) {
  console.log(`${key} = ${allEnv[key] || "(tidak ada)"}`);
}

console.log(`Server running on port ${PORT}`);
await app.listen({ port: Number(PORT) });
