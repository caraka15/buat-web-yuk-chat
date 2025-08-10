import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

interface Payment {
  id: string;
  order_id: string;
  payment_type: string;
  amount: number;
  status: string;
  created_at: string;
}

const PaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;
    (async () => {
      try {
        const data = await api.get<Payment[]>("/payments", user.token);
        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        // ignore errors for now
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.token]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Riwayat Pembayaran</h1>
          <p className="text-muted-foreground">Semua transaksi kamu</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>Kembali</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    Memuat...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    Belum ada pembayaran
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono">{p.id}</TableCell>
                    <TableCell className="font-mono">{p.order_id}</TableCell>
                    <TableCell className="capitalize">{p.payment_type}</TableCell>
                    <TableCell>Rp {p.amount.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="capitalize">{p.status}</TableCell>
                    <TableCell>
                      {new Date(p.created_at).toLocaleString("id-ID")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
