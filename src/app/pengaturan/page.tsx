"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Building2, User, Database, ShieldCheck, Check, AlertCircle } from "lucide-react";

export default function PengaturanPage() {
  const [workspaceName, setWorkspaceName] = useState("Usaha Saya");
  const [ownerName, setOwnerName] = useState("Pemilik Usaha");
  const [ownerEmail, setOwnerEmail] = useState("pemilik@usaha.id");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingWs, setIsSavingWs] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState("");
  const [errorFeedback, setErrorFeedback] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setWorkspaceName(data.user.workspaceName || "Usaha Saya");
            setOwnerName(data.user.name || "Pemilik Usaha");
            setOwnerEmail(data.user.email || "pemilik@usaha.id");
          }
        }
      } catch {
        // Ignored fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWs(true);
    setErrorFeedback("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceName }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan nama usaha.");
      setSuccessFeedback("Nama usaha berhasil diperbarui.");
      setTimeout(() => setSuccessFeedback(""), 3500);
    } catch (err: any) {
      setErrorFeedback(err.message);
    } finally {
      setIsSavingWs(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUser(true);
    setErrorFeedback("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: ownerName, email: ownerEmail }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan profil pengguna.");
      setSuccessFeedback("Profil pengguna berhasil diperbarui.");
      setTimeout(() => setSuccessFeedback(""), 3500);
    } catch (err: any) {
      setErrorFeedback(err.message);
    } finally {
      setIsSavingUser(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pengaturan Akun & Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola profil pemilik usaha dan konfigurasi data aplikasi Relasy Anda.
          </p>
        </div>

        {/* Feedback Messages */}
        {successFeedback && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-md flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successFeedback}</span>
          </div>
        )}

        {errorFeedback && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorFeedback}</span>
          </div>
        )}

        {/* Workspace Info */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Profil Usaha</CardTitle>
              <CardDescription>Nama bisnis yang tertera pada catatan CRM dan laporan ringkasan.</CardDescription>
            </div>
            <Building2 className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <form onSubmit={handleSaveWorkspace}>
            <CardContent className="space-y-4">
              <Input
                label="Nama Usaha / Workspace"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
                disabled={isLoading}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" size="sm" isLoading={isSavingWs} disabled={isLoading}>
                Simpan perubahan usaha
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* User Account Info */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Profil Pengguna</CardTitle>
              <CardDescription>Informasi login dan kontak pemilik akun.</CardDescription>
            </div>
            <User className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <form onSubmit={handleSaveUser}>
            <CardContent className="space-y-4">
              <Input
                label="Nama Lengkap"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                disabled={isLoading}
              />
              <Input
                label="Alamat Email"
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" size="sm" isLoading={isSavingUser} disabled={isLoading}>
                Perbarui profil
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Database & Security Status */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Status Penyimpanan & Keamanan</CardTitle>
              <CardDescription>Informasi teknis database lokal dan sesi aman.</CardDescription>
            </div>
            <Database className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="font-medium text-slate-700">Tipe Database:</span>
              <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded">SQLite (Lokal Mandiri)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="font-medium text-slate-700">Status Database:</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Tersimpan di sistem lokal
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-slate-700">Isolasi Data:</span>
              <span className="text-slate-800">Terkunci pada workspace Anda</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
