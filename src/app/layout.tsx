import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relasy | CRM Ringan untuk Bisnis",
  description:
    "Aplikasi CRM mandiri untuk mencatat pelanggan, memantau pipeline penjualan, dan menjadwalkan follow-up tepat waktu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
