"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  MarkCheckCircle,
  MarkAlert,
  MarkClose,
  MarkInfo,
} from "@/components/ui/marks";

export interface LuxuryNotificationProps {
  type?: "success" | "error" | "info" | "luxury";
  variant?: "success" | "error" | "info" | "luxury";
  title?: string;
  message: string;
  detail?: string;
  onClose?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const LuxuryNotification: React.FC<LuxuryNotificationProps> = ({
  type,
  variant,
  title,
  message,
  detail,
  onClose,
  actionLabel,
  onAction,
  className,
}) => {
  if (!message) return null;

  const resolvedMode = variant || type || "success";
  const isSuccess = resolvedMode === "success" || resolvedMode === "luxury";
  const isError = resolvedMode === "error";
  const isInfo = resolvedMode === "info";

  const defaultTitle = isSuccess
    ? "Perubahan Tersimpan"
    : isError
    ? "Perhatian"
    : "Informasi";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live="polite"
      className={cn(
        "relative rounded-lg border bg-[#FFFFFF] p-3.5 sm:px-4 transition-all duration-200 animate-luxury-in shadow-xs",
        isSuccess && "border-emerald-200/90",
        isError && "border-red-200/90",
        isInfo && "border-[#E5E4DE]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center shrink-0 border mt-0.5",
              isSuccess && "bg-emerald-50 border-emerald-200/80 text-emerald-700",
              isError && "bg-red-50 border-red-200/80 text-red-700",
              isInfo && "bg-[#E9E8FC] border-[#D5D3F5] text-[#635BCE]"
            )}
          >
            {isSuccess ? (
              <MarkCheckCircle className="w-4 h-4" />
            ) : isError ? (
              <MarkAlert className="w-4 h-4" />
            ) : (
              <MarkInfo className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#252927] leading-snug">
              {title || defaultTitle}
            </p>
            <p className="text-xs sm:text-sm text-[#6F716D] mt-0.5 leading-relaxed">
              {message}
            </p>

            {detail && (
              <p className="text-xs text-[#6F716D] mt-1.5 bg-[#F7F6F1] border border-[#E5E4DE] rounded px-2.5 py-1.5">
                {detail}
              </p>
            )}

            {actionLabel && onAction && (
              <button
                type="button"
                onClick={onAction}
                className="mt-2 inline-flex items-center text-xs font-semibold text-[#635BCE] hover:text-[#524AB8] underline cursor-pointer"
              >
                {actionLabel}
              </button>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup notifikasi"
            className="p-1 rounded-md text-[#6F716D] hover:text-[#252927] hover:bg-[#F7F6F1] transition-colors cursor-pointer shrink-0"
          >
            <MarkClose className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
