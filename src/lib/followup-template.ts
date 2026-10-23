export interface FollowupTemplatePreset {
  id: string;
  name: string;
  description: string;
  template: string;
}

export const FOLLOWUP_TEMPLATE_PRESETS: FollowupTemplatePreset[] = [
  {
    id: "eksekutif_ramah",
    name: "Eksekutif Ramah",
    description: "Nada profesional, hangat, dan sopan untuk menindaklanjuti diskusi bisnis.",
    template:
      "Halo {nama} dari {perusahaan}, semoga hari Anda menyenangkan. Saya ingin menindaklanjuti perihal {judul_tugas} yang terjadwal pada {tanggal}. Apakah ada waktu luang hari ini untuk berdiskusi singkat? Terima kasih.",
  },
  {
    id: "konfirmasi_penawaran",
    name: "Konfirmasi Proposal & Harga",
    description: "Fokus menanyakan perkembangan penawaran atau kuotasi yang telah dikirim.",
    template:
      "Selamat pagi/siang {nama}, menyambung komunikasi kita sebelumnya terkait {judul_tugas} untuk {perusahaan}, apakah dokumen penawaran dari kami sudah sempat ditinjau? Kami siap menyesuaikan rincian sesuai kebutuhan tim Anda.",
  },
  {
    id: "pengingat_singkat",
    name: "Pengingat Ringkas",
    description: "Pesan singkat dan langsung ke inti pembahasan untuk klien yang sibuk.",
    template:
      "Halo {nama}, sekadar mengingatkan jadwal kita hari ini ({tanggal}) mengenai {judul_tugas}. Kabari saya jika jadwalnya tetap sesuai atau perlu disesuaikan. Terima kasih.",
  },
];

export const DEFAULT_FOLLOWUP_TEMPLATE = FOLLOWUP_TEMPLATE_PRESETS[0].template;

export interface FollowupTemplateVariables {
  customerName?: string | null;
  company?: string | null;
  taskTitle?: string | null;
  dueAt?: string | null;
}

export function formatShortIndonesianDate(dateStr?: string | null): string {
  if (!dateStr) return "hari ini";
  try {
    const raw = dateStr.includes("T") ? dateStr : `${dateStr}T09:00:00`;
    const date = new Date(raw);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function generateFollowupText(
  templateText: string,
  variables: FollowupTemplateVariables
): string {
  const baseTemplate = (templateText || DEFAULT_FOLLOWUP_TEMPLATE).trim();
  const nama = (variables.customerName || "").trim() || "Bapak/Ibu";
  const perusahaan = (variables.company || "").trim() || "perusahaan Anda";
  const judulTugas = (variables.taskTitle || "").trim() || "kerja sama layanan kami";
  const tanggal = formatShortIndonesianDate(variables.dueAt);

  return baseTemplate
    .replace(/\{nama\}/gi, nama)
    .replace(/\{perusahaan\}/gi, perusahaan)
    .replace(/\{judul_tugas\}/gi, judulTugas)
    .replace(/\{tanggal\}/gi, tanggal);
}

export function buildManualWhatsAppHref(
  phone?: string | null,
  prefilledText?: string | null
): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  if (prefilledText && prefilledText.trim().length > 0) {
    return `https://wa.me/${normalized}?text=${encodeURIComponent(prefilledText.trim())}`;
  }
  return `https://wa.me/${normalized}`;
}
