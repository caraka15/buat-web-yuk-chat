import { verify } from "djwt"; // pastikan djwt terinstall
const JWT_SECRET = Deno.env.get("JWT_SECRET");

export const authMiddleware = async (context: any, next: any) => {
  const authHeader = context.request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    context.response.status = 401;
    context.response.body = { error: "Unauthorized" };
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    const payload = await verify(token, JWT_SECRET, "HS256");
    context.state.userId = payload.userId; // pastikan loginUser meng-encode userId
    await next();
  } catch {
    context.response.status = 401;
    context.response.body = { error: "Invalid or expired token" };
  }
};
