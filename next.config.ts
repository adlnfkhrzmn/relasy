import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `postgres` adalah driver TCP murni JavaScript. Menandainya sebagai
  // external mencegah Next.js mencoba mem-bundel-nya ke dalam output
  // serverless, sehingga koneksi pooler Supabase tetap bekerja.
  serverExternalPackages: ["postgres"],
  reactStrictMode: true,
};

export default nextConfig;
