import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Check, X, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  user_id: string;
  service_type: string;
  description: string;
  budget: number;
  status: string;
  demo_link?: string | null;
  final_link?: string | null;
  created_at: string;
  updated_at: string;
}
type OrderWithUser = Order & { user_email?: string };

const AdminDashboard: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  // dialog states
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  const [finalDialogOpen, setFinalDialogOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderWithUser | null>(null);
  const [demoLink, setDemoLink] = useState("");
  const [finalLink, setFinalLink] = useState("");

  useEffect(() => {
    fetchAllOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAllOrders() {
    try {
      if (!user?.token) return;
      setLoading(true);
      const data = await api.get<OrderWithUser[]>("/admin/orders", user.token);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Gagal memuat pesanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const statusMap = {
      pending_dp_payment: {
        label: "Belum Bayar DP",
        variant: "destructive" as const,
      },
      pending_approval: {
        label: "Menunggu Persetujuan",
        variant: "secondary" as const,
      },
      approved: {
        label: "Disetujui - Dikerjakan",
        variant: "default" as const,
      },
      in_progress: { label: "Sedang Dikerjakan", variant: "outline" as const },
      demo_ready: { label: "Demo Siap", variant: "default" as const },
      completed: { label: "Selesai", variant: "default" as const },
      rejected: { label: "Ditolak", variant: "destructive" as const },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        variant: "secondary" as const,
      }
    );
  }

  async function handleApproveOrder(orderId: string) {
    try {
      await api.put(
        `/admin/orders/${orderId}/status`,
        { status: "approved" },
        user?.token
      );
      toast({ title: "Berhasil", description: "Pesanan berhasil disetujui" });
      await fetchAllOrders();
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Gagal menyetujui pesanan: ${
          err?.message || "unknown error"
        }`,
        variant: "destructive",
      });
    }
  }

  async function handleRejectOrder(orderId: string) {
    try {
      await api.put(
        `/admin/orders/${orderId}/status`,
        { status: "rejected" },
        user?.token
      );
      toast({ title: "Berhasil", description: "Pesanan berhasil ditolak" });
      await fetchAllOrders();
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Gagal menolak pesanan: ${
          err?.message || "unknown error"
        }`,
        variant: "destructive",
      });
    }
  }

  function openDemoDialog(order: OrderWithUser) {
    setActiveOrder(order);
    setDemoLink(order.demo_link || "");
    setDemoDialogOpen(true);
  }

  function openFinalDialog(order: OrderWithUser) {
    setActiveOrder(order);
    setFinalLink(order.final_link || "");
    setFinalDialogOpen(true);
  }

  async function handleUpdateDemoLink() {
    if (!activeOrder) return;
    if (!demoLink.trim()) {
      toast({
        title: "Error",
        description: "Link demo tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }
    try {
      // admin endpoint: set demo link + default status demo_ready
      await api.put(
        `/admin/orders/${activeOrder.id}/demo`,
        { demo_link: demoLink, status: "demo_ready" },
        user?.token
      );
      toast({ title: "Berhasil", description: "Link demo berhasil diupdate" });
      setDemoDialogOpen(false);
      setActiveOrder(null);
      setDemoLink("");
      await fetchAllOrders();
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Gagal mengupdate link demo: ${
          err?.message || "unknown error"
        }`,
        variant: "destructive",
      });
    }
  }

  async function handleUpdateFinalLink() {
    if (!activeOrder) return;
    if (!finalLink.trim()) {
      toast({
        title: "Error",
        description: "Link final tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }
    try {
      // admin endpoint: set final link (status boleh diubah terpisah via /status)
      await api.put(
        `/admin/orders/${activeOrder.id}/final`,
        { final_link: finalLink },
        user?.token
      );
      toast({ title: "Berhasil", description: "Link final berhasil diupdate" });
      setFinalDialogOpen(false);
      setActiveOrder(null);
      setFinalLink("");
      await fetchAllOrders();
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Gagal mengupdate link final: ${
          err?.message || "unknown error"
        }`,
        variant: "destructive",
      });
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Anda bukan admin.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Kelola pesanan dan proyek</p>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Menunggu Persetujuan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "pending_approval").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Sedang Dikerjakan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "in_progress").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp{" "}
              {orders
                .reduce((t, o) => t + (o.budget || 0), 0)
                .toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Manajemen Pesanan</h2>

        {loading && (
          <Card>
            <CardContent className="p-8 text-center">Memuat data…</CardContent>
          </Card>
        )}

        {!loading && orders.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              Belum ada data pesanan.
            </CardContent>
          </Card>
        )}

        {!loading &&
          orders.map((order) => {
            const statusInfo = getStatusBadge(order.status);
            const hasDemo = !!order.demo_link;

            // Admin boleh tambah/edit demo & final di SEMUA status
            // kecuali rejected (dan kalau kamu punya 'cancelled' bisa dikecualikan juga).
            const allowEdit =
              order.status !== "rejected"; /* && order.status !== "cancelled" */

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
                        Customer: {order.user_email || order.user_id} |{" "}
                        {order.service_type}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        Rp {order.budget.toLocaleString("id-ID")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm mb-4">{order.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {order.status === "pending_approval" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApproveOrder(order.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectOrder(order.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Tolak
                        </Button>
                      </>
                    )}

                    {/* Tambah/Edit Demo — SELALU ADA (kecuali rejected) */}
                    {allowEdit && (
                      <Dialog
                        open={demoDialogOpen && activeOrder?.id === order.id}
                        onOpenChange={(o) => {
                          setDemoDialogOpen(o);
                          if (!o) {
                            setActiveOrder(null);
                            setDemoLink("");
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDemoDialog(order)}
                          >
                            {hasDemo ? "Edit Demo" : "Tambah Demo"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Link Demo - {order.id}</DialogTitle>
                            <DialogDescription>
                              Masukkan link demo untuk customer
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Label htmlFor="demo-link">Link Demo</Label>
                            <Input
                              id="demo-link"
                              value={demoLink}
                              onChange={(e) => setDemoLink(e.target.value)}
                              placeholder="https://demo.example.com"
                            />
                            <Button onClick={handleUpdateDemoLink}>
                              Simpan Link Demo
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Tambah/Edit Final — SELALU ADA (kecuali rejected) */}
                    {allowEdit && (
                      <Dialog
                        open={finalDialogOpen && activeOrder?.id === order.id}
                        onOpenChange={(o) => {
                          setFinalDialogOpen(o);
                          if (!o) {
                            setActiveOrder(null);
                            setFinalLink("");
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => openFinalDialog(order)}
                          >
                            {order.final_link
                              ? "Edit Link Final"
                              : "Tambah Link Final"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Link Final - {order.id}</DialogTitle>
                            <DialogDescription>
                              Masukkan link final project
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Label htmlFor="final-link">
                              Link Final Project
                            </Label>
                            <Input
                              id="final-link"
                              value={finalLink}
                              onChange={(e) => setFinalLink(e.target.value)}
                              placeholder="https://final.example.com"
                            />
                            <Button onClick={handleUpdateFinalLink}>
                              Simpan Link Final
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Lihat Demo (bila ada) */}
                    {order.demo_link && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(order.demo_link!, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Lihat Demo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
};

export default AdminDashboard;
