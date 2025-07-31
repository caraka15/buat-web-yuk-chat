import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Legal = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Terms and Conditions */}
          <Card className="p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Syarat dan Ketentuan</h1>
            
            <div className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">1. Ketentuan Umum</h3>
                <p>Dengan menggunakan layanan CrxaNode.xyz, Anda menyetujui syarat dan ketentuan yang berlaku. Syarat ini dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">2. Layanan</h3>
                <p>Kami menyediakan jasa pembuatan website, bot otomatis, dan konsultasi digital. Semua layanan disesuaikan dengan kebutuhan dan budget client.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">3. Pembayaran</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Pembayaran dilakukan sesuai invoice yang diberikan</li>
                  <li>DP minimal 50% dari total harga sebelum pengerjaan dimulai</li>
                  <li>Pelunasan dilakukan setelah project selesai 100%</li>
                  <li>Pembayaran dapat dilakukan via transfer bank atau e-wallet</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">4. Revisi dan Perubahan</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Setiap paket termasuk 2-3x revisi gratis sesuai brief awal</li>
                  <li>Revisi tambahan atau perubahan major dikenakan biaya terpisah</li>
                  <li>Perubahan scope project akan mempengaruhi timeline dan biaya</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">5. Hak Cipta dan Kepemilikan</h3>
                <p>Setelah pembayaran lunas, hak cipta website/bot sepenuhnya milik client. CrxaNode.xyz berhak menggunakan project sebagai portfolio dengan seizin client.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">6. Garansi dan Tanggung Jawab</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Garansi 30 hari untuk perbaikan bug teknis</li>
                  <li>Maintenance gratis 1 tahun untuk update keamanan dasar</li>
                  <li>Kami tidak bertanggung jawab atas kehilangan data akibat kelalaian client</li>
                </ul>
              </div>
            </div>
          </Card>

          <Separator />

          {/* Refund Policy */}
          <Card className="p-8">
            <h2 className="text-3xl font-bold text-foreground mb-6">Kebijakan Refund</h2>
            
            <div className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Kondisi Refund</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>100% Refund:</strong> Jika kami tidak dapat memulai project dalam 7 hari setelah pembayaran DP tanpa alasan yang jelas</li>
                  <li><strong>75% Refund:</strong> Jika project dibatalkan sebelum 25% progress dengan alasan dari pihak kami</li>
                  <li><strong>50% Refund:</strong> Jika project dibatalkan antara 25%-50% progress dengan alasan dari pihak kami</li>
                  <li><strong>No Refund:</strong> Jika project sudah lebih dari 50% atau pembatalan dari pihak client</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Proses Refund</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Request refund harus diajukan via email ke admin@crxanode.xyz</li>
                  <li>Proses refund maksimal 14 hari kerja setelah persetujuan</li>
                  <li>Refund akan dikembalikan ke rekening yang sama dengan pembayaran</li>
                  <li>Biaya transfer ditanggung oleh pihak yang mengajukan refund</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Pengecualian</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Biaya domain dan hosting tidak dapat direfund</li>
                  <li>Project yang sudah live dan online tidak dapat direfund 100%</li>
                  <li>Refund tidak berlaku untuk layanan maintenance dan support</li>
                </ul>
              </div>
            </div>
          </Card>

          <Separator />

          {/* Privacy Policy */}
          <Card className="p-8">
            <h2 className="text-3xl font-bold text-foreground mb-6">Kebijakan Privasi</h2>
            
            <div className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Pengumpulan Data</h3>
                <p>Kami mengumpulkan data yang Anda berikan saat menggunakan layanan kami, termasuk nama, email, nomor telepon, dan informasi project. Data ini digunakan untuk keperluan layanan dan komunikasi.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Penggunaan Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Menyediakan layanan sesuai kebutuhan Anda</li>
                  <li>Komunikasi terkait project dan layanan</li>
                  <li>Mengirim update tentang layanan baru (dengan persetujuan)</li>
                  <li>Analisis untuk meningkatkan kualitas layanan</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Keamanan Data</h3>
                <p>Kami berkomitmen menjaga keamanan data Anda dengan menggunakan enkripsi dan praktik keamanan terbaik. Data tidak akan dibagikan kepada pihak ketiga tanpa persetujuan Anda.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Hak Anda</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Meminta akses ke data personal Anda</li>
                  <li>Meminta koreksi data yang tidak akurat</li>
                  <li>Meminta penghapusan data (sesuai ketentuan)</li>
                  <li>Menarik persetujuan penggunaan data</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Contact for Legal */}
          <Card className="p-8 bg-muted/50">
            <h3 className="text-xl font-semibold text-foreground mb-4">Kontak Legal</h3>
            <p className="text-muted-foreground mb-4">
              Untuk pertanyaan terkait syarat ketentuan, kebijakan refund, atau privasi, silakan hubungi:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Email:</strong> admin@crxanode.xyz</p>
              <p><strong>WhatsApp:</strong> +62 851-5637-1696</p>
              <p><strong>Jam Operasional:</strong> Senin - Jumat, 09:00 - 17:00 WIB</p>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Legal;