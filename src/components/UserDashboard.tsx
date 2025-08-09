import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, MessageCircle, ExternalLink, Lock } from "lucide-react";
import CreateOrderDialog from "@/components/CreateOrderDialog";
import PaymentDialog from "@/components/PaymentDialog";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";

type Order = {
  id: string;
  user_id: string;
  service_type: string;
  description: string;
  budget: number;
  status: string;
  demo_link?: string | null;
  final_link?: string | null | "ready"; // bisa "ready" saat sudah diisi admin tapi belum completed
  final_link_state?: "none" | "ready" | "available"; // dari API (masking)
  created_at: string;
  updated_at: string;
};

const ADMIN_WHATSAPP = "6282134567890"; // ganti sesuai nomor admin

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth(); // ProtectedRoute menjamin user ada
  const { toast } = useToast();
  const location = useLocation();

  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    order?: Order;
    type?: "dp" | "full";
  }>({ open: false });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await fetchUserOrders();

      // Handle return iPaymu (?return=true&status=...)
      const p = new URLSearchParams(location.search);
      if (p.get("return") === "true") {
        const status = (p.get("status") || "").toLowerCase();
        if (status === "berhasil" || status === "success") {
          toast({
            title: "Pembayaran berhasil",
            description: "Terima kasih 🙌",
          });
        } else {
          toast({
            title: "Pembayaran gagal",
            description: "Silakan coba lagi.",
            variant: "destructive",
          });
        }
        // bersihkan query dan refresh order
        window.history.replaceState({}, "", "/dashboard");
        await fetchUserOrders();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchUserOrders() {
    try {
      if (!user?.token) return;
      setLoading(true);
      const data = await api.get<Order[]>("/orders", user.token);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      // 401/expired sudah ditangani global oleh api.ts
      const msg =
        error?.response?.data?.error ??
        error?.response?.data?.message ??
        error?.message ??
        "Gagal memuat pesanan";
      toast({
        title: "Error",
        description: String(msg),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const statusMap = {
      pending_dp_payment: {
        label: "Menunggu Pembayaran DP",
        variant: "destructive" as const,
      },
      pending_approval: {
        label: "Menunggu Persetujuan Admin",
        variant: "secondary" as const,
      },
      approved: {
        label: "Disetujui - Sedang Dikerjakan",
        variant: "default" as const,
      },
      in_progress: { label: "Sedang Dikerjakan", variant: "outline" as const },
      demo_ready: {
        label: "Demo Siap - Bayar Sisa",
        variant: "default" as const,
      },
      completed: { label: "Selesai", variant: "default" as const },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        variant: "secondary" as const,
      }
    );
  }

  function handleOrderCreated(newOrder: Order) {
    setOrders((prev) => [newOrder, ...prev]);
    setPaymentDialog({ open: true, order: newOrder, type: "dp" });
  }

  function handleWhatsAppAdmin(orderId: string) {
    const message = `Halo Admin! Saya ingin membahas pesanan dengan ID: ${orderId}`;
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang, {user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateOrder(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Buat Pesanan
          </Button>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </div>

      {/* Orders */}
      <div className="grid gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Pesanan Saya</h2>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Memuat pesanan…</p>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Belum ada pesanan</p>
              <Button onClick={() => setShowCreateOrder(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Buat Pesanan Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const finalState = order.final_link_state; // "none" | "ready" | "available"
              const isCompleted = order.status === "completed";

              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {order.id}
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {order.service_type === "website"
                            ? "Pembuatan Website"
                            : order.service_type === "whatsapp_bot"
                            ? "WhatsApp Bot"
                            : order.service_type === "ecommerce"
                            ? "E-commerce"
                            : order.service_type === "landing_page"
                            ? "Landing Page"
                            : "Layanan Lainnya"}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          Rp {order.budget.toLocaleString("id-ID")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm mb-4">{order.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {/* Bayar DP */}
                      {order.status === "pending_dp_payment" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            setPaymentDialog({ open: true, order, type: "dp" })
                          }
                        >
                          Bayar DP (10%)
                        </Button>
                      )}

                      {/* Chat admin */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleWhatsAppAdmin(order.id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        WhatsApp Admin
                      </Button>

                      {/* Demo link bila ada */}
                      {order.demo_link && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(order.demo_link!, "_blank")
                          }
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Lihat Demo
                        </Button>
                      )}

                      {/* Final states */}
                      {finalState === "none" && (
                        <Button size="sm" variant="outline" disabled>
                          <Lock className="w-4 h-4 mr-1" />
                          Final belum siap
                        </Button>
                      )}

                      {finalState === "ready" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              setPaymentDialog({
                                open: true,
                                order,
                                type: "full",
                              })
                            }
                          >
                            Bayar Sisa (90%)
                          </Button>
                          <Button size="sm" variant="outline" disabled>
                            <Lock className="w-4 h-4 mr-1" />
                            Link Final (Terkunci)
                          </Button>
                        </>
                      )}

                      {finalState === "available" &&
                        isCompleted &&
                        order.final_link && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(order.final_link as string, "_blank")
                            }
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Lihat Final
                          </Button>
                        )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <CreateOrderDialog
        open={showCreateOrder}
        onOpenChange={setShowCreateOrder}
        onOrderCreated={handleOrderCreated}
      />

      {paymentDialog.open && paymentDialog.order && (
        <PaymentDialog
          open={paymentDialog.open}
          onOpenChange={(open) => setPaymentDialog({ open })}
          order={paymentDialog.order}
          paymentType={paymentDialog.type || "dp"} // "dp" atau "full"
        />
      )}
    </div>
  );
};

export default UserDashboard;
