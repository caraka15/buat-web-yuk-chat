// backend/services/orderService.ts
import { query, execute } from "../db.ts";
import { generateUuid } from "../utils/uuid.ts";

interface OrderInput {
  service_type: string;
  description: string;
  budget: number;
}

interface OrderRow {
  id: string;
  user_id: string;
  service_type: string;
  description: string;
  budget: number;
  status: string;
  demo_link: string | null;
  final_link: string | null; // disimpan URL asli di DB
  created_at: string;
  updated_at: string;
}
// Buat pesanan baru
export async function createOrder(userId: string, data: OrderInput) {
  const { service_type, description, budget } = data;

  if (!service_type || !description || isNaN(budget)) {
    throw new Error("Invalid input");
  }

  const id = generateUuid();

  const sql = `
    INSERT INTO orders (id, user_id, service_type, description, budget)
    VALUES (?, ?, ?, ?, ?)
  `;
  const result = await execute(sql, [
    id,
    userId,
    service_type,
    description,
    budget,
  ]);

  return {
    message: "Order created successfully",
    orderId: id,
    affectedRows: result.affectedRows ?? 0,
  };
}

/**
 * Ambil semua order milik user.
 * NOTE: final_link DIMASKING (NULL) jika status != 'completed'
 */
export async function getOrdersByUserId(userId: string) {
  const sql = `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`;
  const rows = await query<OrderRow>(sql, [userId]);

  // Masking untuk USER (bukan admin):
  // - final_link === null  -> state: "none", final_link: null
  // - final_link != null & status != "completed" -> state: "ready", final_link: "ready"
  // - status == "completed" -> state: "available", final_link: URL asli
  return rows.map((o) => {
    let final_link_state: "none" | "ready" | "available" = "none";
    let safe_final_link: string | null = null;

    if (!o.final_link) {
      final_link_state = "none";
      safe_final_link = null;
    } else if (o.status !== "completed") {
      final_link_state = "ready";
      safe_final_link = "ready";
    } else {
      final_link_state = "available";
      safe_final_link = o.final_link;
    }

    return {
      ...o,
      final_link: safe_final_link,
      final_link_state, // <- dipakai UI untuk logika tombol
    };
  });
}

// Update status pesanan (dipakai callback/payment flow)
export async function updateOrderStatus(orderId: string, status: string) {
  const sql = `UPDATE orders SET status = ? WHERE id = ?`;
  const result = await execute(sql, [status, orderId]);
  return {
    affectedRows: result.affectedRows ?? 0,
  };
}
