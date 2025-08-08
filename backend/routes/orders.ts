import { Router } from "oak";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import {
  createOrder,
  getOrderById,
  getOrdersByUserId,
  updateOrderStatus,
  getAllOrders,
} from "../services/orderService.ts";

const ordersRouter = new Router();

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

// Middleware for admin authorization (simplified for now)
const adminMiddleware = async (context: any, next: any) => {
  // In a real app, verify JWT and check if user is admin
  // For now, we'll just assume admin for testing
  const isAdmin = true; // Replace with actual admin check
  if (!isAdmin) {
    context.response.status = 403;
    context.response.body = { error: "Forbidden" };
    return;
  }
  await next();
};

ordersRouter.post("/", authMiddleware, async (context) => {
  const { service_type, description, budget, status } =
    await context.request.body().value;

  if (!service_type || !description || !budget) {
    context.response.status = 400;
    context.response.body = { error: "Missing required fields" };
    return;
  }

  const orderId = await createOrder(
    context.state.userId,
    service_type,
    description,
    budget,
    status
  );

  if (orderId) {
    context.response.status = 201;
    context.response.body = { message: "Order created successfully", orderId };
  } else {
    context.response.status = 400;
    context.response.body = { error: "Failed to create order" };
  }
});

ordersRouter.get("/:id", authMiddleware, async (context) => {
  const order = await getOrderById(context.params.id);
  if (order) {
    context.response.status = 200;
    context.response.body = order;
  } else {
    context.response.status = 404;
    context.response.body = { error: "Order not found" };
  }
});

ordersRouter.get("/user/:userId", authMiddleware, async (context) => {
  const orders = await getOrdersByUserId(context.params.userId);
  context.response.status = 200;
  context.response.body = orders;
});

ordersRouter.put("/:id/status", adminMiddleware, async (context) => {
  const { status } = await context.request.body().value;
  const updated = await updateOrderStatus(context.params.id, status);
  if (updated) {
    context.response.status = 200;
    context.response.body = { message: "Order status updated successfully" };
  } else {
    context.response.status = 400;
    context.response.body = { error: "Failed to update order status" };
  }
});

ordersRouter.get("/", adminMiddleware, async (context) => {
  const orders = await getAllOrders();
  context.response.status = 200;
  context.response.body = orders;
});

export default ordersRouter;
