"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/ringkasan");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Email atau kata sandi tidak cocok. Silakan coba lagi.");
      }
    } catch {
      setError("Terjadi kendala jaringan. Pastikan koneksi server tersedia.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-700 text-white font-bold text-xl mb-4 shadow-sm">
          R
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Masuk ke Relasy</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Aplikasi CRM mandiri untuk mengelola relasi pelanggan dan penjualan Anda.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md font-medium">
                {error}
              </div>
            )}

            <Input
              label="Alamat Email"
              type="email"
              required
              placeholder="nama@usaha.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <Input
              label="Kata Sandi"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <Button type="submit" size="md" className="w-full mt-2" isLoading={isLoading}>
              Masuk
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Menggunakan penyimpanan database lokal Relasy.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
