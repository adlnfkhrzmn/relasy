import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-toggle";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://relasy.vercel.app";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F6F1" },
    { media: "(prefers-color-scheme: dark)", color: "#141615" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
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
  authors: [{ name: "Relasy CRM", url: APP_URL }],
  creator: "Relasy CRM",
  publisher: "Relasy CRM",
  category: "Business Application",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Relasy | CRM Bisnis untuk Pertumbuhan Penjualan & Relasi Pelanggan",
    description:
      "Kelola prospek, pantau nilai pipeline penjualan, dan percepat tindak lanjut dengan sistem template teks follow-up pintar.",
    url: APP_URL,
    type: "website",
    locale: "id_ID",
    siteName: "Relasy CRM",
    images: [
      {
        url: "/logo-1.png",
        width: 1200,
        height: 1200,
        alt: "Logo Resmi Relasy CRM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Relasy | CRM Bisnis & Manajemen Pipeline Penjualan",
    description:
      "Kelola pelanggan dan pipeline penjualan Rupiah dengan custom template follow-up otomatis.",
    images: ["/logo-1.png"],
    creator: "@relasycrm",
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
