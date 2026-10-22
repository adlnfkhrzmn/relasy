"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CalendarCheck2,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  RotateCcw,
  Trash2,
  Check,
  ChevronRight,
  User,
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatRelativeDueDate } from "@/lib/utils";

interface Followup {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string | null;
  opportunity_id?: string | null;
  opportunity_title?: string | null;
  title: string;
  note: string | null;
  due_at: string;
  status: "pending" | "completed";
  completed_at: string | null;
}

interface CustomerOption {
  id: string;
  name: string;
}

function FollowUpContent() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const initialTab =
    rawTab === "overdue" || rawTab === "terlambat"
      ? "overdue"
      : rawTab === "upcoming" || rawTab === "mendatang"
      ? "upcoming"
      : rawTab === "completed" || rawTab === "selesai"
      ? "completed"
      : "today";

  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "overdue" | "completed">(initialTab);
  const [tasks, setTasks] = useState<Followup[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [tabCounts, setTabCounts] = useState({
    today: 0,
    upcoming: 0,
    overdue: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState("");
  const [successFeedback, setSuccessFeedback] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Reschedule dialog state
  const [rescheduleTaskId, setRescheduleTaskId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState("");

  // Create form state
  const [formData, setFormData] = useState({
    title: "",
    customerId: "",
    dueAt: new Date().toISOString().split("T")[0],
    time: "",
    note: "",
  });

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setErrorFeedback("");
    try {
      const localDate = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/followups?tab=${activeTab}&refDate=${localDate}`);
      if (!res.ok) throw new Error("Gagal mengambil daftar follow-up.");
      const data = await res.json();
      setTasks(data.data || []);
      if (data.counts) {
        setTabCounts(data.counts);
      }
    } catch {
      setErrorFeedback("Tidak dapat memuat jadwal follow-up dari server.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.data || []);
      }
    } catch {
      // Ignored
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchCustomers();
  }, [fetchTasks, fetchCustomers]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.customerId || !formData.dueAt) {
      setErrorFeedback("Judul, pelanggan, dan tanggal tenggat wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorFeedback("");
    try {
      const fullDueAt = formData.time
        ? `${formData.dueAt}T${formData.time}:00`
        : `${formData.dueAt}T09:00:00`;

      const res = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          customerId: formData.customerId,
          dueAt: fullDueAt,
          note: formData.note || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal membuat follow-up.");

      setSuccessFeedback(`Follow-up "${formData.title}" berhasil dijadwalkan.`);
      setIsAddDialogOpen(false);
      setFormData({
        title: "",
        customerId: "",
        dueAt: new Date().toISOString().split("T")[0],
        time: "",
        note: "",
      });
      fetchTasks();
      setTimeout(() => setSuccessFeedback(""), 3500);
    } catch (err: any) {
      setErrorFeedback(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (task: Followup) => {
    try {
      const res = await fetch(`/api/followups/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_status" }),
      });

      if (!res.ok) throw new Error("Gagal mengubah status tugas.");

      setSuccessFeedback(
        task.status === "completed"
          ? `Tugas "${task.title}" dibuka kembali.`
          : `Tugas "${task.title}" selesai.`
      );
      fetchTasks();
      setTimeout(() => setSuccessFeedback(""), 3000);
    } catch (err: any) {
      setErrorFeedback(err.message);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTaskId || !newDueDate) return;

    try {
      const res = await fetch(`/api/followups/${rescheduleTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reschedule", dueAt: `${newDueDate}T09:00:00` }),
      });

      if (!res.ok) throw new Error("Gagal menjadwalkan ulang tugas.");

      setSuccessFeedback("Jadwal follow-up berhasil diperbarui.");
      setRescheduleTaskId(null);
      fetchTasks();
      setTimeout(() => setSuccessFeedback(""), 3500);
    } catch (err: any) {
      setErrorFeedback(err.message);
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!confirm(`Hapus tugas follow-up "${title}"?`)) return;
    try {
      const res = await fetch(`/api/followups/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus tugas.");
      setSuccessFeedback("Tugas follow-up berhasil dihapus.");
      fetchTasks();
      setTimeout(() => setSuccessFeedback(""), 3000);
    } catch (err: any) {
      setErrorFeedback(err.message);
    }
  };

  const tabs = [
    { id: "today", label: "Hari ini", count: tabCounts.today, icon: Clock },
    { id: "upcoming", label: "Mendatang", count: tabCounts.upcoming, icon: Calendar },
    { id: "overdue", label: "Terlambat", count: tabCounts.overdue, icon: AlertCircle },
    { id: "completed", label: "Selesai", count: tabCounts.completed, icon: CheckCircle2 },
  ] as const;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Tugas Follow-up
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Catat pengingat jadwal menghubungi calon pelanggan dan pantau tugas yang perlu dituntaskan.
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-1.5 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Jadwalkan follow-up</span>
          </Button>
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

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer touch-target ${
                  isActive
                    ? "border-blue-700 text-blue-700 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? "bg-blue-100 text-blue-800"
                      : tab.id === "overdue" && tab.count > 0
                      ? "bg-red-100 text-red-800 font-bold"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tasks List Content */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-lg">
            Memuat tugas follow-up...
          </div>
        ) : tasks.length === 0 ? (
          <Card className="overflow-hidden">
            <EmptyState
              icon={CalendarCheck2}
              title={
                activeTab === "today"
                  ? "Tidak ada follow-up untuk hari ini"
                  : activeTab === "upcoming"
                  ? "Belum ada jadwal follow-up mendatang"
                  : activeTab === "overdue"
                  ? "Tidak ada tugas follow-up yang terlambat"
                  : "Belum ada tugas yang diselesaikan"
              }
              description={
                activeTab === "today"
                  ? "Bagus! Semua tugas follow-up hari ini sudah terselesaikan atau belum ada jadwal baru."
                  : activeTab === "upcoming"
                  ? "Jadwalkan waktu untuk menghubungi pelanggan agar tidak ada peluang yang terlewat."
                  : activeTab === "overdue"
                  ? "Tidak ada tugas yang melewati tenggat waktu. Semua jadwal berjalan tepat waktu."
                  : "Tugas follow-up yang sudah Anda tandai selesai akan tersimpan di sini sebagai riwayat."
              }
              action={
                activeTab !== "completed" ? (
                  <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Jadwalkan tugas baru</span>
                  </Button>
                ) : null
              }
            />
          </Card>
        ) : (
          <Card className="overflow-hidden divide-y divide-slate-100">
            {tasks.map((task) => {
              const rel = formatRelativeDueDate(task.due_at);
              const isCompleted = task.status === "completed";

              return (
                <div
                  key={task.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(task)}
                      className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isCompleted
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 hover:border-blue-600 bg-white"
                      }`}
                      title={isCompleted ? "Buka kembali tugas" : "Tandai selesai"}
                      aria-label={`Tandai status tugas ${task.title}`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold text-slate-900 leading-snug ${
                          isCompleted ? "line-through text-slate-400" : ""
                        }`}
                      >
                        {task.title}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap mt-1 text-xs text-slate-500">
                        <Link
                          href={`/pelanggan/${task.customer_id}`}
                          className="font-medium text-blue-700 hover:underline flex items-center gap-1"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>{task.customer_name}</span>
                        </Link>

                        <span>•</span>

                        <span
                          className={`font-medium ${
                            rel.isOverdue && !isCompleted
                              ? "text-red-700 font-bold"
                              : rel.isToday && !isCompleted
                              ? "text-amber-700 font-bold"
                              : "text-slate-600"
                          }`}
                        >
                          {formatDate(task.due_at)} ({rel.label})
                        </span>
                      </div>

                      {task.note && (
                        <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded border border-slate-100">
                          {task.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!isCompleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRescheduleTaskId(task.id);
                          setNewDueDate(task.due_at.split("T")[0]);
                        }}
                        className="text-xs h-8"
                        aria-label={`Jadwalkan ulang tugas ${task.title}`}
                      >
                        Jadwal ulang
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(task)}
                      className={`text-xs h-8 ${
                        isCompleted ? "text-slate-600" : "text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {isCompleted ? "Buka kembali" : "Selesai"}
                    </Button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id, task.title)}
                      className="p-1.5 text-slate-400 hover:text-red-700 rounded transition-colors cursor-pointer"
                      title="Hapus tugas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </Card>
        )}

        {/* Modal Tambah Follow-up */}
        <Dialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          title="Jadwalkan Follow-up Baru"
          description="Tentukan waktu dan catatan untuk menghubungi pelanggan."
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <Input
              label="Judul Tugas"
              placeholder="Contoh: Kirim penawaran harga revisi"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <div className="space-y-1.5">
              <label htmlFor="task-customer" className="block text-sm font-medium text-slate-800">
                Pelanggan Terkait <span className="text-red-600">*</span>
              </label>
              <select
                id="task-customer"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Tanggal Tenggat"
                type="date"
                required
                value={formData.dueAt}
                onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
              />
              <Input
                label="Waktu (Opsional)"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="followup-note" className="block text-sm font-medium text-slate-800">
                Catatan Follow-up
              </label>
              <textarea
                id="followup-note"
                rows={2}
                placeholder="Poin-poin penting yang perlu dibahas saat menghubungi pelanggan..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent"
              />
            </div>

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
                Simpan jadwal
              </Button>
            </div>
          </form>
        </Dialog>

        {/* Modal Jadwal Ulang */}
        <Dialog
          isOpen={!!rescheduleTaskId}
          onClose={() => setRescheduleTaskId(null)}
          title="Jadwalkan Ulang Follow-up"
          description="Pilih tanggal baru untuk menindaklanjuti tugas ini."
        >
          <form onSubmit={handleReschedule} className="space-y-4">
            <Input
              label="Tanggal Tenggat Baru"
              type="date"
              required
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setRescheduleTaskId(null)}>
                Batal
              </Button>
              <Button type="submit" size="sm">
                Perbarui tanggal
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AppShell>
  );
}

export default function FollowUpPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="p-12 text-center text-xs text-slate-400">
            Memuat tugas follow-up...
          </div>
        </AppShell>
      }
    >
      <FollowUpContent />
    </Suspense>
  );
}
