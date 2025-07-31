import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Globe, 
  Bot, 
  Smartphone, 
  ShoppingCart, 
  MessageSquare, 
  Zap,
  CheckCircle,
  MessageCircle
} from "lucide-react";

const Services = () => {
  const handleWhatsAppClick = (service: string) => {
    const message = `Halo! Saya tertarik dengan layanan ${service}. Bisa tolong dijelaskan lebih detail?`;
    const phoneNumber = "6285156371696"; // Nomor WhatsApp CrxaNode
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const websiteServices = [
    {
      icon: Globe,
      title: "Website Company Profile",
      description: "Website profesional untuk memperkenalkan perusahaan Anda",
      features: ["Desain Custom", "Responsive Design", "SEO Optimized", "Admin Panel"],
      priceRange: "Rp 2.500.000 - 7.500.000"
    },
    {
      icon: ShoppingCart,
      title: "Website E-commerce",
      description: "Toko online lengkap dengan sistem pembayaran terintegrasi",
      features: ["Katalog Produk", "Payment Gateway", "Manajemen Order", "Dashboard Admin"],
      priceRange: "Rp 5.000.000 - 15.000.000"
    },
    {
      icon: Smartphone,
      title: "Landing Page",
      description: "Halaman khusus untuk kampanye marketing dan promosi",
      features: ["Conversion Optimized", "Fast Loading", "Analytics", "A/B Testing Ready"],
      priceRange: "Rp 1.500.000 - 4.000.000"
    }
  ];

  const botServices = [
    {
      icon: MessageSquare,
      title: "WhatsApp Bot",
      description: "Bot otomatis untuk WhatsApp Business dengan fitur lengkap",
      features: ["Auto Reply", "Katalog Produk", "Order Management", "Broadcast Message"],
      priceRange: "Rp 1.000.000 - 5.000.000"
    },
    {
      icon: Bot,
      title: "Telegram Bot",
      description: "Bot Telegram untuk komunitas dan customer service",
      features: ["Command Handler", "Group Management", "File Sharing", "Notification System"],
      priceRange: "Rp 800.000 - 3.500.000"
    },
    {
      icon: Zap,
      title: "Custom Bot",
      description: "Bot khusus sesuai kebutuhan bisnis Anda",
      features: ["API Integration", "Custom Logic", "Multi Platform", "Advanced Analytics"],
      priceRange: "Rp 2.000.000 - 10.000.000"
    }
  ];

  return (
    <section id="services" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Layanan Kami
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Solusi digital komprehensif untuk mengembangkan bisnis Anda dengan teknologi terdepan
          </p>
        </div>

        {/* Website Services */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-12 text-primary">
            Pembuatan Website
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {websiteServices.map((service, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 group">
                <CardContent className="p-8">
                  <service.icon className="w-16 h-16 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-2xl font-bold mb-4">{service.title}</h4>
                  <p className="text-muted-foreground mb-6">{service.description}</p>
                  
                   <div className="space-y-3 mb-6">
                     {service.features.map((feature, idx) => (
                       <div key={idx} className="flex items-center gap-3">
                         <CheckCircle className="w-5 h-5 text-primary" />
                         <span className="text-sm">{feature}</span>
                       </div>
                     ))}
                   </div>

                   <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                     <p className="text-sm font-semibold text-foreground mb-1">Range Harga:</p>
                     <p className="text-lg font-bold text-primary">{service.priceRange}</p>
                     <p className="text-xs text-muted-foreground mt-1">
                       *Harga dapat berubah sesuai kompleksitas project
                     </p>
                   </div>

                   <Button 
                     variant="whatsapp" 
                     className="w-full"
                     onClick={() => handleWhatsAppClick(service.title)}
                   >
                     <MessageCircle className="w-4 h-4" />
                     Pesan Sekarang
                   </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bot Services */}
        <div>
          <h3 className="text-3xl font-bold text-center mb-12 text-primary">
            Bot Otomatis
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {botServices.map((service, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 group">
                <CardContent className="p-8">
                  <service.icon className="w-16 h-16 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-2xl font-bold mb-4">{service.title}</h4>
                  <p className="text-muted-foreground mb-6">{service.description}</p>
                  
                   <div className="space-y-3 mb-6">
                     {service.features.map((feature, idx) => (
                       <div key={idx} className="flex items-center gap-3">
                         <CheckCircle className="w-5 h-5 text-primary" />
                         <span className="text-sm">{feature}</span>
                       </div>
                     ))}
                   </div>

                   <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                     <p className="text-sm font-semibold text-foreground mb-1">Range Harga:</p>
                     <p className="text-lg font-bold text-primary">{service.priceRange}</p>
                     <p className="text-xs text-muted-foreground mt-1">
                       *Harga dapat berubah sesuai kompleksitas project
                     </p>
                   </div>

                   <Button 
                     variant="whatsapp" 
                     className="w-full"
                     onClick={() => handleWhatsAppClick(service.title)}
                   >
                     <MessageCircle className="w-4 h-4" />
                     Pesan Sekarang
                   </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;