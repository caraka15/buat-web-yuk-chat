import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Plus, MessageCircle, ExternalLink } from 'lucide-react';
import CreateOrderDialog from '@/components/CreateOrderDialog';
import PaymentDialog from '@/components/PaymentDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    order?: any;
    type?: 'dp' | 'full';
  }>({ open: false });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available');
        setOrders([]);
        return;
      }

      console.log('Fetching orders for user:', user.id);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Orders fetch error:', error);
        throw error;
      }

      console.log('Orders fetched successfully:', data);
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error in fetchUserOrders:', error);
      toast({
        title: 'Error',
        description: `Gagal memuat pesanan: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending_dp_payment': { label: 'Menunggu Pembayaran DP', variant: 'destructive' as const },
      'pending_approval': { label: 'Menunggu Persetujuan Admin', variant: 'secondary' as const },
      'approved': { label: 'Disetujui - Sedang Dikerjakan', variant: 'default' as const },
      'in_progress': { label: 'Sedang Dikerjakan', variant: 'outline' as const },
      'demo_ready': { label: 'Demo Siap - Bayar Sisa', variant: 'default' as const },
      'completed': { label: 'Selesai', variant: 'default' as const }
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  const handleOrderCreated = (newOrder: any) => {
    // Add new order to state and immediately open payment dialog for DP
    setOrders(prev => [newOrder, ...prev]);
    setPaymentDialog({
      open: true,
      order: newOrder,
      type: 'dp'
    });
  };

  const handleWhatsAppClick = (orderId: string) => {
    const message = `Halo! Saya ingin membahas pesanan dengan ID: ${orderId}`;
    const whatsappUrl = `https://wa.me/6282134567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang, {user?.user_metadata?.full_name || user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateOrder(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Buat Pesanan
          </Button>
          <Button variant="outline" onClick={signOut}>
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

        {orders.length === 0 ? (
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
                          {order.service_type === 'website' ? 'Pembuatan Website' : 
                           order.service_type === 'whatsapp_bot' ? 'WhatsApp Bot' :
                           order.service_type === 'ecommerce' ? 'E-commerce' :
                           order.service_type === 'landing_page' ? 'Landing Page' : 'Layanan Lainnya'}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          Rp {order.budget.toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{order.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'pending_dp_payment' && (
                        <Button 
                          size="sm"
                          onClick={() => setPaymentDialog({
                            open: true,
                            order,
                            type: 'dp'
                          })}
                        >
                          Bayar DP (10%)
                        </Button>
                      )}
                      
                      {(order.status === 'approved' || order.status === 'in_progress') && order.deposit_paid && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleWhatsAppClick(order.id)}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
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
                        <Button 
                          size="sm"
                          onClick={() => setPaymentDialog({
                            open: true,
                            order,
                            type: 'full'
                          })}
                        >
                          Bayar Sisa (90%)
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
          paymentType={paymentDialog.type || 'dp'}
        />
      )}
    </div>
  );
};

export default UserDashboard;