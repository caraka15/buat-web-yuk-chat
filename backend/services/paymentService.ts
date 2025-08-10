// backend/services/paymentService.ts
import { query, execute } from "../db.ts";
import { generateUuid } from "../utils/uuid.ts";

export interface Payment {
  id?: string;
  order_id: string;
  payment_type: "dp" | "full";
  amount: number;
  ipaymu_session_id?: string;
  ipaymu_transaction_id?: string;
  payment_url?: string;
  status?: string;
}

export async function createPayment(payment: Payment): Promise<string | null> {
  const paymentId = generateUuid();
  try {
    await execute(
      `INSERT INTO payments (id, order_id, payment_type, amount, ipaymu_session_id, ipaymu_transaction_id, payment_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paymentId,
        payment.order_id,
        payment.payment_type,
        payment.amount,
        payment.ipaymu_session_id ?? null,
        payment.ipaymu_transaction_id ?? null,
        payment.payment_url ?? null,
        payment.status || "pending",
      ],
    );
    return paymentId;
  } catch (error) {
    console.error("Error creating payment:", error);
    return null;
  }
}

export async function updatePaymentStatus(
  sessionId: string,
  status: string,
): Promise<boolean> {
  try {
    const result = await execute(
      "UPDATE payments SET status = ? WHERE ipaymu_session_id = ?",
      [status, sessionId],
    );
    return result.affectedRows !== undefined && result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating payment status:", error);
    return false;
  }
}

export async function updatePaymentByOrder(
  orderId: string,
  paymentType: "dp" | "full",
  status: string,
  transactionId?: string | null,
): Promise<boolean> {
  try {
    const result = await execute(
      "UPDATE payments SET status = ?, ipaymu_transaction_id = ? WHERE order_id = ? AND payment_type = ?",
      [status, transactionId ?? null, orderId, paymentType],
    );
    return result.affectedRows !== undefined && result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating payment by order:", error);
    return false;
  }
}

export async function getPaymentBySessionId(
  sessionId: string,
): Promise<Payment | null> {
  try {
    const result = await query(
      "SELECT * FROM payments WHERE ipaymu_session_id = ?",
      [sessionId],
    );
    return result.length > 0 ? (result[0] as Payment) : null;
  } catch (error) {
    console.error("Error getting payment by session ID:", error);
    return null;
  }
}

export async function getPaymentsByUserId(
  userId: string,
): Promise<Payment[]> {
  try {
    const results = await query(
      `SELECT p.* FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE o.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId],
    );
    return results as Payment[];
  } catch (error) {
    console.error("Error fetching payments by user:", error);
    return [];
  }
}
