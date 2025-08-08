import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, Check, X, ExternalLink, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [demoLink, setDemoLink] = useState('');
  const [finalLink, setFinalLink] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const ordersData = await api.get('/orders', user?.token);

      const ordersWithUserInfo = ordersData?.map((order: any) => ({
        ...order,
        user_email: order.user_id, // We'll show user_id until we have profiles table
      })) || [];

      setOrders(ordersWithUserInfo);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Gagal memuat pesanan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending_dp_payment': { label: 'Belum Bayar DP', variant: 'destructive' as const },
      'pending_approval': { label: 'Menunggu Persetujuan', variant: 'secondary' as const },
      'approved': { label: 'Disetujui - Dikerjakan', variant: 'default' as const },
      'in_progress': { label: 'Sedang Dikerjakan', variant: 'outline' as const },
      'demo_ready': { label: 'Demo Siap', variant: 'default' as const },
      'completed': { label: 'Selesai', variant: 'default' as const }
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: 'approved' }, user?.token);
      toast({
        title: 'Berhasil',
        description: 'Pesanan berhasil disetujui',
      });
      fetchAllOrders(); // Refresh orders
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Gagal menyetujui pesanan: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: 'rejected' }, user?.token);
      toast({
        title: 'Berhasil',
        description: 'Pesanan berhasil ditolak',
      });
      fetchAllOrders(); // Refresh orders
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Gagal menolak pesanan: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateDemoLink = async (orderId: string) => {
    if (!demoLink) {
      toast({
        title: 'Error',
        description: 'Link demo tidak boleh kosong',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.put(`/orders/${orderId}`, { demo_link: demoLink, status: 'demo_ready' }, user?.token);
      toast({
        title: 'Berhasil',
        description: 'Link demo berhasil diupdate',
      });
      setDemoLink('');
      setSelectedOrder(null);
      fetchAllOrders(); // Refresh orders
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Gagal mengupdate link demo: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateFinalLink = async (orderId: string) => {
    if (!finalLink) {
      toast({
        title: 'Error',
        description: 'Link final tidak boleh kosong',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.put(`/orders/${orderId}`, { final_link: finalLink, status: 'completed' }, user?.token);
      toast({
        title: 'Berhasil',
        description: 'Link final berhasil diupdate',
      });
      setFinalLink('');
      setSelectedOrder(null);
      fetchAllOrders(); // Refresh orders
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Gagal mengupdate link final: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleWhatsAppClick = (orderId: string, userEmail: string) => {
    const message = `Halo! Ini admin dari Crxanode. Mengenai pesanan ${orderId}, mari kita diskusikan lebih lanjut.`;
    const whatsappUrl = `https://wa.me/6282134567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

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
            <CardTitle className="text-sm font-medium">Menunggu Persetujuan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'pending_approval').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sedang Dikerjakan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {orders.reduce((total, o) => total + o.budget, 0).toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Management */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Manajemen Pesanan</h2>
        
        {orders.map((order) => {
          const statusInfo = getStatusBadge(order.status);
          
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
                      Customer: {order.user_email} | 
                      {order.service_type === 'website' ? ' Website' : 
                       order.service_type === 'whatsapp_bot' ? ' WhatsApp Bot' :
                       order.service_type === 'ecommerce' ? ' E-commerce' : ` ${order.service_type}`}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Rp {order.budget.toLocaleString('id-ID')}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{order.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {order.status === 'pending_approval' && (
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
                  
                  {(order.status === 'approved' || order.status === 'in_progress') && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            {order.demo_link ? 'Update Demo' : 'Tambah Demo'}
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
                            <div>
                              <Label htmlFor="demo-link">Link Demo</Label>
                              <Input
                                id="demo-link"
                                value={demoLink}
                                onChange={(e) => setDemoLink(e.target.value)}
                                placeholder="https://demo.example.com"
                              />
                            </div>
                            <Button onClick={() => handleUpdateDemoLink(order.id)}>
                              Simpan Link Demo
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleWhatsAppClick(order.id, order.user_email)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                    </>
                  )}
                  
                  {order.demo_link && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(order.demo_link, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Lihat Demo
                    </Button>
                  )}
                  
                  {order.status === 'demo_ready' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          Tambah Link Final
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Link Final - {order.id}</DialogTitle>
                          <DialogDescription>
                            Masukkan link final project yang sudah selesai
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="final-link">Link Final Project</Label>
                            <Input
                              id="final-link"
                              value={finalLink}
                              onChange={(e) => setFinalLink(e.target.value)}
                              placeholder="https://final.example.com"
                            />
                          </div>
                          <Button onClick={() => handleUpdateFinalLink(order.id)}>
                            Simpan Link Final
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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