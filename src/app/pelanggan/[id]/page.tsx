"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import {
  Users,
  ArrowLeft,
  Phone,
  Mail,
  Building,
  Edit2,
  Archive,
  RotateCcw,
  Trash2,
  Clock,
  Kanban,
  CalendarCheck2,
  Plus,
  AlertCircle,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
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

  // Edit dialog state
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

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add activity dialog state
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);
  const [activityForm, setActivityForm] = useState({
    type: "catatan",
    title: "",
    body: "",
  });

  // Active tab
  const [activeTab, setActiveTab] = useState<"activities" | "opportunities" | "followups">("activities");

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
        customer.archived_at ? "Pelanggan berhasil dipulihkan." : "Pelanggan berhasil diarsipkan."
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

  // Safe manual wa.me link generator
  const getWhatsAppLink = (rawPhone: string | null) => {
    if (!rawPhone) return null;
    let clean = rawPhone.replace(/\D/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.substring(1);
    }
    return `https://wa.me/${clean}`;
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/pelanggan"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke daftar pelanggan</span>
          </Link>
        </div>

        {/* Feedback Messages */}
        {successFeedback && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-md">
            {successFeedback}
          </div>
        )}

        {errorFeedback && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorFeedback}</span>
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-lg">
            Memuat informasi pelanggan...
          </div>
        ) : !customer ? (
          <Card className="p-8 text-center">
            <h2 className="text-base font-semibold text-slate-800">Pelanggan Tidak Ditemukan</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Data pelanggan ini mungkin sudah dihapus atau tidak terdaftar pada workspace Anda.
            </p>
            <Link href="/pelanggan">
              <Button size="sm">Kembali ke Daftar</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Customer Profile Card */}
            <Card className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-xs">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
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
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1 font-medium">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{customer.company}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                      title="Buka WhatsApp manual (tautan eksternal)"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="gap-1.5 text-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Ubah data</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleArchive}
                    className="gap-1.5 text-xs text-slate-600"
                  >
                    {customer.archived_at ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                        <span>Pulihkan</span>
                      </>
                    ) : (
                      <>
                        <Archive className="w-3.5 h-3.5" />
                        <span>Arsipkan</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-50"
                    title="Hapus pelanggan permanen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Contact Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 mt-5 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Nomor Telepon:</span>
                  <span className="font-medium text-slate-800">{customer.phone || "-"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Alamat Email:</span>
                  <span className="font-medium text-slate-800">{customer.email || "-"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Perusahaan:</span>
                  <span className="font-medium text-slate-800">{customer.company || "-"}</span>
                </div>
              </div>

              {customer.notes && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-slate-400 text-xs block mb-1">Catatan Kebutuhan:</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-md whitespace-pre-wrap leading-relaxed">
                    {customer.notes}
                  </p>
                </div>
              )}
            </Card>

            {/* Related Tabs: Activities, Opportunities, Follow-ups */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("activities")}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === "activities"
                      ? "border-blue-700 text-blue-700 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Riwayat Aktivitas ({activities.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("opportunities")}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === "opportunities"
                      ? "border-blue-700 text-blue-700 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Kanban className="w-4 h-4" />
                  <span>Peluang Penjualan ({opportunities.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("followups")}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === "followups"
                      ? "border-blue-700 text-blue-700 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <CalendarCheck2 className="w-4 h-4" />
                  <span>Jadwal Follow-up ({followups.length})</span>
                </button>
              </div>

              {/* Tab 1: Activities */}
              {activeTab === "activities" && (
                <Card className="p-5">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800">Linimasa Riwayat Interaksi</h3>
                    <Button
                      size="sm"
                      onClick={() => setIsAddActivityOpen(true)}
                      className="gap-1.5 text-xs h-8"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Catat aktivitas baru</span>
                    </Button>
                  </div>

                  {activities.length === 0 ? (
                    <EmptyState
                      icon={Clock}
                      title="Belum ada catatan aktivitas"
                      description="Catatan panggilan, pertemuan, atau interaksi dengan pelanggan ini akan tercatat di linimasa ini."
                      action={
                        <Button
                          size="sm"
                          onClick={() => setIsAddActivityOpen(true)}
                          className="gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Catat aktivitas pertama</span>
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-4">
                      {activities.map((act) => (
                        <div key={act.id} className="p-3.5 bg-slate-50 rounded-md border border-slate-200/60">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
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
                              <span className="font-semibold text-slate-900">{act.title}</span>
                            </div>
                            <span className="text-slate-400">{formatDate(act.happened_at, true)}</span>
                          </div>
                          {act.body && <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap">{act.body}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* Tab 2: Opportunities */}
              {activeTab === "opportunities" && (
                <Card className="p-5">
                  {opportunities.length === 0 ? (
                    <EmptyState
                      icon={Kanban}
                      title="Belum ada peluang penjualan"
                      description="Peluang transaksi atau proyek dengan pelanggan ini akan ditampilkan di sini."
                    />
                  ) : (
                    <div className="space-y-3">
                      {opportunities.map((opp) => (
                        <div
                          key={opp.id}
                          className="p-3.5 bg-white border border-slate-200 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{opp.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Tahap: <span className="font-medium text-slate-800">{opp.stage}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-900">
                              {formatCurrency(opp.estimated_value)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* Tab 3: Followups */}
              {activeTab === "followups" && (
                <Card className="p-5">
                  {followups.length === 0 ? (
                    <EmptyState
                      icon={CalendarCheck2}
                      title="Belum ada jadwal follow-up"
                      description="Jadwal pengingat untuk menghubungi pelanggan ini akan muncul di sini."
                    />
                  ) : (
                    <div className="space-y-3">
                      {followups.map((flw) => (
                        <div
                          key={flw.id}
                          className="p-3.5 bg-white border border-slate-200 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{flw.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Tenggat: {formatDate(flw.due_at)}</p>
                          </div>
                          <Badge variant={flw.status === "completed" ? "success" : "warning"}>
                            {flw.status === "completed" ? "Selesai" : "Belum selesai"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Modal Ubah Data Pelanggan */}
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
                  <label htmlFor="edit-customer-notes" className="block text-sm font-medium text-slate-800">
                    Catatan
                  </label>
                  <textarea
                    id="edit-customer-notes"
                    rows={3}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full rounded-md border border-slate-300 p-2.5 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent"
                  />
                </div>
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEditDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" size="sm" isLoading={isSubmittingEdit}>
                    Simpan perubahan
                  </Button>
                </div>
              </form>
            </Dialog>

            {/* Modal Tambah Aktivitas */}
            <Dialog
              isOpen={isAddActivityOpen}
              onClose={() => setIsAddActivityOpen(false)}
              title="Catat Aktivitas Interaksi"
              description="Dokumentasikan komunikasi atau pertemuan dengan pelanggan."
            >
              <form onSubmit={handleCreateActivity} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="activity-type" className="block text-sm font-medium text-slate-800">
                    Tipe Aktivitas <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="activity-type"
                    required
                    value={activityForm.type}
                    onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value as any })}
                    className="w-full rounded-md border border-slate-300 p-2.5 text-sm text-slate-900 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
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
                  <label htmlFor="activity-body" className="block text-sm font-medium text-slate-800">
                    Rincian Pembahasan
                  </label>
                  <textarea
                    id="activity-body"
                    rows={3}
                    placeholder="Tuliskan hasil pembicaraan, respon pelanggan, atau kesepakatan yang dicapai..."
                    value={activityForm.body}
                    onChange={(e) => setActivityForm({ ...activityForm, body: e.target.value })}
                    className="w-full rounded-md border border-slate-300 p-2.5 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAddActivityOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" size="sm" isLoading={isSubmittingActivity}>
                    Simpan aktivitas
                  </Button>
                </div>
              </form>
            </Dialog>

            {/* Modal Konfirmasi Hapus */}
            <Dialog
              isOpen={isDeleteDialogOpen}
              onClose={() => setIsDeleteDialogOpen(false)}
              title="Hapus Pelanggan?"
              description="Tindakan ini tidak bisa dibatalkan. Semua data peluang, aktivitas, dan follow-up yang terkait dengan pelanggan ini akan ikut terhapus."
            >
              <div className="space-y-4 pt-2">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-800">
                  Peringatan: Pelanggan <strong>{customer.name}</strong> akan dihapus permanen dari sistem.
                </div>
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(false)}>
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
          </div>
        )}
      </div>
    </AppShell>
  );
}
