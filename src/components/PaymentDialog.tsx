import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { CreditCard, ExternalLink } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    budget: number;
    service_type: string;
    description: string;
  };
  paymentType: "dp" | "full";
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onOpenChange,
  order,
  paymentType,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [sessionId, setSessionId] = useState("");

  // Hitung nominal sesuai tipe pembayaran
  const amount = useMemo(
    () =>
      paymentType === "dp"
        ? Math.round(order.budget * 0.1) // 10%
        : Math.round(order.budget * 0.9), // 90%
    [order.budget, paymentType]
  );

  // Reset state saat dialog ditutup
  useEffect(() => {
    if (!open) {
      setPaymentUrl("");
      setSessionId("");
      setLoading(false);
    }
  }, [open]);

  async function createPayment() {
    try {
      setLoading(true);

      // endpoint sesuai tipe
      const endpoint = paymentType === "dp" ? "/payment-dp" : "/payment-full";

      const data = await api.post<{ sessionId: string; paymentUrl: string }>(
        endpoint,
        { order_id: order.id },
        user?.token // token tetap dikirim, walau route kamu sekarang belum pakai auth
      );

      if (!data?.paymentUrl) {
        throw new Error("Gagal membuat pembayaran");
      }

      setPaymentUrl(data.paymentUrl);
      setSessionId(data.sessionId || "");
      toast({
        title: "Pembayaran dibuat",
        description: "Silakan lanjutkan proses di halaman iPaymu.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Gagal membuat pembayaran",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleOpenPayment() {
    if (paymentUrl) {
      window.open(paymentUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {paymentType === "dp"
              ? "Pembayaran DP (10%)"
              : "Pembayaran Sisa (90%)"}
          </DialogTitle>
          <DialogDescription>
            Pembayaran untuk pesanan <strong>{order.id}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Ringkasan selalu tampil */}
        <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Layanan:</span>
            <span>{order.service_type}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Budget:</span>
            <span>Rp {order.budget.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>{paymentType === "dp" ? "DP (10%):" : "Sisa (90%):"}</span>
            <span>Rp {amount.toLocaleString("id-ID")}</span>
          </div>
          {sessionId && (
            <div className="flex justify-between">
              <span>Session ID:</span>
              <span className="font-mono">{sessionId}</span>
            </div>
          )}
        </div>

        {!paymentUrl ? (
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button onClick={createPayment} disabled={loading}>
              {loading ? "Membuat..." : "Buat Pembayaran"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handleOpenPayment} className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Buka Halaman Pembayaran
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Tutup
            </Button>
            <div className="text-xs text-muted-foreground text-center">
              Status akan otomatis terupdate setelah pembayaran berhasil (via
              callback).
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
