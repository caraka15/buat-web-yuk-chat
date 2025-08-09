// backend/utils/uuid.ts

// UUID dari Web Crypto API (default bawaan browser / Deno)
export function generateUuid(): string {
  return crypto.randomUUID();
}
