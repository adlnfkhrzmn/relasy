"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Building,
  Archive,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  source: string | null;
  notes: string | null;
  created_at: string;
  archived_at: string | null;
}

export default function PelangganPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"active" | "archived">("active");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState("");
  const [successFeedback, setSuccessFeedback] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    source: "",
    notes: "",
  });

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setErrorFeedback("");
    try {
      const isArchived = filterTab === "archived";
      const query = new URLSearchParams({
        archived: isArchived ? "true" : "false",
        ...(searchQuery ? { search: searchQuery } : {}),
      });

      const res = await fetch(`/api/customers?${query.toString()}`);
      if (!res.ok) {
        throw new Error("Gagal mengambil data pelanggan");
      }
      const data = await res.json();
      setCustomers(data.data || []);
    } catch {
      setErrorFeedback("Tidak dapat memuat daftar pelanggan dari server.");
    } finally {
      setIsLoading(false);
    }
  }, [filterTab, searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorFeedback("Nama lengkap wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorFeedback("");
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan pelanggan");
      }

      setSuccessFeedback(`Pelanggan "${formData.name}" berhasil ditambahkan.`);
      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        company: "",
        source: "",
        notes: "",
      });
      fetchCustomers();
      setTimeout(() => setSuccessFeedback(""), 4000);
    } catch (err: any) {
      setErrorFeedback(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleArchive = async (id: string, currentArchived: boolean, name: string) => {
    const action = currentArchived ? "restore" : "archive";
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error("Gagal mengubah status arsip.");

      setSuccessFeedback(
        currentArchived
          ? `Pelanggan "${name}" berhasil dipulihkan.`
          : `Pelanggan "${name}" berhasil dipindahkan ke arsip.`
      );
      fetchCustomers();
      setTimeout(() => setSuccessFeedback(""), 3500);
    } catch (err: any) {
      setErrorFeedback(err.message);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Daftar Pelanggan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola data kontak, informasi bisnis, dan riwayat hubungan pelanggan Anda.
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-1.5 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Tambah pelanggan</span>
          </Button>
        </div>

        {/* Feedback Messages */}
        {successFeedback && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-md flex items-center justify-between">
            <span>{successFeedback}</span>
            <button
              type="button"
              onClick={() => setSuccessFeedback("")}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {errorFeedback && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorFeedback}</span>
          </div>
        )}

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, nomor telepon, email, perusahaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md self-start sm:self-auto border border-slate-200/60">
            <button
              type="button"
              onClick={() => setFilterTab("active")}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                filterTab === "active"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Aktif
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("archived")}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                filterTab === "archived"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Diarsipkan
            </button>
          </div>
        </div>

        {/* Customer Content */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-lg">
            Memuat data pelanggan...
          </div>
        ) : customers.length === 0 ? (
          <Card className="overflow-hidden">
            <EmptyState
              icon={Users}
              title={
                searchQuery
                  ? "Tidak ada pelanggan yang cocok"
                  : filterTab === "active"
                  ? "Belum ada pelanggan aktif"
                  : "Belum ada pelanggan yang diarsipkan"
              }
              description={
                searchQuery
                  ? `Tidak ditemukan pelanggan yang cocok dengan pencarian "${searchQuery}". Coba kata kunci lain.`
                  : filterTab === "active"
                  ? "Tambahkan pelanggan pertama Anda untuk mulai mencatat kontak, riwayat interaksi, dan follow-up."
                  : "Pelanggan yang Anda nonaktifkan atau arsipkan akan ditampilkan di bagian ini."
              }
              action={
                filterTab === "active" && !searchQuery ? (
                  <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Tambah pelanggan pertama</span>
                  </Button>
                ) : null
              }
            />
          </Card>
        ) : (
          <Card className="overflow-hidden divide-y divide-slate-100">
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 text-xs font-semibold text-slate-600 border-b border-slate-200/80">
              <div className="col-span-4">Nama Pelanggan</div>
              <div className="col-span-3">Kontak</div>
              <div className="col-span-3">Perusahaan & Sumber</div>
              <div className="col-span-2 text-right">Tindakan</div>
            </div>

            {customers.map((cust) => (
              <div
                key={cust.id}
                className="p-4 sm:px-5 sm:py-3.5 hover:bg-slate-50/80 transition-colors flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center"
              >
                {/* Name & ID */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm shrink-0">
                    {cust.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <Link
                      href={`/pelanggan/${cust.id}`}
                      className="font-semibold text-sm text-slate-900 hover:text-blue-700 transition-colors flex items-center gap-1 group truncate"
                    >
                      <span className="truncate">{cust.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 shrink-0" />
                    </Link>
                    <p className="text-[11px] text-slate-400">
                      Terdaftar: {formatDate(cust.created_at)}
                    </p>
                  </div>
                </div>

                {/* Contacts */}
                <div className="col-span-3 space-y-1 text-xs text-slate-600">
                  {cust.phone ? (
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cust.phone}</span>
                    </div>
                  ) : null}
                  {cust.email ? (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cust.email}</span>
                    </div>
                  ) : null}
                  {!cust.phone && !cust.email && <span className="text-slate-400 italic">Belum ada kontak</span>}
                </div>

                {/* Company & Source */}
                <div className="col-span-3 space-y-1 text-xs text-slate-600">
                  {cust.company ? (
                    <div className="flex items-center gap-1.5 truncate">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{cust.company}</span>
                    </div>
                  ) : null}
                  {cust.source ? (
                    <Badge variant="neutral" size="sm">
                      {cust.source}
                    </Badge>
                  ) : null}
                  {!cust.company && !cust.source && <span className="text-slate-400">-</span>}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-1.5 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link href={`/pelanggan/${cust.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-700 hover:text-blue-700">
                      Rincian
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleArchive(cust.id, !!cust.archived_at, cust.name)}
                    className="h-8 px-2 text-xs text-slate-500 hover:text-slate-800"
                    title={cust.archived_at ? "Pulihkan dari arsip" : "Arsipkan pelanggan"}
                  >
                    {cust.archived_at ? (
                      <RotateCcw className="w-3.5 h-3.5" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Modal Tambah Pelanggan */}
        <Dialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          title="Tambah Pelanggan Baru"
          description="Masukkan informasi kontak pelanggan untuk mulai mengelola relasi."
        >
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <Input
              label="Nama Lengkap"
              placeholder="Contoh: Budi Santoso"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nomor Telepon / WhatsApp"
                placeholder="Contoh: 081234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                placeholder="nama@perusahaan.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <Input
              label="Perusahaan / Usaha (Opsional)"
              placeholder="Contoh: CV Maju Bersama"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            <Input
              label="Sumber Pelanggan (Opsional)"
              placeholder="Contoh: Rekomendasi, Media Sosial, Website"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            />
            <div className="space-y-1.5">
              <label htmlFor="customer-notes" className="block text-sm font-medium text-slate-800">
                Catatan Tambahan
              </label>
              <textarea
                id="customer-notes"
                rows={3}
                placeholder="Tuliskan catatan penting tentang preferensi atau kebutuhan pelanggan..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Simpan pelanggan
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AppShell>
  );
}
