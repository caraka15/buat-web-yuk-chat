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
  va_number?: string | null;
  status?: string;
  user_id?: string; // tambahkan properti user_id
}

export async function createPayment(payment: Payment): Promise<string | null> {
  const paymentId = generateUuid();
  try {
    await execute(
      `INSERT INTO payments (id, order_id, payment_type, amount, ipaymu_session_id, ipaymu_transaction_id, payment_url, va_number, status, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paymentId,
        payment.order_id,
        payment.payment_type,
        payment.amount,
        payment.ipaymu_session_id ?? null,
        payment.ipaymu_transaction_id ?? null,
        payment.payment_url ?? null,
        payment.va_number ?? null,
        payment.status || "pending",
        payment.user_id ?? null,
      ]
    );
    return paymentId;
  } catch (error) {
    console.error("Error creating payment:", error);
    return null;
  }
}

export async function updatePaymentStatus(
  sessionId: string,
  status: string
): Promise<boolean> {
  try {
    const result = await execute(
      "UPDATE payments SET status = ? WHERE ipaymu_session_id = ?",
      [status, sessionId]
    );
    return result.affectedRows !== undefined && result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating payment status:", error);
    return false;
  }
}

export async function getPaymentBySessionId(
  sessionId: string
): Promise<Payment | null> {
  try {
    const result = await query(
      "SELECT * FROM payments WHERE ipaymu_session_id = ?",
      [sessionId]
    );
    return result.length > 0 ? (result[0] as Payment) : null;
  } catch (error) {
    console.error("Error getting payment by session ID:", error);
    return null;
  }
}
