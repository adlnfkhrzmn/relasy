"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { LuxuryNotification } from "@/components/ui/luxury-toast";
import {
  MarkContacts,
  MarkFunnel,
  MarkSchedule,
  MarkAlert,
  MarkPlus,
  MarkClock,
  MarkArrowRight,
  MarkPhone,
  MarkNote,
  MarkMessage,
  MarkCheck,
  MarkTrend,
  MarkCheckCircle,
  MarkLedger,
} from "@/components/ui/marks";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardMetrics {
  totalCustomers: number;
  openOpportunities: number;
  pipelineValue: number;
  tasksToday: number;
  tasksOverdue: number;
  tasksCompleted: number;
  wonOpportunitiesCount: number;
  wonOpportunitiesValue: number;
}

interface FollowupTask {
  id: string;
  customer_id: string;
  customer_name: string;
  title: string;
  due_at: string;
  status: "pending" | "completed";
}

interface RecentActivity {
  id: string;
  customer_id: string;
  customer_name: string;
  opportunity_id?: string | null;
  opportunity_title?: string | null;
  type: string;
  title: string;
  body?: string | null;
  happened_at: string;
}

export default function RingkasanPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCustomers: 0,
    openOpportunities: 0,
    pipelineValue: 0,
    tasksToday: 0,
    tasksOverdue: 0,
    tasksCompleted: 0,
    wonOpportunitiesCount: 0,
    wonOpportunitiesValue: 0,
  });
  const [tasksToday, setTasksToday] = useState<FollowupTask[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionFeedback, setActionFeedback] = useState("");
  const [confirmCompleteTask, setConfirmCompleteTask] = useState<FollowupTask | null>(null);
  const [isCompletingTask, setIsCompletingTask] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const todayIso = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/dashboard?refDate=${todayIso}`);
      if (!res.ok) throw new Error("Gagal memuat ringkasan dashboard.");
      const data = await res.json();
      if (data.metrics) setMetrics(data.metrics);
      if (data.tasksToday) setTasksToday(data.tasksToday);
      if (data.recentActivities) setRecentActivities(data.recentActivities);
    } catch {
      setErrorMessage("Tidak dapat memuat ringkasan data dari server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const executeCompleteTask = async (task: FollowupTask) => {
    if (!task?.id) return;
    setIsCompletingTask(true);
    try {
      const res = await fetch(`/api/followups/${encodeURIComponent(task.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_status" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui status tugas.");
      setConfirmCompleteTask(null);
      setTasksToday((prev) => prev.filter((item) => item.id !== task.id));
      setActionFeedback(
        `Tugas "${task.title}" ditandai selesai. Catatan dan riwayatnya tetap tersimpan di menu Follow-up (tab Selesai).`
      );
      loadDashboardData();
      setTimeout(() => setActionFeedback(""), 4000);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsCompletingTask(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "telepon":
        return MarkPhone;
      case "pesan_manual":
        return MarkMessage;
      case "pertemuan":
        return MarkContacts;
      default:
        return MarkNote;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "telepon":
        return "Telepon";
      case "pesan_manual":
        return "Pesan Manual";
      case "pertemuan":
        return "Pertemuan";
      case "catatan":
        return "Catatan";
      default:
        return "Aktivitas";
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5E4DE] p-5 sm:p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-[#252927] tracking-tight">
              Ringkasan Bisnis
            </h1>
            <p className="text-xs sm:text-sm text-[#6F716D]">
              Pantau perkembangan peluang penjualan, jadwal follow-up hari ini, dan catatan komunikasi pelanggan terbaru.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap shrink-0">
            <Link href="/pelanggan">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <MarkContacts className="w-3.5 h-3.5" />
                <span>Pelanggan</span>
              </Button>
            </Link>
            <Link href="/pipeline">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <MarkFunnel className="w-3.5 h-3.5" />
                <span>Pipeline</span>
              </Button>
            </Link>
            <Link href="/follow-up">
              <Button size="sm" className="gap-1.5 text-xs">
                <MarkPlus className="w-4 h-4" />
                <span>Jadwalkan follow-up</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Notifications */}
        {actionFeedback && (
          <LuxuryNotification
            variant="success"
            title="Pembaruan Tugas"
            message={actionFeedback}
            onClose={() => setActionFeedback("")}
          />
        )}

        {errorMessage && (
          <LuxuryNotification
            variant="error"
            title="Kendala Koneksi Data"
            message={errorMessage}
            onClose={() => setErrorMessage("")}
            actionLabel="Coba lagi"
            onAction={loadDashboardData}
          />
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Pelanggan Aktif"
            value={metrics.totalCustomers}
            description="Total pelanggan terdaftar"
            icon={MarkContacts}
            href="/pelanggan"
          />
          <StatCard
            title="Peluang Terbuka"
            value={metrics.openOpportunities}
            description={
              metrics.pipelineValue > 0
                ? `Estimasi ${formatCurrency(metrics.pipelineValue)}`
                : "Belum ada peluang terbuka"
            }
            icon={MarkFunnel}
            href="/pipeline"
          />
          <StatCard
            title="Follow-up Hari Ini"
            value={metrics.tasksToday}
            description="Perlu dihubungi hari ini"
            icon={MarkSchedule}
            href="/follow-up?tab=today"
            variant={metrics.tasksToday > 0 ? "warning" : "default"}
          />
          <StatCard
            title="Tugas Terlambat"
            value={metrics.tasksOverdue}
            description="Melewati tenggat waktu"
            icon={MarkAlert}
            href="/follow-up?tab=overdue"
            variant={metrics.tasksOverdue > 0 ? "danger" : "default"}
          />
        </div>

        {/* Secondary Financial & Completion Ledger Strip */}
        <div className="rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E4DE] shadow-2xs">
          <div className="flex items-center justify-between sm:pr-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6F716D]">
                Nilai Pipeline Aktif
              </p>
              <p className="text-base sm:text-lg font-bold text-[#252927] tabular-nums mt-0.5">
                {formatCurrency(metrics.pipelineValue)}
              </p>
            </div>
            <Link
              href="/pipeline"
              className="text-xs font-semibold text-[#635BCE] hover:underline no-underline flex items-center gap-1"
            >
              <span>Pipeline</span>
              <MarkArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="pt-3 sm:pt-0 sm:px-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6F716D]">
                Transaksi Berhasil ({metrics.wonOpportunitiesCount})
              </p>
              <p className="text-base sm:text-lg font-bold text-emerald-700 tabular-nums mt-0.5">
                {formatCurrency(metrics.wonOpportunitiesValue)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <MarkTrend className="w-4 h-4 text-emerald-700" />
            </div>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6F716D]">
                Follow-up Diselesaikan
              </p>
              <p className="text-base sm:text-lg font-bold text-[#252927] tabular-nums mt-0.5">
                {metrics.tasksCompleted} Tugas
              </p>
            </div>
            <Link
              href="/follow-up?tab=completed"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#635BCE] hover:underline no-underline"
            >
              <MarkCheckCircle className="w-3.5 h-3.5" />
              <span>Riwayat</span>
            </Link>
          </div>
        </div>

        {/* Two-column overview content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Follow-up Hari Ini Section */}
          <Card className="rounded-xl overflow-hidden shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b border-[#E5E4DE]">
              <div>
                <CardTitle className="text-base font-bold text-[#252927]">
                  Follow-up Hari Ini
                </CardTitle>
                <p className="text-xs text-[#6F716D] mt-0.5">
                  Daftar pelanggan yang terjadwal untuk dihubungi hari ini
                </p>
              </div>
              <Link href="/follow-up?tab=today">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Lihat semua <MarkArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div
                  aria-busy="true"
                  aria-label="Memuat tugas hari ini"
                  className="space-y-3 py-2"
                >
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-12 rounded-lg bg-[#F7F6F1] animate-pulse"
                    />
                  ))}
                  <p className="text-center text-xs text-[#A8AAA4]">
                    Memuat tugas hari ini...
                  </p>
                </div>
              ) : tasksToday.length === 0 ? (
                <EmptyState
                  icon={MarkSchedule}
                  title="Tidak ada follow-up hari ini"
                  description="Semua jadwal follow-up untuk hari ini sudah selesai atau belum ada jadwal baru."
                  action={
                    <Link href="/follow-up">
                      <Button variant="outline" size="sm">
                        Jadwalkan follow-up
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="divide-y divide-[#E5E4DE] -mx-4 -my-4">
                  {tasksToday.map((task) => {
                    const isPendingConfirm = confirmCompleteTask?.id === task.id;
                    return (
                      <div
                        key={task.id}
                        className="p-4 hover:bg-[#F7F6F1] transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={false}
                            onClick={() => setConfirmCompleteTask(task)}
                            className="followup-checkbox group/cb w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0"
                            title="Tandai selesai"
                            aria-label={`Tandai selesai tugas ${task.title}`}
                          >
                            <MarkCheck
                              className={`w-3.5 h-3.5 text-[#635BCE] transition-opacity ${
                                isPendingConfirm
                                  ? "opacity-100"
                                  : "opacity-0 group-hover/cb:opacity-70"
                              }`}
                            />
                          </button>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-[#252927] truncate">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#6F716D]">
                              <Link
                                href={`/pelanggan/${task.customer_id}`}
                                className="font-medium text-[#635BCE] hover:underline truncate"
                              >
                                {task.customer_name}
                              </Link>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <Link
                            href="/follow-up?tab=today"
                            className="text-xs font-semibold text-[#252927] bg-[#E9E8FC] hover:bg-[#DDD9F9] border border-[#D5D3F5] px-2.5 py-1 rounded-md no-underline transition-colors"
                          >
                            Follow-up
                          </Link>
                          <Badge variant="warning">Hari ini</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aktivitas Terbaru Section */}
          <Card className="rounded-xl overflow-hidden shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b border-[#E5E4DE]">
              <div>
                <CardTitle className="text-base font-bold text-[#252927]">
                  Riwayat Aktivitas Terkini
                </CardTitle>
                <p className="text-xs text-[#6F716D] mt-0.5">
                  Catatan komunikasi dan pertemuan terbaru dengan pelanggan
                </p>
              </div>
              <Link href="/pelanggan">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Semua pelanggan <MarkArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div
                  aria-busy="true"
                  aria-label="Memuat riwayat aktivitas"
                  className="space-y-3 py-2"
                >
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-12 rounded-lg bg-[#F7F6F1] animate-pulse"
                    />
                  ))}
                  <p className="text-center text-xs text-[#A8AAA4]">
                    Memuat riwayat aktivitas...
                  </p>
                </div>
              ) : recentActivities.length === 0 ? (
                <EmptyState
                  icon={MarkClock}
                  title="Belum ada riwayat aktivitas"
                  description="Catatan interaksi, panggilan telepon, atau pertemuan dengan pelanggan akan muncul di sini."
                  action={
                    <Link href="/pelanggan">
                      <Button variant="outline" size="sm">
                        Mulai catat aktivitas
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="divide-y divide-[#E5E4DE] -mx-4 -my-4">
                  {recentActivities.map((act) => {
                    const IconComponent = getActivityIcon(act.type);
                    return (
                      <div
                        key={act.id}
                        className="p-4 hover:bg-[#F7F6F1] transition-colors flex items-start gap-3.5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#E9E8FC] border border-[#D5D3F5] flex items-center justify-center shrink-0 mt-0.5">
                          <IconComponent className="w-4 h-4 text-[#635BCE]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs sm:text-sm font-semibold text-[#252927] truncate">
                              {act.title}
                            </p>
                            <span className="text-[11px] font-medium text-[#6F716D] bg-[#F7F6F1] border border-[#E5E4DE] px-2 py-0.5 rounded shrink-0">
                              {getActivityTypeLabel(act.type)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#6F716D] flex-wrap">
                            <Link
                              href={`/pelanggan/${act.customer_id}`}
                              className="font-medium text-[#635BCE] hover:underline"
                            >
                              {act.customer_name}
                            </Link>
                            <span>•</span>
                            <span>{formatDate(act.happened_at)}</span>
                          </div>
                          {act.body && (
                            <p className="text-xs text-[#6F716D] mt-1.5 line-clamp-2 leading-relaxed">
                              {act.body}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal Konfirmasi Penyelesaian Follow-up */}
        <Dialog
          isOpen={!!confirmCompleteTask}
          onClose={() => setConfirmCompleteTask(null)}
          title="Selesaikan Tugas Follow-up?"
          description="Pastikan tindak lanjut kepada pelanggan ini sudah dilakukan sebelum menandai tugas sebagai selesai."
        >
          {confirmCompleteTask && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-[#F7F6F1] border border-[#E5E4DE] space-y-1">
                <p className="text-sm font-semibold text-[#252927]">
                  {confirmCompleteTask.title}
                </p>
                <p className="text-xs text-[#6F716D]">
                  Pelanggan:{" "}
                  <strong className="font-medium text-[#252927]">
                    {confirmCompleteTask.customer_name}
                  </strong>
                </p>
              </div>

              <p className="text-xs text-[#6F716D] leading-relaxed">
                Tugas ini akan dipindahkan ke tab{" "}
                <strong className="text-[#252927]">Selesai</strong> pada menu
                Follow-up dan riwayatnya tetap tersimpan.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E4DE]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmCompleteTask(null)}
                >
                  Batalkan
                </Button>
                <Button
                  type="button"
                  size="sm"
                  isLoading={isCompletingTask}
                  onClick={() => executeCompleteTask(confirmCompleteTask)}
                >
                  Tandai Selesai
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </AppShell>
  );
}
