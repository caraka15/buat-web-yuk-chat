import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated?: (order: any) => void;
}

const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({ open, onOpenChange, onOrderCreated }) => {
  const [serviceType, setServiceType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const serviceOptions = [
    { value: 'website', label: 'Pembuatan Website', minBudget: 1000000, maxBudget: 10000000 },
    { value: 'landing_page', label: 'Landing Page', minBudget: 500000, maxBudget: 3000000 },
    { value: 'ecommerce', label: 'Website E-commerce', minBudget: 3000000, maxBudget: 15000000 },
    { value: 'whatsapp_bot', label: 'Bot WhatsApp', minBudget: 800000, maxBudget: 5000000 },
    { value: 'telegram_bot', label: 'Bot Telegram', minBudget: 600000, maxBudget: 4000000 },
    { value: 'automation_bot', label: 'Bot Otomatisasi', minBudget: 1500000, maxBudget: 8000000 }
  ];

  const selectedService = serviceOptions.find(option => option.value === serviceType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceType || !description || !budget) {
      toast({
        title: 'Error',
        description: 'Semua field harus diisi',
        variant: 'destructive',
      });
      return;
    }

    const budgetNumber = parseInt(budget);
    if (selectedService && (budgetNumber < selectedService.minBudget || budgetNumber > selectedService.maxBudget)) {
      toast({
        title: 'Error',
        description: `Budget untuk ${selectedService.label} harus antara Rp ${selectedService.minBudget.toLocaleString('id-ID')} - Rp ${selectedService.maxBudget.toLocaleString('id-ID')}`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Creating order with data:', { serviceType, description, budgetNumber, userId: user?.id });
      
      // Create order in database
      const newOrder = await api.post('/orders', {
        user_id: user?.id,
        service_type: serviceType,
        description,
        budget: budgetNumber,
        status: 'pending_dp_payment'
      }, user?.token);

      if (!newOrder) {
        throw new Error("Failed to create order");
      }
      
      console.log('Order created successfully:', newOrder);
      
      toast({
        title: 'Berhasil',
        description: 'Pesanan berhasil dibuat! Silakan lakukan pembayaran DP.',
      });
      
      onOpenChange(false);
      setServiceType('');
      setDescription('');
      setBudget('');
      
      // Trigger payment dialog
      if (onOrderCreated) {
        onOrderCreated(newOrder);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Gagal membuat pesanan. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Pesanan Baru</DialogTitle>
          <DialogDescription>
            Isi detail pesanan Anda. Setelah dibuat, Anda akan langsung diarahkan untuk pembayaran DP.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service-type">Jenis Layanan</Label>
            <Select value={serviceType} onValueChange={setServiceType} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis layanan" />
              </SelectTrigger>
              <SelectContent>
                {serviceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedService && (
            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
              Range budget: Rp {selectedService.minBudget.toLocaleString('id-ID')} - Rp {selectedService.maxBudget.toLocaleString('id-ID')}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Proyek</Label>
            <Textarea
              id="description"
              placeholder="Jelaskan detail proyek yang Anda inginkan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget yang Anda Tawarkan (Rp)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="Contoh: 5000000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
              min={selectedService?.minBudget || 0}
              max={selectedService?.maxBudget || 999999999}
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
              {loading ? 'Membuat...' : 'Buat Pesanan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderDialog;