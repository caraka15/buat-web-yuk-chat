import { Router } from "oak";
import { createPayment, updatePaymentStatus, getPaymentBySessionId } from "../services/paymentService.ts";

const paymentsRouter = new Router();

// Middleware for authentication (simplified for now)
const authMiddleware = async (context: any, next: any) => {
  const authHeader = context.request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    context.response.status = 401;
    context.response.body = { error: "Unauthorized" };
    return;
  }
  // In a real app, verify JWT and extract user ID
  // For now, we'll just assume a user ID for testing
  context.state.userId = "some-test-user-id"; // Replace with actual user ID from JWT
  await next();
};

paymentsRouter.post("/", authMiddleware, async (context) => {
  const paymentData = await context.request.body().value;
  const paymentId = await createPayment(paymentData);
  if (paymentId) {
    context.response.status = 201;
    context.response.body = { message: "Payment created successfully", paymentId };
  } else {
    context.response.status = 400;
    context.response.body = { error: "Failed to create payment" };
  }
});

paymentsRouter.put("/:sessionId/status", async (context) => {
  const { status } = await context.request.body().value;
  const updated = await updatePaymentStatus(context.params.sessionId, status);
  if (updated) {
    context.response.status = 200;
    context.response.body = { message: "Payment status updated successfully" };
  } else {
    context.response.status = 400;
    context.response.body = { error: "Failed to update payment status" };
  }
});

export default paymentsRouter;
