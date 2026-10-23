"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  MarkLedger,
  MarkContacts,
  MarkFunnel,
  MarkSchedule,
  MarkSearch,
  MarkPlus,
  MarkExport,
  MarkCheck,
} from "@/components/ui/marks";

const EASE = [0.22, 1, 0.36, 1] as const;

export type PreviewId = "dashboard" | "pelanggan" | "pipeline" | "follow-up";

type MarkComponent = (props: { className?: string }) => React.JSX.Element;

export const PREVIEW_TABS: {
  id: PreviewId;
  label: string;
  href: string;
  caption: string;
  Mark: MarkComponent;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    caption: "Angka kunci dan prioritas hari ini dalam satu layar.",
    Mark: MarkLedger,
  },
  {
    id: "pelanggan",
    label: "Pelanggan",
    href: "/pelanggan",
    caption: "Satu database kontak, bebas data ganda.",
    Mark: MarkContacts,
  },
  {
    id: "pipeline",
    label: "Pipeline",
    href: "/pipeline",
    caption: "Nilai penawaran per tahap, terhitung otomatis.",
    Mark: MarkFunnel,
  },
  {
    id: "follow-up",
    label: "Follow-up",
    href: "/follow-up",
    caption: "Jadwal harian terpisah rapi per status.",
    Mark: MarkSchedule,
  },
];

/* ── Window chrome shared by every preview ───────────────────────────── */

function Frame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#E5E4DE] bg-[#FFFFFF]">
      <div className="h-9 px-3 flex items-center gap-2 bg-[#F7F6F1] border-b border-[#E5E4DE]">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="w-2 h-2 rounded-full bg-[#D5D4CD]" />
          <span className="w-2 h-2 rounded-full bg-[#D5D4CD]" />
          <span className="w-2 h-2 rounded-full bg-[#D5D4CD]" />
        </span>
        <span className="ml-1 text-[10px] font-medium text-[#A8AAA4] truncate">
          {title}
        </span>
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </div>
  );
}

/* ── Dashboard ───────────────────────────────────────────────────────── */

function DashboardPreview() {
  const stats = [
    { label: "Pelanggan aktif", value: "128", Mark: MarkContacts },
    { label: "Peluang terbuka", value: "18", Mark: MarkFunnel },
    { label: "Nilai pipeline", value: "Rp 92,4 jt", Mark: MarkLedger },
    { label: "Follow-up hari ini", value: "7", Mark: MarkSchedule },
  ];

  return (
    <Frame title="relasy / dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((s, i) => {
          const Mark = s.Mark;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35, ease: EASE }}
              className="rounded-lg border border-[#E5E4DE] bg-[#F7F6F1]/60 p-2.5"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-[#6F716D] leading-tight">
                  {s.label}
                </span>
                <Mark className="w-3.5 h-3.5 text-[#635BCE] shrink-0" />
              </div>
              <p className="text-sm font-bold text-[#252927] tabular-nums">
                {s.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-2.5 rounded-lg border border-[#E5E4DE] overflow-hidden">
        <div className="px-3 py-2 bg-[#F7F6F1] border-b border-[#E5E4DE] flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#252927]">
            Follow-up hari ini
          </span>
          <span className="text-[10px] font-semibold text-[#635BCE]">
            7 tugas
          </span>
        </div>
        {[
          { name: "PT Sinar Abadi", task: "Konfirmasi revisi penawaran", tone: "amber" },
          { name: "CV Mitra Karya", task: "Jadwal presentasi kontrak", tone: "indigo" },
          { name: "UD Sentosa Makmur", task: "Kirim rincian faktur", tone: "emerald" },
        ].map((row, i) => (
          <motion.div
            key={row.name}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.08, duration: 0.35, ease: EASE }}
            className="px-3 py-2 flex items-center justify-between gap-2 border-b border-[#E5E4DE] last:border-b-0"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#252927] truncate">
                {row.name}
              </p>
              <p className="text-[10px] text-[#6F716D] truncate">{row.task}</p>
            </div>
            <span
              className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                row.tone === "amber"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : row.tone === "emerald"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-[#E9E8FC] text-[#635BCE] border-[#D5D3F5]"
              }`}
            >
              {row.tone === "amber" ? "Hari ini" : row.tone === "emerald" ? "Selesai" : "Siap"}
            </span>
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}

/* ── Pelanggan ───────────────────────────────────────────────────────── */

function PelangganPreview() {
  const rows = [
    { name: "Budi Santoso", company: "PT Sinar Abadi", source: "Referensi" },
    { name: "Rina Wulandari", company: "CV Mitra Karya", source: "Instagram" },
    { name: "Agus Pratama", company: "UD Sentosa Makmur", source: "Pameran" },
    { name: "Dewi Lestari", company: "Toko Dewi Jaya", source: "Website" },
  ];

  return (
    <Frame title="relasy / pelanggan">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="flex-1 flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-[#E5E4DE] bg-[#FFFFFF]">
          <MarkSearch className="w-3 h-3 text-[#A8AAA4]" />
          <span className="text-[10px] text-[#A8AAA4]">Cari nama atau telepon</span>
        </div>
        <span className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md bg-[#635BCE] text-white text-[10px] font-semibold">
          <MarkPlus className="w-3 h-3" />
          Tambah
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-[#E5E4DE] text-[10px] font-semibold text-[#6F716D]">
          <MarkExport className="w-3 h-3" />
          CSV
        </span>
      </div>

      <div className="rounded-lg border border-[#E5E4DE] overflow-hidden">
        <div className="grid grid-cols-12 px-3 py-1.5 bg-[#F7F6F1] border-b border-[#E5E4DE]">
          <span className="col-span-5 text-[9px] font-semibold uppercase tracking-wide text-[#6F716D]">
            Nama
          </span>
          <span className="col-span-4 text-[9px] font-semibold uppercase tracking-wide text-[#6F716D]">
            Perusahaan
          </span>
          <span className="col-span-3 text-[9px] font-semibold uppercase tracking-wide text-[#6F716D]">
            Sumber
          </span>
        </div>
        {rows.map((row, i) => (
          <motion.div
            key={row.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i, duration: 0.32, ease: EASE }}
            className="grid grid-cols-12 px-3 py-2 items-center border-b border-[#E5E4DE] last:border-b-0"
          >
            <div className="col-span-5 flex items-center gap-1.5 min-w-0">
              <span className="w-5 h-5 rounded-full bg-[#E9E8FC] border border-[#D5D3F5] flex items-center justify-center text-[8px] font-bold text-[#635BCE] shrink-0">
                {row.name.charAt(0)}
              </span>
              <span className="text-[10px] font-semibold text-[#252927] truncate">
                {row.name}
              </span>
            </div>
            <span className="col-span-4 text-[10px] text-[#6F716D] truncate">
              {row.company}
            </span>
            <span className="col-span-3 text-[9px] text-[#6F716D] truncate">
              {row.source}
            </span>
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}

/* ── Pipeline ────────────────────────────────────────────────────────── */

function PipelinePreview() {
  const cols = [
    { stage: "Baru", count: 4, value: "Rp 38,5 jt", cards: ["Penawaran unit", "Paket langganan"] },
    { stage: "Dihubungi", count: 3, value: "Rp 54,0 jt", cards: ["Kontrak tahunan"] },
    { stage: "Negosiasi", count: 5, value: "Rp 92,0 jt", cards: ["Revisi harga", "Tambah cabang"] },
    { stage: "Berhasil", count: 6, value: "Rp 146,5 jt", cards: ["Pengadaan selesai"] },
  ];

  return (
    <Frame title="relasy / pipeline">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {cols.map((col, ci) => (
          <motion.div
            key={col.stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.07, duration: 0.36, ease: EASE }}
            className="rounded-lg border border-[#E5E4DE] bg-[#F7F6F1]/70 overflow-hidden"
          >
            <div className="px-2 py-1.5 bg-[#FFFFFF] border-b border-[#E5E4DE]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold text-[#252927] truncate">
                  {col.stage}
                </span>
                <span className="text-[9px] font-bold text-[#635BCE] bg-[#E9E8FC] px-1.5 rounded-full border border-[#D5D3F5]">
                  {col.count}
                </span>
              </div>
              <p className="text-[9px] text-[#6F716D] mt-0.5 tabular-nums">
                {col.value}
              </p>
            </div>
            <div className="p-1.5 space-y-1.5">
              {col.cards.map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.28 + ci * 0.05 + i * 0.05, duration: 0.3, ease: EASE }}
                  className="rounded border border-[#E5E4DE] bg-[#FFFFFF] px-2 py-1.5"
                >
                  <p className="text-[9px] font-semibold text-[#252927] leading-snug truncate">
                    {c}
                  </p>
                  <div className="mt-1 h-1 rounded-full bg-[#F7F6F1] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${45 + ci * 15}%` }}
                      transition={{ delay: 0.45 + ci * 0.06, duration: 0.5, ease: EASE }}
                      className="h-full rounded-full bg-[#635BCE]"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}

/* ── Follow-up ───────────────────────────────────────────────────────── */

function FollowUpPreview() {
  const tabs = [
    { label: "Hari Ini", count: 7, active: true },
    { label: "Mendatang", count: 12, active: false },
    { label: "Terlambat", count: 2, active: false },
    { label: "Selesai", count: 34, active: false },
  ];

  const tasks = [
    { name: "PT Sinar Abadi Nusantara", task: "Konfirmasi revisi penawaran", time: "10:30" },
    { name: "CV Mitra Karya Mandiri", task: "Jadwal presentasi kontrak", time: "14:00" },
  ];

  return (
    <Frame title="relasy / follow-up">
      <div className="flex items-center gap-1 mb-2.5 overflow-hidden">
        {tabs.map((t) => (
          <span
            key={t.label}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold whitespace-nowrap ${
              t.active
                ? "bg-[#E9E8FC] text-[#635BCE] border border-[#D5D3F5]"
                : "text-[#6F716D] border border-transparent"
            }`}
          >
            {t.label}
            <span className="text-[8px] tabular-nums opacity-70">{t.count}</span>
          </span>
        ))}
      </div>

      <div className="rounded-lg border border-[#E5E4DE] overflow-hidden">
        {tasks.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.36, ease: EASE }}
            className="px-3 py-2 flex items-center gap-2.5 border-b border-[#E5E4DE] last:border-b-0"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.35 + i * 0.1, duration: 0.3, ease: EASE }}
              className="w-4 h-4 rounded border-[1.5px] border-[#A8AAA4] bg-[#FFFFFF] flex items-center justify-center shrink-0"
            >
              <MarkCheck className="w-2.5 h-2.5 text-[#A8AAA4]" />
            </motion.span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-[#252927] truncate">
                {t.name}
              </p>
              <p className="text-[9px] text-[#6F716D] truncate">{t.task}</p>
            </div>
            <span className="text-[9px] font-mono text-[#6F716D] shrink-0 tabular-nums">
              {t.time}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-2.5 rounded-lg border border-[#D5D3F5] bg-[#E9E8FC]/50 px-3 py-2">
        <p className="text-[9px] font-bold text-[#635BCE] mb-0.5">
          Template otomatis aktif
        </p>
        <p className="text-[9px] text-[#6F716D] leading-relaxed">
          Pesan tersusun lengkap dengan nama pelanggan dan jadwal.
        </p>
      </div>
    </Frame>
  );
}

const PREVIEW_MAP: Record<PreviewId, () => React.JSX.Element> = {
  dashboard: DashboardPreview,
  pelanggan: PelangganPreview,
  pipeline: PipelinePreview,
  "follow-up": FollowUpPreview,
};

export function ProductShowcase() {
  const [active, setActive] = useState<PreviewId>("dashboard");
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay || reduceMotion || !inView) return;
    const id = window.setInterval(() => {
      setActive((prev) => {
        const idx = PREVIEW_TABS.findIndex((t) => t.id === prev);
        return PREVIEW_TABS[(idx + 1) % PREVIEW_TABS.length].id;
      });
    }, 4200);
    return () => window.clearInterval(id);
  }, [autoPlay, reduceMotion, inView]);

  const ActivePreview = PREVIEW_MAP[active];
  const activeTab = PREVIEW_TABS.find((t) => t.id === active)!;

  return (
    <section
      id="pratinjau-aplikasi"
      aria-labelledby="pratinjau-heading"
      className="scroll-mt-24 pt-10 border-t border-[#E5E4DE]"
    >
      <div className="max-w-2xl space-y-2 mb-8">
        <h2
          id="pratinjau-heading"
          className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252927] leading-tight"
        >
          Lihat isi aplikasinya
        </h2>
        <p className="text-sm text-[#6F716D] leading-relaxed">
          Empat ruang kerja utama, tanpa menu tersembunyi.
        </p>
      </div>

      <div
        ref={sectionRef}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start"
      >
        {/* Tab rail */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div
            role="tablist"
            aria-label="Pratinjau halaman aplikasi"
            aria-orientation="vertical"
            className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0"
          >
            {PREVIEW_TABS.map((tab) => {
              const isActive = tab.id === active;
              const Mark = tab.Mark;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActive(tab.id);
                    setAutoPlay(false);
                  }}
                  className={`group relative shrink-0 lg:shrink text-left rounded-lg px-4 py-3 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] ${
                    isActive
                      ? "text-[#252927]"
                      : "text-[#6F716D] hover:text-[#252927]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="showcase-rail"
                      transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.7 }}
                      className="absolute inset-0 rounded-lg bg-[#FFFFFF] border border-[#D5D3F5] shadow-[0_2px_10px_-4px_rgba(99,91,206,0.3)]"
                    />
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="showcase-rail-bar"
                      transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.7 }}
                      className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-[#635BCE]"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2.5">
                    <Mark
                      className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                        isActive ? "text-[#635BCE]" : "text-[#A8AAA4]"
                      }`}
                    />
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {tab.label}
                    </span>
                  </span>
                  <span className="relative z-10 hidden lg:block text-xs text-[#6F716D] mt-1 pl-[26px] leading-snug">
                    {tab.caption}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview surface */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={inView || reduceMotion ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: EASE }}
            className="relative"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-[#E9E8FC] via-transparent to-transparent opacity-70 blur-xl"
            />
            <div className="relative rounded-2xl border border-[#E5E4DE] bg-[#FFFFFF] p-2.5 sm:p-3 shadow-[0_18px_50px_-28px_rgba(37,41,39,0.35)]">
              <div key={active} className="animate-preview-in">
                <ActivePreview />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 px-1">
              <p className="text-xs text-[#6F716D]">{activeTab.caption}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
