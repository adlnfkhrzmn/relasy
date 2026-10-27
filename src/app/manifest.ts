import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Relasy CRM - Solusi CRM Bisnis & Pipeline Penjualan Indonesia",
    short_name: "Relasy",
    description:
      "Relasy adalah aplikasi CRM mandiri untuk bisnis Indonesia. Kelola database pelanggan, pantau pipeline penjualan Rupiah, dan buat jadwal follow-up otomatis.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F6F1",
    theme_color: "#635BCE",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
