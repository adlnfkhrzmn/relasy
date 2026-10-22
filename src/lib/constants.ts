export const PIPELINE_STAGES = [
  { id: "baru", label: "Baru", color: "border-slate-300 bg-slate-50 text-slate-800" },
  { id: "dihubungi", label: "Dihubungi", color: "border-sky-300 bg-sky-50 text-sky-800" },
  { id: "negosiasi", label: "Negosiasi", color: "border-amber-300 bg-amber-50 text-amber-800" },
  { id: "berhasil", label: "Berhasil", color: "border-emerald-300 bg-emerald-50 text-emerald-800" },
  { id: "tidak_berhasil", label: "Tidak berhasil", color: "border-rose-300 bg-rose-50 text-rose-800" },
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number]["id"];

export const ACTIVITY_TYPES = [
  { id: "catatan", label: "Catatan" },
  { id: "telepon", label: "Telepon" },
  { id: "pertemuan", label: "Pertemuan" },
  { id: "pesan_manual", label: "Pesan manual" },
  { id: "lainnya", label: "Lainnya" },
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number]["id"];

export const FOLLOWUP_STATUSES = [
  { id: "pending", label: "Belum selesai" },
  { id: "completed", label: "Selesai" },
] as const;

export type FollowupStatus = (typeof FOLLOWUP_STATUSES)[number]["id"];
