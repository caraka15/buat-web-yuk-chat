import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

const FAQ = () => {
  const faqs = [
    {
      question: "Berapa lama waktu pembuatan website?",
      answer: "Waktu pembuatan website bervariasi tergantung kompleksitas. Website basic 3-7 hari, website bisnis 7-14 hari, dan e-commerce 14-21 hari kerja."
    },
    {
      question: "Apakah ada garansi untuk website yang dibuat?",
      answer: "Ya, kami memberikan garansi 30 hari untuk perbaikan bug dan 1 tahun maintenance gratis. Garansi mencakup troubleshooting dan update keamanan dasar."
    },
    {
      question: "Bagaimana cara pembayaran?",
      answer: "Kami menerima pembayaran via transfer bank, e-wallet (OVO, DANA, GoPay), dan QRIS. Pembayaran bisa DP 50% di awal dan pelunasan setelah selesai."
    },
    {
      question: "Apakah bisa request revisi?",
      answer: "Ya, setiap paket termasuk 2-3x revisi gratis sesuai brief awal. Revisi tambahan atau perubahan major dikenakan biaya terpisah."
    },
    {
      question: "Bot WhatsApp bisa untuk fitur apa saja?",
      answer: "Bot WhatsApp bisa untuk auto reply, katalog produk, sistem booking, customer service, broadcast pesan, dan integrasi dengan sistem inventory atau CRM."
    },
    {
      question: "Apakah website mobile-friendly?",
      answer: "Ya, semua website yang kami buat sudah responsive dan mobile-friendly. Website akan tampil optimal di semua device (desktop, tablet, smartphone)."
    },
    {
      question: "Bagaimana dengan hosting dan domain?",
      answer: "Hosting dan domain bisa kami sediakan atau menggunakan hosting client. Jika menggunakan hosting kami, biaya mulai dari Rp 200rb/tahun untuk hosting shared."
    },
    {
      question: "Apakah ada pelatihan penggunaan?",
      answer: "Ya, kami memberikan pelatihan penggunaan website/bot via video call dan panduan tertulis. Termasuk cara update konten dan maintenance dasar."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Jawaban untuk pertanyaan yang sering ditanyakan tentang layanan kami
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FAQ;