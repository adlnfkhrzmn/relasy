"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { LuxuryNotification } from "@/components/ui/luxury-toast";
import {
  MarkBuilding,
  MarkUser,
  MarkDatabase,
  MarkShield,
  MarkCheckCircle,
  MarkLock,
} from "@/components/ui/marks";

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
        const res = await fetch("/api/auth/me", { cache: "no-store" });
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
      const data = await res.json();
      if (data?.user) {
        setWorkspaceName(data.user.workspaceName || workspaceName);
        window.dispatchEvent(
          new CustomEvent("relasy:profile-updated", { detail: data.user })
        );
      }
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
      const data = await res.json();
      if (data?.user) {
        setOwnerName(data.user.name || ownerName);
        setOwnerEmail(data.user.email || ownerEmail);
        window.dispatchEvent(
          new CustomEvent("relasy:profile-updated", { detail: data.user })
        );
      }
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
      <div className="space-y-6">
        <div className="bg-[#FFFFFF] border border-[#E5E4DE] rounded-xl p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#252927] tracking-tight">
              Pengaturan Akun & Workspace
            </h1>
            <p className="text-xs sm:text-sm text-[#6F716D] mt-1">
              Kelola profil pemilik usaha dan konfigurasi data aplikasi Relasy Anda.
            </p>
          </div>

          <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#F7F6F1] border border-[#E5E4DE] self-start sm:self-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
            <div className="text-left">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6F716D]">
                Ruang Kerja Aktif
              </p>
              <p className="text-xs font-bold text-[#252927] truncate max-w-[180px]">
                {workspaceName}
              </p>
            </div>
          </div>
        </div>

        {/* Luxury Feedback Messages */}
        {successFeedback && (
          <LuxuryNotification
            variant="luxury"
            title="Konfigurasi Tersimpan"
            message={successFeedback}
            onClose={() => setSuccessFeedback("")}
          />
        )}

        {errorFeedback && (
          <LuxuryNotification
            variant="error"
            title="Perhatian Pengaturan"
            message={errorFeedback}
            onClose={() => setErrorFeedback("")}
          />
        )}

        {/* Balanced 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Forms */}
          <div className="lg:col-span-7 space-y-6">
            {/* Workspace Info */}
            <Card className="rounded-xl shadow-2xs overflow-hidden">
              <CardHeader className="bg-[#FFFFFF] pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E9E8FC] border border-[#635BCE]/20 flex items-center justify-center text-[#635BCE] shrink-0 mt-0.5">
                    <MarkBuilding className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Profil Usaha</CardTitle>
                    <CardDescription className="mt-0.5">
                      Nama bisnis yang tertera pada catatan CRM dan laporan ringkasan.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handleSaveWorkspace}>
                <CardContent className="space-y-4 pt-5">
                  <Input
                    label="Nama Usaha / Workspace"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    required
                    disabled={isLoading}
                    helperText="Perubahan nama usaha akan langsung diterapkan pada menu samping dan bar ruang kerja."
                  />
                </CardContent>
                <CardFooter className="flex items-center justify-between gap-3 bg-[#F7F6F1]/70">
                  <span className="text-[11px] text-[#6F716D] hidden sm:inline">
                    Tersinkronisasi otomatis ke seluruh halaman CRM
                  </span>
                  <Button type="submit" size="sm" isLoading={isSavingWs} disabled={isLoading}>
                    Simpan perubahan usaha
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* User Account Info */}
            <Card className="rounded-xl shadow-2xs overflow-hidden">
              <CardHeader className="bg-[#FFFFFF] pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E9E8FC] border border-[#635BCE]/20 flex items-center justify-center text-[#635BCE] shrink-0 mt-0.5">
                    <MarkUser className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Profil Pengguna</CardTitle>
                    <CardDescription className="mt-0.5">
                      Informasi login dan kontak pemilik akun.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handleSaveUser}>
                <CardContent className="space-y-4 pt-5">
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
                <CardFooter className="flex items-center justify-between gap-3 bg-[#F7F6F1]/70">
                  <span className="text-[11px] text-[#6F716D] hidden sm:inline">
                    Digunakan sebagai identitas sesi pengelola utama
                  </span>
                  <Button type="submit" size="sm" isLoading={isSavingUser} disabled={isLoading}>
                    Perbarui profil
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Right Column: Live Account Preview & Database Status */}
          <div className="lg:col-span-5 space-y-6">
            {/* Active Identity Summary */}
            <Card className="rounded-xl shadow-2xs overflow-hidden">
              <CardHeader className="bg-[#FFFFFF] pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E9E8FC] border border-[#635BCE]/20 flex items-center justify-center text-[#635BCE] shrink-0 mt-0.5">
                    <MarkShield className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Ringkasan Identitas Aktif</CardTitle>
                    <CardDescription className="mt-0.5">
                      Pratinjau langsung profil ruang kerja yang tampil di aplikasi.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="p-3.5 rounded-lg bg-[#F7F6F1] border border-[#E5E4DE] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#635BCE] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {(workspaceName || "U").trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#252927] truncate">
                      {workspaceName || "Usaha Saya"}
                    </p>
                    <p className="text-xs text-[#6F716D] truncate">
                      {ownerName} · {ownerEmail}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-[#E5E4DE]">
                    <span className="text-[#6F716D]">Pengelola Utama</span>
                    <span className="font-semibold text-[#252927]">{ownerName}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-[#E5E4DE]">
                    <span className="text-[#6F716D]">Email Terdaftar</span>
                    <span className="font-mono text-[#252927]">{ownerEmail}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[#6F716D]">Status Sesi</span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <MarkCheckCircle className="w-3.5 h-3.5" />
                      Terautentikasi
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database & Security Status */}
            <Card className="rounded-xl shadow-2xs overflow-hidden">
              <CardHeader className="bg-[#FFFFFF] pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F7F6F1] border border-[#E5E4DE] flex items-center justify-center text-[#252927] shrink-0 mt-0.5">
                    <MarkDatabase className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">
                      Status Penyimpanan & Keamanan
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                      Informasi teknis database lokal dan sesi ruang kerja.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-3 text-xs text-[#6F716D]">
                <div className="flex items-center justify-between py-2 border-b border-[#E5E4DE]">
                  <span className="font-medium text-[#252927]">Tipe Database:</span>
                  <span className="font-mono text-[#252927] bg-[#F7F6F1] border border-[#E5E4DE] px-2.5 py-0.5 rounded-md">
                    SQLite (Lokal Mandiri)
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#E5E4DE]">
                  <span className="font-medium text-[#252927]">Status Database:</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    Tersimpan di sistem lokal
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-[#252927]">Isolasi Data:</span>
                  <span className="inline-flex items-center gap-1.5 text-[#252927] font-medium">
                    <MarkLock className="w-3.5 h-3.5 text-[#635BCE]" />
                    Terkunci pada workspace Anda
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
