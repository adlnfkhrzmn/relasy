"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Kanban,
  List,
  Plus,
  Building,
  Calendar,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { PIPELINE_STAGES, PipelineStage } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Opportunity {
  id: string;
  customer_id: string;
  customer_name: string;
  title: string;
  stage: PipelineStage;
  estimated_value: number;
  expected_close_date: string | null;
  created_at: string;
  updated_at: string;
}

interface CustomerOption {
  id: string;
  name: string;
}

export default function PipelinePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState("");
  const [successFeedback, setSuccessFeedback] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    customerId: "",
    stage: "baru" as PipelineStage,
    estimatedValue: "",
    expectedCloseDate: "",
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorFeedback("");
    try {
      const [oppsRes, custsRes] = await Promise.all([
        fetch("/api/opportunities"),
        fetch("/api/customers"),
      ]);

      if (!oppsRes.ok || !custsRes.ok) {
        throw new Error("Gagal memuat data dari server.");
      }

      const oppsData = await oppsRes.json();
      const custsData = await custsRes.json();

      setOpportunities(oppsData.data || []);
      setCustomers(custsData.data || []);
    } catch {
      setErrorFeedback("Tidak dapat memuat pipeline penjualan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.customerId) {
      setErrorFeedback("Judul peluang dan pelanggan wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorFeedback("");
    try {
      const payload = {
        title: formData.title,
        customerId: formData.customerId,
        stage: formData.stage,
        estimatedValue: formData.estimatedValue ? parseInt(formData.estimatedValue, 10) : 0,
        expectedCloseDate: formData.expectedCloseDate || null,
      };

      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal membuat peluang.");

      setSuccessFeedback(`Peluang "${formData.title}" berhasil dibuat.`);
      setIsAddDialogOpen(false);
      setFormData({
        title: "",
        customerId: "",
        stage: "baru",
        estimatedValue: "",
        expectedCloseDate: "",
      });
      fetchData();
      setTimeout(() => setSuccessFeedback(""), 3500);
    } catch (err: any) {
      setErrorFeedback(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStageChange = async (opportunityId: string, newStage: PipelineStage) => {
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui tahapan peluang.");

      fetchData();
    } catch (err: any) {
      setErrorFeedback(err.message);
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string, title: string) => {
    if (!confirm(`Hapus peluang "${title}"?`)) return;
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus peluang.");
      setSuccessFeedback(`Peluang "${title}" berhasil dihapus.`);
      fetchData();
      setTimeout(() => setSuccessFeedback(""), 3500);
    } catch (err: any) {
      setErrorFeedback(err.message);
    }
  };

  // Group opportunities by stage
  const stageStats = PIPELINE_STAGES.map((stage) => {
    const stageOpps = opportunities.filter((o) => o.stage === stage.id);
    const totalVal = stageOpps.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);
    return {
      ...stage,
      items: stageOpps,
      count: stageOpps.length,
      totalVal,
    };
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pipeline Penjualan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pantau tahapan peluang penjualan mulai dari kontak awal hingga kesepakatan berhasil.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200/60">
              <button
                type="button"
                onClick={() => setViewMode("board")}
                className={`p-1.5 rounded-sm text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === "board"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Tampilan Papan Kanban"
              >
                <Kanban className="w-4 h-4" />
                <span className="hidden sm:inline">Papan</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-sm text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Tabel</span>
              </button>
            </div>

            <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Tambah peluang</span>
            </Button>
          </div>
        </div>

        {/* Feedback Messages */}
        {successFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-md flex items-center justify-between">
            <span>{successFeedback}</span>
            <button
              type="button"
              onClick={() => setSuccessFeedback("")}
              className="text-emerald-700 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {errorFeedback && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorFeedback}</span>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-lg">
            Memuat peluang penjualan...
          </div>
        ) : opportunities.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={Kanban}
              title="Belum ada peluang penjualan"
              description="Buat peluang baru untuk memantau nilai transaksi dan tahapan negosiasi dengan pelanggan Anda."
              action={
                <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Tambah peluang baru</span>
                </Button>
              }
            />
          </Card>
        ) : viewMode === "board" ? (
          /* Kanban Board */
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x">
            {stageStats.map((col) => (
              <div
                key={col.id}
                className="w-72 sm:w-80 shrink-0 bg-slate-100/90 rounded-lg border border-slate-200 flex flex-col max-h-[calc(100vh-220px)] snap-start shadow-xs"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">{col.label}</span>
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      {col.count}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    {formatCurrency(col.totalVal)}
                  </span>
                </div>

                {/* Column Cards Container */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[160px]">
                  {col.items.length === 0 ? (
                    <div className="h-full flex items-center justify-center p-4 border border-dashed border-slate-200 rounded-md bg-white/40 text-center">
                      <p className="text-xs text-slate-400">Belum ada peluang</p>
                    </div>
                  ) : (
                    col.items.map((opp) => (
                      <div
                        key={opp.id}
                        className="p-3.5 bg-white rounded-md border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                            {opp.title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleDeleteOpportunity(opp.id, opp.title)}
                            className="p-1 text-slate-400 hover:text-red-700 rounded transition-colors"
                            title="Hapus peluang"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-xs text-slate-600">
                          <Link
                            href={`/pelanggan/${opp.customer_id}`}
                            className="text-blue-700 hover:underline font-medium inline-flex items-center gap-1"
                          >
                            <span>{opp.customer_name}</span>
                          </Link>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <span className="font-bold text-slate-900">
                            {formatCurrency(opp.estimated_value)}
                          </span>
                          {opp.expected_close_date && (
                            <span className="text-[11px] text-slate-500">
                              {formatDate(opp.expected_close_date)}
                            </span>
                          )}
                        </div>

                        {/* Accessible Stage Transition Selector (R-32) */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400">Pindah tahap:</span>
                          <select
                            value={opp.stage}
                            onChange={(e) =>
                              handleStageChange(opp.id, e.target.value as PipelineStage)
                            }
                            aria-label={`Ubah tahapan peluang ${opp.title}`}
                            className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 font-medium focus-visible:ring-1 focus-visible:ring-blue-600 cursor-pointer"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <Card className="overflow-hidden divide-y divide-slate-100">
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 text-xs font-semibold text-slate-600 border-b border-slate-200/80">
              <div className="col-span-4">Judul Peluang</div>
              <div className="col-span-3">Pelanggan</div>
              <div className="col-span-2">Tahapan</div>
              <div className="col-span-2 text-right">Nilai Estimasi</div>
              <div className="col-span-1 text-right">Tindakan</div>
            </div>

            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-4 sm:px-5 sm:py-3.5 hover:bg-slate-50/80 transition-colors flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center"
              >
                <div className="col-span-4">
                  <p className="font-semibold text-sm text-slate-900">{opp.title}</p>
                  {opp.expected_close_date && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Target: {formatDate(opp.expected_close_date)}
                    </p>
                  )}
                </div>

                <div className="col-span-3 text-xs">
                  <Link
                    href={`/pelanggan/${opp.customer_id}`}
                    className="text-blue-700 hover:underline font-medium"
                  >
                    {opp.customer_name}
                  </Link>
                </div>

                <div className="col-span-2">
                  <Badge variant="neutral" size="sm">
                    {PIPELINE_STAGES.find((s) => s.id === opp.stage)?.label || opp.stage}
                  </Badge>
                </div>

                <div className="col-span-2 md:text-right font-bold text-sm text-slate-900">
                  {formatCurrency(opp.estimated_value)}
                </div>

                <div className="col-span-1 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteOpportunity(opp.id, opp.title)}
                    className="p-1.5 text-slate-400 hover:text-red-700 rounded transition-colors cursor-pointer"
                    title="Hapus peluang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Modal Tambah Peluang */}
        <Dialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          title="Tambah Peluang Penjualan"
          description="Catat peluang baru yang sedang berjalan dengan pelanggan."
        >
          <form onSubmit={handleCreateOpportunity} className="space-y-4">
            <Input
              label="Judul Peluang"
              placeholder="Contoh: Pengadaan Paket Peralatan Kantor"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <div className="space-y-1.5">
              <label htmlFor="opp-customer" className="block text-sm font-medium text-slate-800">
                Pelanggan Terkait <span className="text-red-600">*</span>
              </label>
              <select
                id="opp-customer"
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm text-slate-900 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <option value="">-- Pilih pelanggan --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {customers.length === 0 && (
                <p className="text-xs text-amber-700 mt-1">
                  Belum ada pelanggan terdaftar.{" "}
                  <Link href="/pelanggan" className="underline font-semibold">
                    Tambah pelanggan terlebih dahulu
                  </Link>
                  .
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Estimasi Nilai (Rp)"
                type="number"
                placeholder="Contoh: 15000000"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
              />
              <Select
                label="Tahapan Awal"
                required
                value={formData.stage}
                onChange={(e) =>
                  setFormData({ ...formData, stage: e.target.value as PipelineStage })
                }
                options={PIPELINE_STAGES.map((s) => ({ value: s.id, label: s.label }))}
              />
            </div>

            <Input
              label="Target Tanggal Selesai (Opsional)"
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
            />

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmitting}
                disabled={customers.length === 0}
              >
                Simpan peluang
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AppShell>
  );
}
