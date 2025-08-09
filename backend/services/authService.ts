// services/authService.ts
import { query, execute } from "../db.ts";
import { hash, compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { generateUuid } from "../utils/uuid.ts";

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at?: string;
}

async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}

/**
 * Register user baru
 * Throw "EMAIL_TAKEN" jika email sudah ada
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<string> {
  // Cek email sudah dipakai?
  const exists = await query<{ id: string }>(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  if (exists.length > 0) {
    // lempar code spesifik biar router bisa map ke 409
    const err: any = new Error("EMAIL_TAKEN");
    err.status = 409;
    throw err;
  }

  const id = generateUuid();
  const passwordHash = await hashPassword(password);

  const result = await execute(
    "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
    [id, name, email, passwordHash]
  );

  if (!result || !result.affectedRows || result.affectedRows === 0) {
    throw new Error("Failed to register user");
  }

  return id;
}

/**
 * Login user
 * Throw "INVALID_CREDENTIALS" jika email tidak ditemukan / password salah
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ id: string; name: string; email: string; token: string }> {
  const rows = await query<UserRow>(
    "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (rows.length === 0) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const user = rows[0];
  const ok = await compare(password, user.password_hash);
  if (!ok) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const jwtSecret = Deno.env.get("JWT_SECRET");
  if (!jwtSecret) {
    throw new Error("JWT secret not configured");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(jwtSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const token = await create(
    { alg: "HS256", typ: "JWT" },
    {
      userId: user.id,
      email: user.email,
      exp: getNumericDate(60 * 60), // 1 jam
    },
    key
  );

  return { id: user.id, name: user.name, email: user.email, token };
}
