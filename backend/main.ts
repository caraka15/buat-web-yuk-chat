import { Application, Router } from "oak";
import { oakCors } from "https://deno.land/x/cors/mod.ts"; // <-- tambahkan ini

import authRouter from "./routes/auth.ts";
import orderRouter from "./routes/orders.ts";
import paymentRouter from "./routes/payments.ts";
import ipaymuRouter from "./routes/ipaymu.ts";

const PORT = 8000;

const app = new Application();
const router = new Router();

// 🔹 Middleware CORS - letakkan PALING ATAS
app.use(
  oakCors({
    origin: "http://localhost:8080", // Vite dev server
    credentials: true,
  })
);

router.get("/", (context) => {
  context.response.body = "Welcome to the API!";
});

app.use(router.routes());
app.use(router.allowedMethods());

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

app.use(orderRouter.routes());
app.use(orderRouter.allowedMethods());

app.use(paymentRouter.routes());
app.use(paymentRouter.allowedMethods());

app.use(ipaymuRouter.routes());
app.use(ipaymuRouter.allowedMethods());

console.log(`Server running on port ${PORT}`);
await app.listen({ port: Number(PORT) });
