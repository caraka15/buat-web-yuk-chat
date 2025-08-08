import { query, execute } from "../db.ts";
import { hash, compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt/mod.ts";
import { generateUuid } from "../utils/uuid.ts";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: string;
}

// Hash password
async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}

// Registrasi user baru
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<string | null> {
  const existingUser = await query<User>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (existingUser.length > 0) {
    throw new Error("Email already in use");
  }

  const id = generateUuid();
  const hashedPassword = await hashPassword(password);

  const result = await execute(
    "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
    [id, name, email, hashedPassword]
  );

  // Kalau insert gagal
  if (!result || result.affectedRows === 0) {
    throw new Error("Failed to register user");
  }

  return id;
}

const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-256" },
  true,
  ["sign", "verify"]
);

export async function loginUser(
  email: string,
  password: string
): Promise<{ id: string; name: string; email: string; token: string }> {
  // Ambil user berdasarkan email
  const users = await query("SELECT * FROM users WHERE email = ?", [email]);

  if (users.length === 0) {
    throw new Error("Invalid credentials");
  }

  // Karena kita tidak pakai type, cast manual
  const user = users[0] as {
    id: string;
    name: string;
    email: string;
    password_hash: string;
  };

  // Cek password
  const passwordMatch = await compare(password, user.password_hash);
  if (!passwordMatch) {
    throw new Error("Invalid credentials");
  }

  // Buat JWT token
  const token = await create(
    { alg: "HS256", typ: "JWT" },
    {
      id: user.id,
      email: user.email,
      exp: getNumericDate(60 * 60), // 1 jam
    },
    key
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    token: token,
  };
}
