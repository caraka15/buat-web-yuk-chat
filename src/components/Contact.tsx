import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Phone, Mail, Clock, MapPin } from "lucide-react";

const Contact = () => {
  const handleWhatsAppClick = () => {
    const message = "Halo! Saya ingin berkonsultasi tentang layanan digital Anda.";
    const phoneNumber = "6285156371696"; // Nomor WhatsApp CrxaNode
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Telepon",
      value: "+62 851-5637-1696",
      action: () => window.open("tel:+6285156371696")
    },
    {
      icon: Mail,
      title: "Email",
      value: "admin@crxanode.xyz",
      action: () => window.open("mailto:admin@crxanode.xyz")
    },
    {
      icon: Clock,
      title: "Jam Operasional",
      value: "Senin - Sabtu, 09:00 - 18:00",
      action: null
    },
    {
      icon: MapPin,
      title: "Alamat Bisnis",
      value: "Jl. Kemang Raya No. 45, Kemang, Jakarta Selatan 12560",
      action: () => window.open("https://maps.google.com/?q=Jl.+Kemang+Raya+No.+45+Kemang+Jakarta+Selatan")
    }
  ];

  return (
    <section id="contact" className="py-20 px-6 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Hubungi Kami
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Siap membantu mewujudkan visi digital Anda. Konsultasi gratis untuk solusi terbaik!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold mb-8">Mari Berdiskusi</h3>
            <p className="text-lg text-muted-foreground mb-8">
              Tim ahli kami siap membantu Anda menemukan solusi digital yang tepat untuk bisnis Anda. 
              Mulai dari konsep hingga implementasi, kami akan mendampingi setiap langkah perjalanan digital Anda.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <Card 
                  key={index} 
                  className={`bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 ${
                    info.action ? 'cursor-pointer' : ''
                  }`}
                  onClick={info.action || undefined}
                >
                  <CardContent className="p-6">
                    <info.icon className="w-8 h-8 text-primary mb-4" />
                    <h4 className="font-semibold mb-2">{info.title}</h4>
                    <p className="text-muted-foreground text-sm">{info.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center lg:text-left">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border-primary/20 p-8">
              <CardContent className="p-0">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold mb-4">Mulai Proyek Anda</h3>
                  <p className="text-lg text-muted-foreground">
                    Dapatkan konsultasi gratis dan penawaran terbaik untuk kebutuhan digital Anda
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <span>Respon cepat dalam 1 jam</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <span>Konsultasi gratis tanpa komitmen</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <span>Penawaran harga terbaik</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  variant="whatsapp"
                  onClick={handleWhatsAppClick}
                  className="w-full mt-8 text-lg py-6"
                >
                  <MessageCircle className="w-6 h-6" />
                  Chat WhatsApp Sekarang
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;