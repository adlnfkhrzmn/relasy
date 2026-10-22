"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Kanban,
  CalendarCheck2,
  AlertCircle,
  Plus,
  Clock,
  ArrowRight,
  Phone,
  FileText,
  MessageSquare,
  Check,
  CheckCircle2,
  User,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate, formatRelativeDueDate } from "@/lib/utils";

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

  const handleToggleTaskStatus = async (taskId: string, title: string) => {
    try {
      const res = await fetch(`/api/followups/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_status" }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui status tugas.");
      setActionFeedback(`Tugas "${title}" berhasil diselesaikan.`);
      loadDashboardData();
      setTimeout(() => setActionFeedback(""), 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "telepon":
        return Phone;
      case "pesan_manual":
        return MessageSquare;
      case "pertemuan":
        return Users;
      default:
        return FileText;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Ringkasan Bisnis
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pantau peluang penjualan, jadwal follow-up, dan aktivitas pelanggan terkini.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <Link href="/pelanggan">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5" />
                <span>Pelanggan</span>
              </Button>
            </Link>
            <Link href="/pipeline">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Kanban className="w-3.5 h-3.5" />
                <span>Pipeline</span>
              </Button>
            </Link>
            <Link href="/follow-up">
              <Button size="sm" className="gap-1.5 text-xs">
                <Plus className="w-4 h-4" />
                <span>Jadwalkan follow-up</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Action feedback */}
        {actionFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-md flex items-center justify-between">
            <span>{actionFeedback}</span>
            <button
              type="button"
              onClick={() => setActionFeedback("")}
              className="text-emerald-700 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={loadDashboardData}
              className="text-xs font-semibold text-red-700 underline cursor-pointer"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Pelanggan Aktif"
            value={metrics.totalCustomers}
            description="Total pelanggan terdaftar"
            icon={Users}
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
            icon={Kanban}
            href="/pipeline"
          />
          <StatCard
            title="Follow-up Hari Ini"
            value={metrics.tasksToday}
            description="Perlu dihubungi hari ini"
            icon={CalendarCheck2}
            href="/follow-up?tab=today"
            variant={metrics.tasksToday > 0 ? "warning" : "default"}
          />
          <StatCard
            title="Tugas Terlambat"
            value={metrics.tasksOverdue}
            description="Melewati tenggat waktu"
            icon={AlertCircle}
            href="/follow-up?tab=overdue"
            variant={metrics.tasksOverdue > 0 ? "danger" : "default"}
          />
        </div>

        {/* Highlight Won Opportunities if any */}
        {metrics.wonOpportunitiesCount > 0 && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  {metrics.wonOpportunitiesCount} Peluang Penjualan Berhasil Dimenangkan
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Total nilai transaksi tercapai:{" "}
                  <span className="font-bold">{formatCurrency(metrics.wonOpportunitiesValue)}</span>
                </p>
              </div>
            </div>
            <Link
              href="/pipeline"
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1 self-start sm:self-center"
            >
              Lihat di pipeline <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Two-column overview content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Follow-up Hari Ini Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Follow-up Hari Ini
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Tugas follow-up dengan tenggat hari ini</p>
              </div>
              <Link href="/follow-up?tab=today">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Lihat semua <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">Memuat tugas hari ini...</div>
              ) : tasksToday.length === 0 ? (
                <EmptyState
                  icon={CalendarCheck2}
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
                <div className="divide-y divide-slate-100 -mx-4 -mb-4">
                  {tasksToday.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 px-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTaskStatus(task.id, task.title)}
                          className="w-5 h-5 rounded border border-slate-300 hover:border-blue-600 bg-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Tandai selesai"
                          aria-label={`Tandai selesai tugas ${task.title}`}
                        >
                          <Check className="w-3 h-3 text-transparent hover:text-slate-400" />
                        </button>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                            <Link
                              href={`/pelanggan/${task.customer_id}`}
                              className="text-blue-700 hover:underline truncate"
                            >
                              {task.customer_name}
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Badge variant="warning">Hari ini</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aktivitas Terbaru Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Riwayat Aktivitas Terkini
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Catatan interaksi terbaru dengan pelanggan</p>
              </div>
              <Link href="/pelanggan">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Semua pelanggan <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">Memuat riwayat aktivitas...</div>
              ) : recentActivities.length === 0 ? (
                <EmptyState
                  icon={Clock}
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
                <div className="divide-y divide-slate-100 -mx-4 -mb-4">
                  {recentActivities.map((act) => {
                    const IconComponent = getActivityIcon(act.type);
                    return (
                      <div
                        key={act.id}
                        className="p-3.5 px-4 hover:bg-slate-50/80 transition-colors flex items-start gap-3"
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                          <IconComponent className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900">
                            {act.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
                            <Link
                              href={`/pelanggan/${act.customer_id}`}
                              className="font-medium text-blue-700 hover:underline"
                            >
                              {act.customer_name}
                            </Link>
                            <span>•</span>
                            <span>{formatDate(act.happened_at)}</span>
                          </div>
                          {act.body && (
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
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
      </div>
    </AppShell>
  );
}
