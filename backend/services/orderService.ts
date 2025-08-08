import { query, execute } from "../db.ts";

interface Order {
  id: number;
  user_id: number; // Added user_id
  status: string;
  total_price: number;
  created_at: string;
}

// Ambil semua order
export async function getAllOrders(): Promise<Order[]> {
  return await query<Order>("SELECT * FROM orders ORDER BY created_at DESC");
}

// Ambil order berdasarkan ID
export async function getOrderById(orderId: number): Promise<Order | null> {
  const rows = await query<Order>("SELECT id, user_id, status, total_price, created_at FROM orders WHERE id = ?", [
    orderId,
  ]);
  return rows.length > 0 ? rows[0] : null;
}

// Ambil order berdasarkan user
export async function getOrdersByUserId(userId: number): Promise<Order[]> {
  return await query<Order>("SELECT * FROM orders WHERE user_id = ?", [userId]);
}

// Buat order baru
export async function createOrder(
  userId: number,
  totalPrice: number,
  status: string
): Promise<number | null> {
  const result = await execute(
    "INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)",
    [userId, totalPrice, status]
  );
  return result.lastInsertId ?? null;
}

// Update status order
export async function updateOrderStatus(
  orderId: number,
  status: string
): Promise<boolean> {
  const result = await execute("UPDATE orders SET status = ? WHERE id = ?", [
    status,
    orderId,
  ]);
  return (result.affectedRows ?? 0) > 0; // pakai default 0 kalau undefined
}
