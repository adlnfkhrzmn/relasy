"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { LuxuryNotification } from "@/components/ui/luxury-toast";
import {
  DEFAULT_FOLLOWUP_TEMPLATE,
  FOLLOWUP_TEMPLATE_PRESETS,
  FollowupTemplatePreset,
  generateFollowupText,
  buildManualWhatsAppHref,
} from "@/lib/followup-template";
import {
  MarkSchedule,
  MarkPlus,
  MarkClock,
  MarkAlert,
  MarkCheckCircle,
  MarkCalendar,
  MarkTrash,
  MarkCheck,
  MarkUser,
  MarkMessageText,
  MarkCopy,
  MarkExternal,
  MarkFilter,
  MarkRestore,
} from "@/components/ui/marks";
import Link from "next/link";
import { formatDate, formatRelativeDueDate } from "@/lib/utils";

interface Followup {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string | null;
  customer_company?: string | null;
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
  company?: string | null;
  phone?: string | null;
}

interface TemplateConfigState {
  is_enabled: boolean;
  active_preset: string;
  template_text: string;
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

  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "overdue" | "completed">(
    initialTab
  );
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
  const [toastTitle, setToastTitle] = useState("Perubahan Tersimpan");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Follow-up Text Template state
  const [templateConfig, setTemplateConfig] = useState<TemplateConfigState>({
    is_enabled: true,
    active_preset: "eksekutif_ramah",
    template_text: DEFAULT_FOLLOWUP_TEMPLATE,
  });
  const [presets, setPresets] = useState<FollowupTemplatePreset[]>(FOLLOWUP_TEMPLATE_PRESETS);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Follow-up Action / Generated Message Modal state
  const [activeFollowupTask, setActiveFollowupTask] = useState<Followup | null>(null);
  const [generatedFollowupMessage, setGeneratedFollowupMessage] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Reschedule dialog state
  const [rescheduleTaskId, setRescheduleTaskId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState("");

  const [confirmCompleteTask, setConfirmCompleteTask] = useState<Followup | null>(null);
  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [deleteTargetTask, setDeleteTargetTask] = useState<{ id: string; title: string } | null>(
    null
  );
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  // Create form state
  const [formData, setFormData] = useState({
    title: "",
    customerId: "",
    dueAt: new Date().toISOString().split("T")[0],
    time: "",
    note: "",
  });

  const showNotification = (title: string, message: string) => {
    setToastTitle(title);
    setSuccessFeedback(message);
    setTimeout(() => setSuccessFeedback(""), 4000);
  };

  const fetchTemplateConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/followup-template");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTemplateConfig({
            is_enabled: Boolean(json.data.is_enabled),
            active_preset: json.data.active_preset || "eksekutif_ramah",
            template_text: json.data.template_text || DEFAULT_FOLLOWUP_TEMPLATE,
          });
        }
        if (json.presets) {
          setPresets(json.presets);
        }
      }
    } catch {
      // Fallback to default in-memory template
    }
  }, []);

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
        const list: CustomerOption[] = data.data || [];
        setCustomers(list);
        if (list.length > 0) {
          setFormData((prev) =>
            prev.customerId ? prev : { ...prev, customerId: list[0].id }
          );
        }
      }
    } catch {
      // Ignored
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchCustomers();
    fetchTemplateConfig();
  }, [fetchTasks, fetchCustomers, fetchTemplateConfig]);

  // Toggle Follow-up Template Active / Inactive
  const handleToggleTemplateEnabled = async () => {
    const nextEnabled = !templateConfig.is_enabled;
    setTemplateConfig((prev) => ({ ...prev, is_enabled: nextEnabled }));
    try {
      const res = await fetch("/api/followup-template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: nextEnabled }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTemplateConfig({
            is_enabled: Boolean(json.data.is_enabled),
            active_preset: json.data.active_preset,
            template_text: json.data.template_text,
          });
        }
      }
      showNotification(
        nextEnabled ? "Template Teks Diaktifkan" : "Template Teks Dinonaktifkan",
        nextEnabled
          ? "Logika template aktif: teks follow-up akan dibuat secara otomatis saat Anda klik follow-up."
          : "Logika template nonaktif: catatan follow-up tidak lagi diisi otomatis."
      );
    } catch {
      setErrorFeedback("Gagal memperbarui status template teks follow-up.");
    }
  };

  const handleSelectPreset = (preset: FollowupTemplatePreset) => {
    setTemplateConfig((prev) => ({
      ...prev,
      active_preset: preset.id,
      template_text: preset.template,
    }));
  };

  const handleSaveTemplateDetails = async () => {
    setIsSavingTemplate(true);
    try {
      const res = await fetch("/api/followup-template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEnabled: templateConfig.is_enabled,
          activePreset: templateConfig.active_preset,
          templateText: templateConfig.template_text,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan format template.");
      showNotification(
        "Format Template Tersimpan",
        "Format custom template teks follow-up telah diperbarui."
      );
      setShowTemplateEditor(false);
    } catch (err: any) {
      setErrorFeedback(err.message);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Helper to compute template text for the Add Follow-up modal
  const buildNoteForForm = useCallback(
    (titleVal: string, customerIdVal: string, dueAtVal: string) => {
      const selectedCust = customers.find((c) => c.id === customerIdVal);
      return generateFollowupText(templateConfig.template_text, {
        customerName: selectedCust?.name || "Bapak/Ibu",
        company: selectedCust?.company || "perusahaan Anda",
        taskTitle: titleVal || "tindak lanjut kerja sama",
        dueAt: dueAtVal,
      });
    },
    [customers, templateConfig.template_text]
  );

  // Open "Jadwalkan follow-up" modal
  const handleOpenAddModal = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const defaultCustId = customers[0]?.id || "";
    const autoNote = templateConfig.is_enabled
      ? buildNoteForForm("", defaultCustId, todayStr)
      : "";

    setFormData({
      title: "",
      customerId: defaultCustId,
      dueAt: todayStr,
      time: "",
      note: autoNote,
    });
    setIsAddDialogOpen(true);
  };

  // Click "Follow-up" button on a task row
  const handleClickFollowupTask = (task: Followup) => {
    setActiveFollowupTask(task);
    setCopySuccess(false);

    if (templateConfig.is_enabled) {
      const autoText = generateFollowupText(templateConfig.template_text, {
        customerName: task.customer_name,
        company: task.customer_company,
        taskTitle: task.title,
        dueAt: task.due_at,
      });
      setGeneratedFollowupMessage(autoText);
      showNotification(
        "Teks Follow-up Otomatis Dibuat",
        `Pesan untuk ${task.customer_name} berhasil disusun otomatis sesuai template aktif.`
      );
    } else {
      setGeneratedFollowupMessage(task.note || "");
    }
  };

  const handleCopyFollowupText = async () => {
    if (!generatedFollowupMessage.trim()) return;
    try {
      await navigator.clipboard.writeText(generatedFollowupMessage);
      setCopySuccess(true);
      showNotification(
        "Teks Disalin",
        "Pesan follow-up berhasil disalin ke clipboard."
      );
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      setCopySuccess(true);
    }
  };

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

      const finalNote =
        formData.note.trim() ||
        (templateConfig.is_enabled
          ? buildNoteForForm(formData.title, formData.customerId, formData.dueAt)
          : null);

      const res = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          customerId: formData.customerId,
          dueAt: fullDueAt,
          note: finalNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal membuat follow-up.");

      showNotification(
        "Jadwal Follow-up Tersimpan",
        `Follow-up "${formData.title}" berhasil dijadwalkan.`
      );
      setIsAddDialogOpen(false);
      setFormData({
        title: "",
        customerId: "",
        dueAt: new Date().toISOString().split("T")[0],
        time: "",
        note: "",
      });
      fetchTasks();
    } catch (err: any) {
      setErrorFeedback(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeToggleStatus = async (task: Followup) => {
    if (!task?.id) return;
    setIsCompletingTask(true);
    setErrorFeedback("");
    try {
      const res = await fetch(`/api/followups/${encodeURIComponent(task.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_status" }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengubah status tugas.");
      }

      setConfirmCompleteTask(null);
      setTasks((prev) => prev.filter((item) => item.id !== task.id));

      showNotification(
        task.status === "completed" ? "Tugas Dibuka Kembali" : "Tugas Follow-up Selesai",
        task.status === "completed"
          ? `Tugas "${task.title}" dikembalikan ke daftar aktif.`
          : `Tugas "${task.title}" ditandai selesai. Catatan dan riwayatnya tetap tersimpan di tab Selesai.`
      );
      await fetchTasks();
    } catch (err: any) {
      setErrorFeedback(err.message || "Terjadi kendala saat memperbarui status tugas.");
    } finally {
      setIsCompletingTask(false);
    }
  };

  const handleToggleStatus = (task: Followup) => {
    if (task.status === "pending") {
      setConfirmCompleteTask(task);
      return;
    }
    executeToggleStatus(task);
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTaskId || !newDueDate) return;

    try {
      const res = await fetch(`/api/followups/${encodeURIComponent(rescheduleTaskId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reschedule", dueAt: `${newDueDate}T09:00:00` }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Gagal menjadwalkan ulang tugas.");

      showNotification(
        "Jadwal Diperbarui",
        "Jadwal follow-up berhasil diperbarui ke tanggal baru."
      );
      setRescheduleTaskId(null);
      fetchTasks();
    } catch (err: any) {
      setErrorFeedback(err.message);
    }
  };

  const handleDeleteTask = (taskId: string, title: string) => {
    setDeleteTargetTask({ id: taskId, title });
  };

  const executeDeleteTask = async () => {
    if (!deleteTargetTask) return;
    setIsDeletingTask(true);
    try {
      const res = await fetch(`/api/followups/${encodeURIComponent(deleteTargetTask.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus tugas.");
      setDeleteTargetTask(null);
      showNotification("Tugas Dihapus", "Tugas follow-up berhasil dihapus dari daftar.");
      fetchTasks();
    } catch (err: any) {
      setErrorFeedback(err.message);
    } finally {
      setIsDeletingTask(false);
    }
  };

  const activePresetObj = presets.find((p) => p.id === templateConfig.active_preset);

  const tabs = [
    { id: "today", label: "Hari ini", count: tabCounts.today, icon: MarkClock },
    { id: "upcoming", label: "Mendatang", count: tabCounts.upcoming, icon: MarkCalendar },
    { id: "overdue", label: "Terlambat", count: tabCounts.overdue, icon: MarkAlert },
    { id: "completed", label: "Selesai", count: tabCounts.completed, icon: MarkCheckCircle },
  ] as const;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5E4DE] p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#252927] tracking-tight">
              Tugas Follow-up
            </h1>
            <p className="text-xs sm:text-sm text-[#6F716D] mt-1">
              Catat pengingat jadwal menghubungi pelanggan dan siapkan pesan follow-up dengan rapi.
            </p>
          </div>
          <Button onClick={handleOpenAddModal} size="sm" className="gap-1.5 shrink-0 h-9 px-4">
            <MarkPlus className="w-4 h-4" />
            <span>Jadwalkan follow-up</span>
          </Button>
        </div>

        {/* Feedback Messages */}
        {successFeedback && (
          <LuxuryNotification
            variant="success"
            title={toastTitle}
            message={successFeedback}
            onClose={() => setSuccessFeedback("")}
          />
        )}

        {errorFeedback && (
          <LuxuryNotification
            variant="error"
            title="Perhatian Sistem"
            message={errorFeedback}
            onClose={() => setErrorFeedback("")}
          />
        )}

        {/* Follow-up Text Template Command Bar */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-[#E5E4DE] shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E9E8FC] border border-[#D5D3F5] flex items-center justify-center text-[#635BCE] shrink-0 mt-0.5">
                <MarkMessageText className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-bold text-[#252927]">
                    Template Teks Follow-up Otomatis
                  </h2>
                  <span
                    data-testid="template-status-badge"
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      templateConfig.is_enabled
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-[#F7F6F1] text-[#6F716D] border-[#E5E4DE]"
                    }`}
                  >
                    {templateConfig.is_enabled ? "Aktif" : "Nonaktif"}
                  </span>
                  {activePresetObj && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F7F6F1] text-[#6F716D] border border-[#E5E4DE]">
                      Format: {activePresetObj.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6F716D] leading-relaxed">
                  {templateConfig.is_enabled
                    ? "Saat aktif, menekan tombol Follow-up atau menjadwalkan tugas akan membuat teks pesan otomatis sesuai custom template Anda."
                    : "Saat nonaktif, teks pesan tidak dibuat otomatis dan kolom catatan dibiarkan kosong untuk diketik manual."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              {/* Toggle Control */}
              <button
                type="button"
                role="switch"
                aria-checked={templateConfig.is_enabled}
                aria-label="Status Template Teks Follow-up"
                onClick={handleToggleTemplateEnabled}
                className={`inline-flex items-center gap-2.5 h-9 px-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  templateConfig.is_enabled
                    ? "bg-[#E9E8FC] text-[#252927] border-[#D5D3F5] hover:border-[#635BCE]"
                    : "bg-[#F7F6F1] text-[#6F716D] border-[#E5E4DE] hover:text-[#252927]"
                }`}
              >
                <span
                  className={`w-7 h-4 rounded-full p-0.5 flex items-center transition-colors ${
                    templateConfig.is_enabled ? "bg-[#635BCE] justify-end" : "bg-[#A8AAA4] justify-start"
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-white shadow-2xs" />
                </span>
                <span>
                  {templateConfig.is_enabled ? "Nonaktifkan Template" : "Aktifkan Template"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowTemplateEditor((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  showTemplateEditor
                    ? "bg-[#635BCE] text-white border-[#635BCE] hover:bg-[#524AB8]"
                    : "bg-[#FFFFFF] hover:bg-[#F7F6F1] text-[#252927] border-[#E5E4DE]"
                }`}
              >
                <MarkFilter className="w-3.5 h-3.5" />
                <span>{showTemplateEditor ? "Tutup Format" : "Atur Format Template"}</span>
              </button>
            </div>
          </div>

          {showTemplateEditor && (
            <div className="pt-4 border-t border-[#E5E4DE] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {presets.map((preset) => {
                  const isSelected = templateConfig.active_preset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#E9E8FC] border-[#635BCE] ring-1 ring-[#635BCE]"
                          : "bg-[#F7F6F1] border-[#E5E4DE] hover:border-[#635BCE]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#252927]">{preset.name}</span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#635BCE] text-white">
                            <MarkCheck className="w-2.5 h-2.5" />
                            <span>Dipilih</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6F716D] mt-1.5 leading-relaxed">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label
                    htmlFor="custom-template-textarea"
                    className="text-xs font-bold text-[#252927]"
                  >
                    Isi Template Teks Follow-up:
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                    <span className="text-[#6F716D]">Sisipkan variabel:</span>
                    {["{nama}", "{perusahaan}", "{judul_tugas}", "{tanggal}"].map((token) => (
                      <button
                        key={token}
                        type="button"
                        onClick={() =>
                          setTemplateConfig((prev) => ({
                            ...prev,
                            template_text: `${prev.template_text} ${token}`,
                          }))
                        }
                        className="px-2 py-0.5 rounded-md bg-[#E9E8FC] hover:bg-[#DDD9F9] text-[#635BCE] font-mono font-semibold border border-[#D5D3F5] cursor-pointer"
                      >
                        {token}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  id="custom-template-textarea"
                  rows={3}
                  value={templateConfig.template_text}
                  onChange={(e) =>
                    setTemplateConfig((prev) => ({ ...prev, template_text: e.target.value }))
                  }
                  className="w-full rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] p-3 text-xs sm:text-sm text-[#252927] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE]"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplateEditor(false)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  size="sm"
                  isLoading={isSavingTemplate}
                  onClick={handleSaveTemplateDetails}
                >
                  Simpan Template
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Segmented Tab Selection Bar (Preserves div.border-b selector) */}
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-[#FFFFFF] border border-b border-[#E5E4DE] overflow-x-auto shadow-2xs">
          <div className="flex items-center gap-1 min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer touch-target ${
                    isActive
                      ? "text-[#635BCE] font-bold"
                      : "text-[#6F716D] hover:text-[#252927]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="followup-tab-indicator"
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 bg-[#E9E8FC] border border-[#D5D3F5] rounded-lg"
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                  <span
                    className={`relative z-10 text-[11px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                      isActive
                        ? "bg-[#635BCE] text-white"
                        : tab.id === "overdue" && tab.count > 0
                        ? "bg-red-100 text-red-800"
                        : "bg-[#F7F6F1] text-[#6F716D] border border-[#E5E4DE]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 pr-2 text-xs text-[#6F716D] shrink-0">
            <span>Menampilkan:</span>
            <strong className="font-bold text-[#252927] tabular-nums">
              {tasks.length} tugas
            </strong>
          </div>
        </div>

        {isLoading ? (
          <div
            aria-busy="true"
            aria-label="Memuat tugas follow-up"
            className="p-6 bg-[#FFFFFF] border border-[#E5E4DE] rounded-2xl space-y-3"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-[#F7F6F1] animate-pulse"
              />
            ))}
            <p className="text-center text-xs text-[#A8AAA4] pt-1">
              Memuat tugas follow-up...
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <Card className="overflow-hidden rounded-2xl">
            <EmptyState
              icon={MarkSchedule}
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
                  ? "Semua jadwal follow-up hari ini sudah selesai atau belum ada pengingat baru."
                  : activeTab === "upcoming"
                  ? "Jadwalkan waktu untuk menghubungi pelanggan agar tindak lanjut tetap teratur."
                  : activeTab === "overdue"
                  ? "Tidak ada tugas yang melewati tenggat waktu."
                  : "Tugas follow-up yang sudah Anda tandai selesai tersimpan di sini beserta catatannya."
              }
              action={
                activeTab !== "completed" ? (
                  <Button onClick={handleOpenAddModal} size="sm" className="gap-1.5">
                    <MarkPlus className="w-4 h-4" />
                    <span>Jadwalkan tugas baru</span>
                  </Button>
                ) : null
              }
            />
          </Card>
        ) : (
          <Card className="overflow-hidden rounded-2xl border border-[#E5E4DE] divide-y divide-[#E5E4DE] shadow-2xs">
            {tasks.map((task) => {
              const rel = formatRelativeDueDate(task.due_at);
              const isCompleted = task.status === "completed";
              const isPendingConfirmation = confirmCompleteTask?.id === task.id;

              return (
                <div
                  key={task.id}
                  className="p-4 sm:p-5 hover:bg-[#F7F6F1]/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isCompleted}
                      onClick={() => handleToggleStatus(task)}
                      className="followup-checkbox group/cb mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0"
                      title={isCompleted ? "Buka kembali tugas" : "Tandai selesai"}
                      aria-label={`Tandai status tugas ${task.title}`}
                    >
                      {isCompleted ? (
                        <MarkCheck className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <MarkCheck
                          className={`w-3.5 h-3.5 text-[#635BCE] transition-opacity ${
                            isPendingConfirmation
                              ? "opacity-100"
                              : "opacity-0 group-hover/cb:opacity-70"
                          }`}
                        />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p
                          className={`text-sm sm:text-base font-bold text-[#252927] leading-snug ${
                            isCompleted ? "line-through text-[#A8AAA4]" : ""
                          }`}
                        >
                          {task.title}
                        </p>

                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : rel.isOverdue
                              ? "bg-red-50 text-red-700 border-red-200"
                              : rel.isToday
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-[#F7F6F1] text-[#6F716D] border-[#E5E4DE]"
                          }`}
                        >
                          {isCompleted ? "Selesai" : rel.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-xs text-[#6F716D]">
                        <Link
                          href={`/pelanggan/${task.customer_id}`}
                          className="font-semibold text-[#635BCE] hover:underline inline-flex items-center gap-1"
                        >
                          <MarkUser className="w-3.5 h-3.5" />
                          <span>{task.customer_name}</span>
                        </Link>

                        <span>•</span>

                        <span className="font-medium text-[#6F716D]">
                          Tenggat: {formatDate(task.due_at)}
                        </span>
                      </div>

                      {task.note && (
                        <div className="text-xs text-[#6F716D] mt-2 bg-[#F7F6F1] p-3 rounded-lg border border-[#E5E4DE] leading-relaxed">
                          {task.note}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Unified Action Toolbar */}
                  <div className="flex items-center gap-2 flex-wrap self-end lg:self-center shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E5E4DE] w-full lg:w-auto justify-end">
                    {!isCompleted && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleClickFollowupTask(task)}
                        className="text-xs h-8 px-3 gap-1.5"
                        aria-label={`Follow-up tugas ${task.title}`}
                      >
                        <MarkMessageText className="w-3.5 h-3.5" />
                        <span>Follow-up</span>
                      </Button>
                    )}

                    {!isCompleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRescheduleTaskId(task.id);
                          setNewDueDate(task.due_at.split("T")[0]);
                        }}
                        className="text-xs h-8 px-3 gap-1.5"
                        aria-label={`Jadwalkan ulang tugas ${task.title}`}
                      >
                        <MarkCalendar className="w-3.5 h-3.5 text-[#6F716D]" />
                        <span>Jadwal ulang</span>
                      </Button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(task)}
                      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                        isCompleted
                          ? "bg-[#F7F6F1] text-[#252927] border-[#E5E4DE] hover:bg-[#EFECE6]"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <MarkRestore className="w-3.5 h-3.5" />
                          <span>Buka kembali</span>
                        </>
                      ) : (
                        <>
                          <MarkCheck className="w-3.5 h-3.5" />
                          <span>Selesai</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id, task.title)}
                      className="inline-flex items-center justify-center h-8 w-8 text-[#6F716D] hover:text-red-700 hover:bg-red-50 border border-[#E5E4DE] rounded-md transition-colors cursor-pointer"
                      title="Hapus tugas"
                      aria-label={`Hapus tugas ${task.title}`}
                    >
                      <MarkTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </Card>
        )}

        {/* Modal Pesan Teks Follow-up (Ketika Klik Follow-up pada Tugas) */}
        <Dialog
          isOpen={!!activeFollowupTask}
          onClose={() => setActiveFollowupTask(null)}
          title="Pesan Follow-up"
          description={
            templateConfig.is_enabled
              ? "Teks dibuat otomatis mengikuti custom template aktif Anda. Anda dapat menyalin atau menyesuaikannya sebelum dikirim."
              : "Mode template saat ini nonaktif. Anda dapat mengetik pesan manual atau mengaktifkan template."
          }
        >
          {activeFollowupTask && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-[#F7F6F1] border border-[#E5E4DE] flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#252927]">
                    {activeFollowupTask.customer_name}
                  </p>
                  <p className="text-[11px] text-[#6F716D] mt-0.5">
                    Agenda: {activeFollowupTask.title}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    templateConfig.is_enabled
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-[#FFFFFF] text-[#6F716D] border-[#E5E4DE]"
                  }`}
                >
                  {templateConfig.is_enabled ? "Template Aktif" : "Template Nonaktif"}
                </span>
              </div>

              {!templateConfig.is_enabled && (
                <div className="p-3 rounded-lg bg-[#F7F6F1] border border-[#E5E4DE] text-xs text-[#252927] flex items-center justify-between gap-2">
                  <span>
                    Ingin teks dibuat otomatis sesuai template? Aktifkan fitur template sekarang.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleTemplateEnabled();
                      const autoText = generateFollowupText(templateConfig.template_text, {
                        customerName: activeFollowupTask.customer_name,
                        company: activeFollowupTask.customer_company,
                        taskTitle: activeFollowupTask.title,
                        dueAt: activeFollowupTask.due_at,
                      });
                      setGeneratedFollowupMessage(autoText);
                    }}
                    className="px-2.5 py-1 rounded bg-[#635BCE] text-white font-semibold shrink-0 cursor-pointer"
                  >
                    Aktifkan &amp; Buat Teks
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="generated-followup-textarea"
                  className="block text-xs font-semibold text-[#252927]"
                >
                  Isi Pesan Follow-up
                </label>
                <textarea
                  id="generated-followup-textarea"
                  rows={4}
                  value={generatedFollowupMessage}
                  onChange={(e) => setGeneratedFollowupMessage(e.target.value)}
                  placeholder="Tulis pesan tindak lanjut untuk pelanggan..."
                  className="w-full rounded-lg border border-[#E5E4DE] bg-[#FFFFFF] p-3 text-sm text-[#252927] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE]"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E5E4DE] flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyFollowupText}
                  className="gap-1.5"
                >
                  <MarkCopy className="w-3.5 h-3.5" />
                  <span>{copySuccess ? "Tersalin!" : "Salin Teks"}</span>
                </Button>

                <div className="flex items-center gap-2">
                  {buildManualWhatsAppHref(
                    activeFollowupTask.customer_phone,
                    generatedFollowupMessage
                  ) && (
                    <a
                      href={
                        buildManualWhatsAppHref(
                          activeFollowupTask.customer_phone,
                          generatedFollowupMessage
                        ) || "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#E5E4DE] bg-[#FFFFFF] hover:bg-[#F7F6F1] text-[#252927] text-xs font-semibold no-underline transition-colors"
                    >
                      <span>Buka WhatsApp Manual</span>
                      <MarkExternal className="w-3.5 h-3.5 text-[#6F716D]" />
                    </a>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setActiveFollowupTask(null)}
                  >
                    Selesai
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Dialog>

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
              onChange={(e) => {
                const nextTitle = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  title: nextTitle,
                  note: templateConfig.is_enabled
                    ? buildNoteForForm(nextTitle, prev.customerId, prev.dueAt)
                    : prev.note,
                }));
              }}
            />

            <div className="space-y-1.5">
              <label htmlFor="task-customer" className="block text-sm font-medium text-[#252927]">
                Pelanggan Terkait
              </label>
              <select
                id="task-customer"
                required
                value={formData.customerId}
                onChange={(e) => {
                  const nextCustomerId = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    customerId: nextCustomerId,
                    note: templateConfig.is_enabled
                      ? buildNoteForForm(prev.title, nextCustomerId, prev.dueAt)
                      : prev.note,
                  }));
                }}
                className="w-full rounded-md border border-[#E5E4DE] p-2.5 text-sm text-[#252927] bg-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE]"
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
                onChange={(e) => {
                  const nextDate = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    dueAt: nextDate,
                    note: templateConfig.is_enabled
                      ? buildNoteForForm(prev.title, prev.customerId, nextDate)
                      : prev.note,
                  }));
                }}
              />
              <Input
                label="Waktu (Opsional)"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="followup-note"
                  className="block text-sm font-medium text-[#252927]"
                >
                  Catatan Follow-up
                </label>
                <span className="text-[11px] font-medium text-[#6F716D]">
                  {templateConfig.is_enabled ? "Otomatis dari Template Aktif" : "Mode Manual"}
                </span>
              </div>
              <textarea
                id="followup-note"
                rows={3}
                placeholder="Poin-poin penting yang perlu dibahas saat menghubungi pelanggan..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full rounded-md border border-[#E5E4DE] bg-[#FFFFFF] p-2.5 text-sm text-[#252927] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:border-transparent"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E4DE]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddDialogOpen(false)}
              >
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
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E4DE]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRescheduleTaskId(null)}
              >
                Batal
              </Button>
              <Button type="submit" size="sm">
                Perbarui tanggal
              </Button>
            </div>
          </form>
        </Dialog>

        {/* Modal Konfirmasi Penyelesaian Follow-up */}
        <Dialog
          isOpen={!!confirmCompleteTask}
          onClose={() => setConfirmCompleteTask(null)}
          title="Selesaikan Tugas Follow-up?"
          description="Pastikan Anda sudah menghubungi atau menindaklanjuti pelanggan ini sebelum menandai tugas sebagai selesai."
        >
          {confirmCompleteTask && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-[#F7F6F1] border border-[#E5E4DE] space-y-1.5">
                <p className="text-sm font-semibold text-[#252927]">
                  {confirmCompleteTask.title}
                </p>
                <p className="text-xs text-[#6F716D]">
                  Pelanggan:{" "}
                  <strong className="font-medium text-[#252927]">
                    {confirmCompleteTask.customer_name}
                  </strong>{" "}
                  • Tenggat: {formatDate(confirmCompleteTask.due_at)}
                </p>
                {confirmCompleteTask.note && (
                  <p className="text-xs text-[#6F716D] pt-1.5 border-t border-[#E5E4DE]">
                    {confirmCompleteTask.note}
                  </p>
                )}
              </div>

              <p className="text-xs text-[#6F716D] leading-relaxed">
                Tugas ini akan dipindahkan ke tab{" "}
                <strong className="text-[#252927]">Selesai</strong>. Catatan dan
                riwayatnya tetap tersimpan dan dapat dibuka kembali kapan saja.
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
                  onClick={() => executeToggleStatus(confirmCompleteTask)}
                >
                  Tandai Selesai
                </Button>
              </div>
            </div>
          )}
        </Dialog>

        <Dialog
          isOpen={!!deleteTargetTask}
          onClose={() => setDeleteTargetTask(null)}
          title="Hapus Tugas Follow-up?"
          description="Tindakan ini akan menghapus jadwal tugas follow-up secara permanen dari daftar."
        >
          {deleteTargetTask && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-[#F7F6F1] border border-[#E5E4DE] text-xs text-[#252927]">
                Tugas: <strong className="font-semibold">{deleteTargetTask.title}</strong>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E4DE]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTargetTask(null)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  isLoading={isDeletingTask}
                  onClick={executeDeleteTask}
                >
                  Hapus Tugas
                </Button>
              </div>
            </div>
          )}
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
          <div className="p-12 text-center text-xs text-[#A8AAA4]">
            Memuat tugas follow-up...
          </div>
        </AppShell>
      }
    >
      <FollowUpContent />
    </Suspense>
  );
}
