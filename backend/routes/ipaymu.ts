import { Router } from "oak";
import { createIpaymuPayment } from "../services/ipaymuService.ts";
import { createPayment, updatePaymentStatus } from "../services/paymentService.ts";
import { updateOrderStatus } from "../services/orderService.ts";

const ipaymuRouter = new Router();

// Endpoint to initiate iPaymu payment
ipaymuRouter.post("/initiate", async (context) => {
  try {
    const { order_id, amount, payment_type, buyer_name, buyer_email, buyer_phone } = await context.request.body().value;

    // Determine return and notify URLs based on environment
    // In a real application, these should be configured securely
    const baseUrl = "http://localhost:8000"; // Your backend URL
    const frontendBaseUrl = "http://localhost:5173"; // Your frontend URL

    const returnUrl = `${frontendBaseUrl}/dashboard`;
    const notifyUrl = `${baseUrl}/api/ipaymu/callback`; // This backend's callback endpoint

    const ipaymuData = await createIpaymuPayment({
      order_id,
      amount,
      payment_type,
      buyer_name,
      buyer_email,
      buyer_phone,
      returnUrl,
      notifyUrl,
    });

    // Save payment details to your database
    await createPayment({
      order_id,
      amount,
      payment_type,
      ipaymu_session_id: ipaymuData.SessionId,
      ipaymu_transaction_id: ipaymuData.TransactionId,
      payment_url: ipaymuData.Url,
      va_number: ipaymuData.Via || null,
      status: 'pending',
    });

    // Update order status
    const newOrderStatus = payment_type === 'dp' ? 'pending_dp_payment' : 'pending_full_payment';
    await updateOrderStatus(order_id, newOrderStatus);

    context.response.status = 200;
    context.response.body = {
      paymentUrl: ipaymuData.Url,
      vaNumber: ipaymuData.Via || null,
      sessionId: ipaymuData.SessionId,
    };
  } catch (error) {
    console.error("Error initiating iPaymu payment:", error);
    context.response.status = 500;
    context.response.body = { error: error.message };
  }
});

// Endpoint for iPaymu callback/notification
ipaymuRouter.post("/callback", async (context) => {
  try {
    let callbackData;
    const contentType = context.request.headers.get("content-type");

    if (contentType && contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await context.request.body({ type: "form" }).value;
      callbackData = Object.fromEntries(formData.entries());
    } else {
      callbackData = await context.request.body({ type: "json" }).value;
    }

    console.log("iPaymu callback received:", callbackData);

    const { sid, status, reference_id, trx_id } = callbackData;

    if (!sid) {
      throw new Error("Session ID not found in callback");
    }

    const paymentStatus = status === 'berhasil' ? 'completed' : 'failed';
    const updated = await updatePaymentStatus(sid, paymentStatus);

    if (updated) {
      // Optionally, fetch payment and order details to update order status
      // This would require fetching the payment by session ID and then the order by order_id
      // For simplicity, we'll just update payment status here.
      context.response.status = 200;
      context.response.body = { message: "Callback processed successfully" };
    } else {
      context.response.status = 400;
      context.response.body = { error: "Failed to update payment status from callback" };
    }
  } catch (error) {
    console.error("Error processing iPaymu callback:", error);
    context.response.status = 500;
    context.response.body = { error: error.message };
  }
});

export default ipaymuRouter;
