import { Button } from "@/components/ui/button";
import { MessageCircle, Code, Bot } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  const handleWhatsAppClick = () => {
    const message = "Halo! Saya ingin mengetahui lebih lanjut tentang layanan pembuatan website dan bot otomatis.";
    const phoneNumber = "6281234567890"; // Ganti dengan nomor WhatsApp Anda
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Solusi Digital Terdepan
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Kami menghadirkan <span className="text-primary font-semibold">website profesional</span> dan 
            <span className="text-primary font-semibold"> bot otomatis</span> untuk mengembangkan bisnis Anda ke level berikutnya
          </p>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 hover:bg-card/70 transition-all duration-300">
              <Code className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Website Modern</h3>
              <p className="text-muted-foreground text-sm">Desain responsif, cepat, dan SEO optimized</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 hover:bg-card/70 transition-all duration-300">
              <Bot className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Bot Otomatis</h3>
              <p className="text-muted-foreground text-sm">Chatbot pintar untuk customer service 24/7</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 hover:bg-card/70 transition-all duration-300">
              <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Support Lengkap</h3>
              <p className="text-muted-foreground text-sm">Konsultasi gratis dan maintenance berkala</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="hero"
              onClick={handleWhatsAppClick}
              className="text-lg px-8 py-4"
            >
              <MessageCircle className="w-5 h-5" />
              Konsultasi Gratis
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleWhatsAppClick}
              className="text-lg px-8 py-4 border-primary/30 hover:border-primary"
            >
              Lihat Portfolio
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;