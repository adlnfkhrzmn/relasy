"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { LuxuryNotification } from "@/components/ui/luxury-toast";
import {
  DEFAULT_FOLLOWUP_TEMPLATE,
  generateFollowupText,
  buildManualWhatsAppHref,
} from "@/lib/followup-template";
import { PIPELINE_STAGES } from "@/lib/constants";
import {
  MarkArrowLeft,
  MarkBuilding,
  MarkEdit,
  MarkArchive,
  MarkRestore,
  MarkTrash,
  MarkClock,
  MarkFunnel,
  MarkSchedule,
  MarkPlus,
  MarkExternal,
  MarkMessage,
  MarkCheck,
} from "@/components/ui/marks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";

interface CustomerDetailProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({ params }: CustomerDetailProps) {
  const router = useRouter();
  const { id } = use(params);

  const [customer, setCustomer] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorFeedback, setErrorFeedback] = useState("");
  const [successFeedback, setSuccessFeedback] = useState("");
  const [templateConfig, setTemplateConfig] = useState({
    is_enabled: true,
    template_text: DEFAULT_FOLLOWUP_TEMPLATE,
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    source: "",
    notes: "",
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);
  const [activityForm, setActivityForm] = useState({
    type: "catatan",
    title: "",
    body: "",
  });

  const [activeTab, setActiveTab] = useState<"activities" | "opportunities" | "followups">(
    "activities"
  );
  const [confirmCompleteFollowup, setConfirmCompleteFollowup] = useState<any | null>(null);
  const [isCompletingFollowup, setIsCompletingFollowup] = useState(false);

  const handleConfirmCompleteFollowup = async (flw: any) => {
    setIsCompletingFollowup(true);
    try {
      const res = await fetch(`/api/followups/${flw.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_status" }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status tugas follow-up.");
      setConfirmCompleteFollowup(null);
      setSuccessFeedback(
        flw.status === "completed"
          ? `Tugas "${flw.title}" dibuka kembali.`
          : `Tugas "${flw.title}" berhasil ditandai selesai.`
      );
      loadCustomer();
      setTimeout(() => setSuccessFeedback(""), 3500);
    } catch (err: any) {
      setErrorFeedback(err.message);
    } finally {
      setIsCompletingFollowup(false);
    }
  };

  const loadCustomer = useCallback(async () => {
    setIsLoading(true);
    setErrorFeedback("");
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Pelanggan tidak ditemukan.");
        }
        throw new Error("Gagal memuat data pelanggan.");
      }
      const data = await res.json();
      const c = data.data.customer;
      setCustomer(c);
      setOpportunities(data.data.opportunities || []);
      setFollowups(data.data.followups || []);
      setActivities(data.data.activities || []);

      setEditForm({
        name: c.name || "",
        phone: c.phone || "",
        email: c.email || "",
        company: c.company || "",
        source: c.source || "",
        notes: c.notes || "",
      });
    } catch (err: any) {
      setErrorFeedback(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCustomer();
    fetch("/api/followup-template")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.data) {
          setTemplateConfig({
            is_enabled: Boolean(json.data.is_enabled),
            template_text: json.data.template_text || DEFAULT_FOLLOWUP_TEMPLATE,
          });
        }
      })
      .catch(() => {});
  }, [loadCustomer]);

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEdit(true);
    setErrorFeedback("");
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui pelanggan.");

      setSuccessFeedback("Informasi pelanggan berhasil diperbarui.");
      setIsEditDialogOpen(false);
      loadCustomer();
      setTimeout(() => setSuccessFeedback(""), 3500);
    } catch (err: any) {
      setErrorFeedback(err.message);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleToggleArchive = async () => {
    if (!customer) return;
    const action = customer.archived_at ? "restore" : "archive";
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status arsip.");

      setSuccessFeedback(
        customer.archived_at
          ? "Pelanggan berhasil dipulihkan."
          : "Pelanggan berhasil diarsipkan."
      );
      loadCustomer();
      setTimeout(() => setSuccessFeedback(""), 3500);
    } catch (err: any) {
      setErrorFeedback(err.message);
    }
  };

  const handleDeleteCustomer = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus pelanggan.");
      router.push("/pelanggan");
    } catch (err: any) {
      setErrorFeedback(err.message);
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.title.trim()) {
      setErrorFeedback("Ringkasan aktivitas wajib diisi.");
      return;
    }

    setIsSubmittingActivity(true);
    setErrorFeedback("");
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: id,
          type: activityForm.type,
          title: activityForm.title,
          body: activityForm.body || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mencatat aktivitas.");

      setSuccessFeedback("Aktivitas berhasil dicatat.");
      setIsAddActivityOpen(false);
      setActivityForm({ type: "catatan", title: "", body: "" });
      loadCustomer();
      setTimeout(() => setSuccessFeedback(""), 3500);
    } catch (err: any) {
      setErrorFeedback(err.message);
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  const getWhatsAppLink = (rawPhone: string | null) => {
    if (!rawPhone) return null;
    const prefilled = templateConfig.is_enabled
      ? generateFollowupText(templateConfig.template_text, {
          customerName: customer?.name,
          company: customer?.company,
          taskTitle: followups[0]?.title || "kerja sama bisnis kita",
          dueAt: followups[0]?.due_at || new Date().toISOString().split("T")[0],
        })
      : null;
    return buildManualWhatsAppHref(rawPhone, prefilled);
  };

  const getStageLabel = (stageId: string) => {
    return PIPELINE_STAGES.find((s) => s.id === stageId)?.label || stageId;
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <Link
            href="/pelanggan"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6F716D] hover:text-[#252927] transition-colors no-underline"
          >
            <MarkArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke daftar pelanggan</span>
          </Link>
        </div>

        {successFeedback && (
          <LuxuryNotification
            variant="luxury"
            title="Pembaruan Profil Pelanggan"
            message={successFeedback}
            onClose={() => setSuccessFeedback("")}
          />
        )}

        {errorFeedback && (
          <LuxuryNotification
            variant="error"
            title="Perhatian Profil Pelanggan"
            message={errorFeedback}
            onClose={() => setErrorFeedback("")}
          />
        )}

        {isLoading ? (
          <div
            aria-busy="true"
            aria-label="Memuat informasi pelanggan"
            className="p-6 bg-[#FFFFFF] border border-[#E5E4DE] rounded-xl space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F7F6F1] animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-48 bg-[#F7F6F1] animate-pulse rounded" />
                <div className="h-3.5 w-32 bg-[#F7F6F1] animate-pulse rounded" />
              </div>
            </div>
            <p className="text-xs text-[#A8AAA4]">Memuat informasi pelanggan...</p>
          </div>
        ) : !customer ? (
          <Card className="p-8 text-center rounded-xl">
            <h2 className="text-base font-semibold text-[#252927]">
              Pelanggan Tidak Ditemukan
            </h2>
            <p className="text-xs text-[#6F716D] mt-1 mb-4">
              Data pelanggan ini mungkin sudah dihapus atau tidak terdaftar pada workspace Anda.
            </p>
            <Link href="/pelanggan">
              <Button size="sm">Kembali ke Daftar</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-5 sm:p-6 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#635BCE] text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-xs">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-[#252927]">{customer.name}</h1>
                      {customer.archived_at && (
                        <Badge variant="warning" size="sm">
                          Diarsipkan
                        </Badge>
                      )}
                      {customer.source && (
                        <Badge variant="neutral" size="sm">
                          {customer.source}
                        </Badge>
                      )}
                    </div>
                    {customer.company && (
                      <p className="text-xs text-[#6F716D] flex items-center gap-1.5 mt-1 font-medium">
                        <MarkBuilding className="w-3.5 h-3.5 text-[#6F716D]" />
                        <span>{customer.company}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-[#6F716D] mt-1">
                      Terdaftar pada {formatDate(customer.created_at, true)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  {customer.phone && (
                    <a
                      href={getWhatsAppLink(customer.phone) || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[#E5E4DE] bg-[#FFFFFF] text-[#252927] hover:bg-[#F7F6F1] transition-colors no-underline"
                      title="Buka WhatsApp manual (tautan eksternal)"
                    >
                      <MarkMessage className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                      <MarkExternal className="w-3 h-3 text-[#6F716D]" />
                    </a>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="gap-1.5 text-xs"
                  >
                    <MarkEdit className="w-3.5 h-3.5" />
                    <span>Ubah data</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleArchive}
                    className="gap-1.5 text-xs text-[#6F716D]"
                  >
                    {customer.archived_at ? (
                      <>
                        <MarkRestore className="w-3.5 h-3.5 text-[#635BCE]" />
                        <span>Pulihkan</span>
                      </>
                    ) : (
                      <>
                        <MarkArchive className="w-3.5 h-3.5" />
                        <span>Arsipkan</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="p-2 text-[#6F716D] hover:text-red-700 hover:bg-red-50"
                    title="Hapus pelanggan permanen"
                  >
                    <MarkTrash className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 mt-5 border-t border-[#E5E4DE] text-xs">
                <div>
                  <span className="text-[#6F716D] block mb-0.5">Nomor Telepon:</span>
                  <span className="font-semibold text-[#252927]">{customer.phone || "-"}</span>
                </div>
                <div>
                  <span className="text-[#6F716D] block mb-0.5">Alamat Email:</span>
                  <span className="font-semibold text-[#252927]">{customer.email || "-"}</span>
                </div>
                <div>
                  <span className="text-[#6F716D] block mb-0.5">Perusahaan:</span>
                  <span className="font-semibold text-[#252927]">{customer.company || "-"}</span>
                </div>
              </div>

              {customer.notes && (
                <div className="mt-4 pt-4 border-t border-[#E5E4DE]">
                  <span className="text-[#6F716D] text-xs block mb-1">Catatan Kebutuhan:</span>
                  <p className="text-xs text-[#252927] bg-[#F7F6F1] border border-[#E5E4DE] p-3 rounded-lg whitespace-pre-wrap leading-relaxed">
                    {customer.notes}
                  </p>
                </div>
              )}
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-1 p-1.5 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] overflow-x-auto shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("activities")}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === "activities"
                      ? "text-[#635BCE] font-bold"
                      : "text-[#6F716D] hover:text-[#252927]"
                  }`}
                >
                  {activeTab === "activities" && (
                    <motion.span
                      layoutId="customer-detail-tab-pill"
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 bg-[#E9E8FC] border border-[#D5D3F5] rounded-lg"
                    />
                  )}
                  <MarkClock className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Riwayat Aktivitas ({activities.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("opportunities")}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === "opportunities"
                      ? "text-[#635BCE] font-bold"
                      : "text-[#6F716D] hover:text-[#252927]"
                  }`}
                >
                  {activeTab === "opportunities" && (
                    <motion.span
                      layoutId="customer-detail-tab-pill"
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 bg-[#E9E8FC] border border-[#D5D3F5] rounded-lg"
                    />
                  )}
                  <MarkFunnel className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">
                    Peluang Penjualan ({opportunities.length})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("followups")}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === "followups"
                      ? "text-[#635BCE] font-bold"
                      : "text-[#6F716D] hover:text-[#252927]"
                  }`}
                >
                  {activeTab === "followups" && (
                    <motion.span
                      layoutId="customer-detail-tab-pill"
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 bg-[#E9E8FC] border border-[#D5D3F5] rounded-lg"
                    />
                  )}
                  <MarkSchedule className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Jadwal Follow-up ({followups.length})</span>
                </button>
              </div>

              {activeTab === "activities" && (
                <Card className="p-5 rounded-2xl">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E4DE]">
                    <h3 className="text-sm font-bold text-[#252927]">
                      Riwayat Aktivitas &amp; Komunikasi
                    </h3>
                    <Button
                      size="sm"
                      onClick={() => setIsAddActivityOpen(true)}
                      className="gap-1.5 text-xs h-8"
                    >
                      <MarkPlus className="w-3.5 h-3.5" />
                      <span>Catat aktivitas baru</span>
                    </Button>
                  </div>

                  {activities.length === 0 ? (
                    <EmptyState
                      icon={MarkClock}
                      title="Belum ada catatan aktivitas"
                      description="Catatan panggilan, pertemuan, atau diskusi dengan pelanggan ini akan tersimpan di sini."
                      action={
                        <Button
                          size="sm"
                          onClick={() => setIsAddActivityOpen(true)}
                          className="gap-1.5"
                        >
                          <MarkPlus className="w-4 h-4" />
                          <span>Catat aktivitas pertama</span>
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {activities.map((act) => (
                        <div
                          key={act.id}
                          className="p-4 bg-[#F7F6F1] rounded-xl border border-[#E5E4DE]"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="neutral" size="sm">
                                {act.type === "catatan"
                                  ? "Catatan"
                                  : act.type === "telepon"
                                  ? "Telepon"
                                  : act.type === "pertemuan"
                                  ? "Pertemuan"
                                  : act.type === "pesan_manual"
                                  ? "Pesan manual"
                                  : "Lainnya"}
                              </Badge>
                              <span className="font-bold text-[#252927]">{act.title}</span>
                            </div>
                            <span className="text-[#6F716D] shrink-0">
                              {formatDate(act.happened_at, true)}
                            </span>
                          </div>
                          {act.body && (
                            <p className="text-xs text-[#6F716D] mt-2 whitespace-pre-wrap leading-relaxed">
                              {act.body}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {activeTab === "opportunities" && (
                <Card className="p-5 rounded-2xl">
                  {opportunities.length === 0 ? (
                    <EmptyState
                      icon={MarkFunnel}
                      title="Belum ada peluang penjualan"
                      description="Peluang transaksi atau proyek dengan pelanggan ini akan ditampilkan di sini."
                    />
                  ) : (
                    <div className="space-y-3">
                      {opportunities.map((opp) => (
                        <div
                          key={opp.id}
                          className="p-4 bg-[#F7F6F1] border border-[#E5E4DE] rounded-xl flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-[#252927]">{opp.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#6F716D]">Tahapan:</span>
                              <Badge
                                variant={
                                  opp.stage === "berhasil"
                                    ? "success"
                                    : opp.stage === "tidak_berhasil"
                                    ? "danger"
                                    : "default"
                                }
                                size="sm"
                              >
                                {getStageLabel(opp.stage)}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-[#252927] tabular-nums">
                              {formatCurrency(opp.estimated_value)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {activeTab === "followups" && (
                <Card className="p-5 rounded-2xl">
                  {followups.length === 0 ? (
                    <EmptyState
                      icon={MarkSchedule}
                      title="Belum ada jadwal follow-up"
                      description="Jadwal pengingat untuk menghubungi pelanggan ini akan muncul di sini."
                    />
                  ) : (
                    <div className="space-y-3">
                      {followups.map((flw) => {
                        const isCompleted = flw.status === "completed";
                        return (
                          <div
                            key={flw.id}
                            className="p-4 bg-[#F7F6F1] border border-[#E5E4DE] rounded-xl flex items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <button
                                type="button"
                                role="checkbox"
                                aria-checked={isCompleted}
                                onClick={() => {
                                  if (!isCompleted) {
                                    setConfirmCompleteFollowup(flw);
                                  } else {
                                    handleConfirmCompleteFollowup(flw);
                                  }
                                }}
                                className="followup-checkbox group/cb mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                title={isCompleted ? "Buka kembali tugas" : "Tandai selesai"}
                                aria-label={`Tandai status tugas ${flw.title}`}
                              >
                                {isCompleted ? (
                                  <MarkCheck className="w-3.5 h-3.5 text-white" />
                                ) : (
                                  <MarkCheck className="w-3.5 h-3.5 text-[#635BCE] opacity-0 group-hover/cb:opacity-70 transition-opacity" />
                                )}
                              </button>
                              <div className="min-w-0">
                                <p
                                  className={`text-sm font-semibold text-[#252927] ${
                                    isCompleted ? "line-through text-[#A8AAA4]" : ""
                                  }`}
                                >
                                  {flw.title}
                                </p>
                                <p className="text-xs text-[#6F716D] mt-0.5">
                                  Tenggat: {formatDate(flw.due_at)}
                                </p>
                              </div>
                            </div>
                            <Badge variant={isCompleted ? "success" : "warning"}>
                              {isCompleted ? "Selesai" : "Belum selesai"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              )}
            </div>

            <Dialog
              isOpen={isEditDialogOpen}
              onClose={() => setIsEditDialogOpen(false)}
              title="Perbarui Data Pelanggan"
              description="Ubah informasi kontak atau catatan profil pelanggan."
            >
              <form onSubmit={handleUpdateCustomer} className="space-y-4">
                <Input
                  label="Nama Lengkap"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Nomor Telepon / WhatsApp"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <Input
                  label="Perusahaan / Usaha"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                />
                <Input
                  label="Sumber Pelanggan"
                  value={editForm.source}
                  onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                />
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-customer-notes"
                    className="block text-sm font-medium text-[#252927]"
                  >
                    Catatan
                  </label>
                  <textarea
                    id="edit-customer-notes"
                    rows={3}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full rounded-md border border-[#E5E4DE] p-2.5 text-sm text-[#252927] bg-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:border-transparent"
                  />
                </div>
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E4DE]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" size="sm" isLoading={isSubmittingEdit}>
                    Simpan perubahan
                  </Button>
                </div>
              </form>
            </Dialog>

            <Dialog
              isOpen={isAddActivityOpen}
              onClose={() => setIsAddActivityOpen(false)}
              title="Catat Aktivitas Interaksi"
              description="Dokumentasikan komunikasi atau pertemuan dengan pelanggan."
            >
              <form onSubmit={handleCreateActivity} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="activity-type"
                    className="block text-sm font-medium text-[#252927]"
                  >
                    Tipe Aktivitas
                  </label>
                  <select
                    id="activity-type"
                    required
                    value={activityForm.type}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, type: e.target.value as any })
                    }
                    className="w-full rounded-md border border-[#E5E4DE] p-2.5 text-sm text-[#252927] bg-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE]"
                  >
                    <option value="catatan">Catatan</option>
                    <option value="telepon">Telepon</option>
                    <option value="pertemuan">Pertemuan</option>
                    <option value="pesan_manual">Pesan manual</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <Input
                  label="Ringkasan Aktivitas"
                  placeholder="Contoh: Telepon penawaran diskon kuantitas"
                  required
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                />

                <div className="space-y-1.5">
                  <label
                    htmlFor="activity-body"
                    className="block text-sm font-medium text-[#252927]"
                  >
                    Rincian Pembahasan
                  </label>
                  <textarea
                    id="activity-body"
                    rows={3}
                    placeholder="Tuliskan hasil pembicaraan, respon pelanggan, atau kesepakatan yang dicapai..."
                    value={activityForm.body}
                    onChange={(e) => setActivityForm({ ...activityForm, body: e.target.value })}
                    className="w-full rounded-md border border-[#E5E4DE] p-2.5 text-sm text-[#252927] bg-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E4DE]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddActivityOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" size="sm" isLoading={isSubmittingActivity}>
                    Simpan aktivitas
                  </Button>
                </div>
              </form>
            </Dialog>

            <Dialog
              isOpen={isDeleteDialogOpen}
              onClose={() => setIsDeleteDialogOpen(false)}
              title="Hapus Pelanggan?"
              description="Tindakan ini tidak bisa dibatalkan. Semua data peluang, aktivitas, dan follow-up yang terkait dengan pelanggan ini akan ikut terhapus."
            >
              <div className="space-y-4 pt-2">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-800">
                  Peringatan: Pelanggan <strong>{customer.name}</strong> akan dihapus permanen
                  dari sistem.
                </div>
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteCustomer}
                    isLoading={isDeleting}
                  >
                    Ya, hapus pelanggan
                  </Button>
                </div>
              </div>
            </Dialog>

            <Dialog
              isOpen={!!confirmCompleteFollowup}
              onClose={() => setConfirmCompleteFollowup(null)}
              title="Selesaikan Tugas Follow-up?"
              description="Pastikan tindak lanjut kepada pelanggan ini sudah dilakukan sebelum menandai tugas sebagai selesai."
            >
              {confirmCompleteFollowup && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-lg bg-[#F7F6F1] border border-[#E5E4DE] space-y-1">
                    <p className="text-sm font-semibold text-[#252927]">
                      {confirmCompleteFollowup.title}
                    </p>
                    <p className="text-xs text-[#6F716D]">
                      Tenggat: {formatDate(confirmCompleteFollowup.due_at)}
                    </p>
                  </div>

                  <p className="text-xs text-[#6F716D] leading-relaxed">
                    Tugas ini akan ditandai sebagai{" "}
                    <strong className="text-[#252927]">Selesai</strong> dan riwayatnya tetap
                    tersimpan.
                  </p>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E4DE]">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmCompleteFollowup(null)}
                    >
                      Batalkan
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      isLoading={isCompletingFollowup}
                      onClick={() => handleConfirmCompleteFollowup(confirmCompleteFollowup)}
                    >
                      Tandai Selesai
                    </Button>
                  </div>
                </div>
              )}
            </Dialog>
          </div>
        )}
      </div>
    </AppShell>
  );
}
