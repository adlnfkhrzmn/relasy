import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
  title: {
    default: "Relasy | Aplikasi CRM Bisnis Terbaik & Manajemen Pipeline Penjualan Indonesia",
    template: "%s | Relasy CRM",
  },
  description:
    "Relasy adalah aplikasi CRM mandiri untuk bisnis modern di Indonesia. Kelola database pelanggan, pantau pipeline penjualan Rupiah, dan gunakan template teks follow-up otomatis dengan privasi data penuh.",
  keywords: [
    "aplikasi CRM Indonesia",
    "CRM UMKM dan bisnis",
    "manajemen pelanggan",
    "pipeline penjualan Rupiah",
    "jadwal follow-up otomatis",
    "template follow-up pelanggan",
    "software sales Indonesia",
    "CRM mandiri aman",
    "Relasy CRM",
  ],
  authors: [{ name: "Relasy CRM" }],
  category: "Business Application",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    title: "Relasy | CRM Bisnis untuk Pertumbuhan Penjualan & Relasi Pelanggan",
    description:
      "Kelola prospek, pantau nilai pipeline penjualan, dan percepat tindak lanjut dengan sistem template teks follow-up pintar.",
    type: "website",
    locale: "id_ID",
    siteName: "Relasy CRM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-[#F7F6F1] dark:bg-[#141615] text-[#252927] dark:text-[#F7F6F1] antialiased selection:bg-[#E9E8FC] selection:text-[#635BCE]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
