"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { MarkClose } from "@/components/ui/marks";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow || "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-description" : undefined}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#252927]/55 dark:bg-black/70 backdrop-blur-xs animate-luxury-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCloseRef.current();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={cn(
          "w-full max-h-[90vh] flex flex-col bg-[#FFFFFF] dark:bg-[#1C1F1D] rounded-xl border border-[#E5E4DE] dark:border-[#2E3330] shadow-xl overflow-hidden focus:outline-none",
          maxWidthStyles[maxWidth]
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[#E5E4DE] dark:border-[#2E3330] shrink-0">
          <div className="min-w-0">
            <h2
              id="dialog-title"
              className="text-base font-bold text-[#252927] dark:text-[#F7F6F1] tracking-tight"
            >
              {title}
            </h2>
            {description && (
              <p
                id="dialog-description"
                className="text-xs text-[#6F716D] dark:text-[#A8AAA4] mt-1 leading-relaxed"
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onCloseRef.current()}
            aria-label="Tutup dialog"
            className="p-1.5 -mr-1 -mt-0.5 text-[#6F716D] hover:text-[#252927] dark:text-[#A8AAA4] dark:hover:text-[#F7F6F1] rounded-md hover:bg-[#F7F6F1] dark:hover:bg-[#252927] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] cursor-pointer shrink-0"
          >
            <MarkClose className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
