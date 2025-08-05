import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, ExternalLink } from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    budget: number;
    service_type: string;
    description: string;
  };
  paymentType: 'dp' | 'full';
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ 
  open, 
  onOpenChange, 
  order, 
  paymentType 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [vaNumber, setVaNumber] = useState('');

  const amount = paymentType === 'dp' 
    ? Math.round(order.budget * 0.1) // 10% DP
    : Math.round(order.budget * 0.9); // 90% remaining

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone) {
      toast({
        title: 'Error',
        description: 'Nama dan nomor HP harus diisi',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Call edge function to create payment
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          order_id: order.id,
          amount,
          payment_type: paymentType,
          buyer_name: name,
          buyer_email: user?.email,
          buyer_phone: phone
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.payment_url) {
        setPaymentUrl(data.payment_url);
        setVaNumber(data.session_id);
        
        toast({
          title: 'Pembayaran Dibuat',
          description: 'Link pembayaran berhasil dibuat. Silakan lakukan pembayaran.',
        });
      } else {
        throw new Error(data.error || 'Gagal membuat pembayaran');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal membuat pembayaran',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentRedirect = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {paymentType === 'dp' ? 'Pembayaran DP (10%)' : 'Pembayaran Sisa (90%)'}
          </DialogTitle>
          <DialogDescription>
            Pembayaran untuk pesanan {order.id}
          </DialogDescription>
        </DialogHeader>

        {!paymentUrl ? (
          <form onSubmit={handleCreatePayment} className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Detail Pembayaran</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Layanan:</span>
                  <span>{order.service_type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Budget:</span>
                  <span>Rp {order.budget.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>
                    {paymentType === 'dp' ? 'DP (10%):' : 'Sisa (90%):'}
                  </span>
                  <span>Rp {amount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama untuk pembayaran"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor HP</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Membuat...' : 'Buat Pembayaran'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">
                Pembayaran Berhasil Dibuat!
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-green-700">Jumlah: </span>
                  <span className="font-semibold">Rp {amount.toLocaleString('id-ID')}</span>
                </div>
                {vaNumber && (
                  <div>
                    <span className="text-green-700">VA Number: </span>
                    <span className="font-mono font-semibold">{vaNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handlePaymentRedirect} className="w-full">
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
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Status pembayaran akan otomatis terupdate setelah pembayaran berhasil
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;