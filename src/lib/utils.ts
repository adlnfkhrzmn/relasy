import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an integer amount into Indonesian Rupiah format.
 * Example: 1500000 -> "Rp 1.500.000"
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "Rp 0";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string or Date object into Indonesian locale format.
 * Example: "2026-10-23" -> "23 Okt 2026"
 */
export function formatDate(
  dateInput: string | Date | null | undefined,
  includeTime = false
): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
}

/**
 * Relative date description for follow-up dates in Indonesian.
 */
export function formatRelativeDueDate(dateInput: string | Date | null | undefined): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
} {
  if (!dateInput) {
    return { label: "-", isOverdue: false, isToday: false };
  }

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) {
    return { label: "-", isOverdue: false, isToday: false };
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round(
    (startOfTarget.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return { label: "Hari ini", isOverdue: false, isToday: true };
  } else if (diffDays === 1) {
    return { label: "Besok", isOverdue: false, isToday: false };
  } else if (diffDays === -1) {
    return { label: "Kemarin", isOverdue: true, isToday: false };
  } else if (diffDays < -1) {
    return { label: `Terlambat ${Math.abs(diffDays)} hari`, isOverdue: true, isToday: false };
  } else {
    return { label: `${diffDays} hari lagi`, isOverdue: false, isToday: false };
  }
}

/**
 * Ambil pesan kesalahan pertama dari hasil validasi Zod yang gagal.
 * Zod memakai pesan bawaan berbahasa Inggris untuk aturan yang tidak diberi
 * pesan khusus (mis. "Required"), sehingga pesan seperti itu diganti dengan
 * kalimat cadangan agar seluruh teks yang tampil tetap berbahasa Indonesia.
 */
export function firstIssueMessage(
  issues: { message?: string }[] | undefined,
  fallback: string
): string {
  const raw = issues?.[0]?.message?.trim();
  if (!raw) return fallback;
  if (/^(Required|Invalid input|Invalid|Expected |Too small|Too big|String must|Number must|Unrecognized)/i.test(raw)) {
    return fallback;
  }
  return raw;
}
