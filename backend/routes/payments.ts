// routes/payment.ts
import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { query, execute } from "../db.ts";
import { createHash, createHmac } from "node:crypto";
import { Buffer } from "node:buffer";
import {
  createPayment,
  updatePaymentByOrder,
  getPaymentsByUserId,
} from "../services/paymentService.ts";
import { getUserIdFromHeader } from "../middlewares/auth.ts";

const router = new Router();

const IPAYMU_URL = Deno.env.get("IPAYMU_API_URL")!;
const IPAYMU_VA = Deno.env.get("IPAYMU_VA")!;
const IPAYMU_API_KEY = Deno.env.get("IPAYMU_API_KEY")!;

function getTimestamp(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const h = date.getHours().toString().padStart(2, "0");
  const i = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");
  return `${y}${m}${d}${h}${i}${s}`;
}

function generateSignature(
  data: any,
  credentials: { va: string; apiKey: string }
): string {
  const body = JSON.stringify(data);
  const bodyHash = createHash("sha256")
    .update(body)
    .digest("hex")
    .toLowerCase();
  const stringToSign = `POST:${credentials.va}:${bodyHash}:${credentials.apiKey}`;
  const hmac = createHmac("sha256", credentials.apiKey);
  return hmac.update(Buffer.from(stringToSign, "utf-8")).digest("hex");
}

router.get("/payments", async (ctx) => {
  try {
    const authHeader = ctx.request.headers.get("Authorization");
    const userId = await getUserIdFromHeader(authHeader);
    const payments = await getPaymentsByUserId(userId);
    ctx.response.status = 200;
    ctx.response.body = payments;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ctx.response.status = message === "Unauthorized" ? 401 : 500;
    ctx.response.body = { error: message };
  }
});

router.post("/payment-dp", async (ctx) => {
  try {
    const { order_id } = await ctx.request.body({ type: "json" }).value;

    const [order] = await query<{
      id: string;
      service_type: string;
      budget: number;
      name: string;
      email: string;
    }>(
      "SELECT o.id, o.service_type, o.budget, u.name, u.email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?",
      [order_id]
    );

    if (!order) throw new Error("Order not found");

    const dpAmount = Math.floor(order.budget * 0.1);
    const product = [`DP - ${order.service_type}`];
    const qty = ["1"];
    const price = [dpAmount.toString()];

    const payload = {
      product,
      qty,
      price,
      returnUrl: `${Deno.env.get("FRONTEND_URL")}/dashboard`,
      notifyUrl: `${Deno.env.get("BACKEND_URL")}/api/payment/callback-dp`,
      cancelUrl: `${Deno.env.get("FRONTEND_URL")}/order/${order_id}/cancel`,
      referenceId: order_id,
      buyerName: order.name,
      buyerEmail: order.email,
    };

    const signature = generateSignature(payload, {
      va: IPAYMU_VA,
      apiKey: IPAYMU_API_KEY,
    });
    const timestamp = getTimestamp();

    const response = await fetch(IPAYMU_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        va: IPAYMU_VA,
        signature,
        timestamp,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.Status !== 200 || !data.Data?.SessionID || !data.Data?.Url) {
      throw new Error("iPaymu Error: " + (data?.Message || "Unknown"));
    }
    await createPayment({
      order_id,
      payment_type: "dp",
      amount: dpAmount,
      ipaymu_session_id: data.Data.SessionID,
      payment_url: data.Data.Url,
    });

    ctx.response.status = 200;
    ctx.response.body = {
      sessionId: data.Data.SessionID,
      paymentUrl: data.Data.Url,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    ctx.response.status = 500;
    ctx.response.body = { error: message };
  }
});

router.post("/payment-full", async (ctx) => {
  try {
    const { order_id } = await ctx.request.body({ type: "json" }).value;

    const [order] = await query<{
      id: string;
      service_type: string;
      budget: number;
      name: string;
      email: string;
    }>(
      "SELECT o.id, o.service_type, o.budget, u.name, u.email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?",
      [order_id]
    );

    if (!order) throw new Error("Order not found");

    const fullAmount = Math.floor(order.budget * 0.9);
    const product = [`Pelunasan - ${order.service_type}`];
    const qty = ["1"];
    const price = [fullAmount.toString()];

    const payload = {
      product,
      qty,
      price,
      returnUrl: `${Deno.env.get("FRONTEND_URL")}/dashboard`,
      notifyUrl: `${Deno.env.get("BACKEND_URL")}/api/payment/callback-full`,
      cancelUrl: `${Deno.env.get("FRONTEND_URL")}/order/${order_id}/cancel`,
      referenceId: order_id,
      buyerName: order.name,
      buyerEmail: order.email,
    };

    const signature = generateSignature(payload, {
      va: IPAYMU_VA,
      apiKey: IPAYMU_API_KEY,
    });
    const timestamp = getTimestamp();

    const response = await fetch(IPAYMU_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        va: IPAYMU_VA,
        signature,
        timestamp,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.Status !== 200 || !data.Data?.SessionID || !data.Data?.Url) {
      throw new Error("iPaymu Error: " + (data?.Message || "Unknown"));
    }
    await createPayment({
      order_id,
      payment_type: "full",
      amount: fullAmount,
      ipaymu_session_id: data.Data.SessionID,
      payment_url: data.Data.Url,
    });

    ctx.response.status = 200;
    ctx.response.body = {
      sessionId: data.Data.SessionID,
      paymentUrl: data.Data.Url,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    ctx.response.status = 500;
    ctx.response.body = { error: message };
  }
});

router.post("/api/payment/callback-dp", async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "form" }).value;
    const referenceId = body.get("reference_id");
    const status = body.get("status");

    if (!referenceId || !status) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing reference_id or status" };
      return;
    }

    const newStatus =
      status === "berhasil" ? "pending_approval" : "pending_dp_payment";

    await execute("UPDATE orders SET status = ? WHERE id = ?", [
      newStatus,
      referenceId,
    ]);

    const paymentStatus = status === "berhasil" ? "success" : "failed";
    const trxId = body.get("trx_id");
    await updatePaymentByOrder(referenceId, "dp", paymentStatus, trxId);

    ctx.response.status = 200;
    ctx.response.body = "Callback received";
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: (error as Error).message };
  }
});

router.post("/api/payment/callback-full", async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "form" }).value;
    const referenceId = body.get("reference_id");
    const status = body.get("status");

    if (!referenceId || !status) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing reference_id or status" };
      return;
    }

    const newStatus = status === "berhasil" ? "completed" : "demo_ready";

    await execute("UPDATE orders SET status = ? WHERE id = ?", [
      newStatus,
      referenceId,
    ]);

    const paymentStatus = status === "berhasil" ? "success" : "failed";
    const trxId = body.get("trx_id");
    await updatePaymentByOrder(referenceId, "full", paymentStatus, trxId);

    ctx.response.status = 200;
    ctx.response.body = "Callback received";
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: (error as Error).message };
  }
});
export default router;
