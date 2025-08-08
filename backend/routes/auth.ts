import { Router } from "oak";
import { registerUser, loginUser } from "../services/authService.ts";

const authRouter = new Router();

authRouter.post("/register", async (context) => {
  const { name, email, password } = await context.request.body().value;
  if (!name || !email || !password) {
    context.response.status = 400;
    context.response.body = { error: "Name, email, and password are required" };
    return;
  }
  const userId = await registerUser(name, email, password);
  if (userId) {
    context.response.status = 201;
    context.response.body = { message: "User registered successfully", userId };
  } else {
    context.response.status = 400;
    context.response.body = {
      error: "Failed to register user. Email might already be in use.",
    };
  }
});

authRouter.post("/login", async (context) => {
  const { email, password } = await context.request.body().value;
  if (!email || !password) {
    context.response.status = 400;
    context.response.body = { error: "Email and password are required" };
    return;
  }

  try {
    const userData = await loginUser(email, password);
    context.response.status = 200;
    context.response.body = {
      message: "Login successful",
      ...userData, // spread object biar nggak nested
    };
  } catch {
    context.response.status = 401;
    context.response.body = { error: "Invalid credentials" };
  }
});

export default authRouter;
