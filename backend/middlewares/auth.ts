import { verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;

export async function getUserIdFromHeader(
  authorization: string | null
): Promise<string> {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authorization.split(" ")[1];

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const payload = (await verify(token, key)) as { userId: string };

  return payload.userId;
}
