"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { CTASection } from "@/components/ui/hero-dithering-card";
import { ProductShowcase } from "@/components/ui/product-showcase";
import { RelasyLogo } from "@/components/ui/relasy-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DemoNotice } from "@/components/ui/demo-notice";
import {
  MarkLedger,
  MarkContacts,
  MarkFunnel,
  MarkSchedule,
  MarkTemplate,
  MarkTimeline,
  MarkGauge,
} from "@/components/ui/marks";

const SEO_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Relasy CRM",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      inLanguage: "id-ID",
      description:
        "Aplikasi CRM untuk bisnis yang sedang berkembang di Indonesia. Simpan data pelanggan, pantau pipeline penjualan dalam Rupiah, dan jadwalkan follow-up dengan custom template teks.",
      featureList: [
        "Data Pelanggan dengan Impor dan Ekspor CSV",
        "Pipeline Penjualan dalam Rupiah",
        "Jadwal Follow-up dengan Konfirmasi Penyelesaian",
        "Custom Template Teks yang Dapat Diaktifkan atau Dinonaktifkan",
        "Riwayat Aktivitas dan Catatan Komunikasi Pelanggan",
        "Dashboard Ringkasan Harian",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Apa fungsi utama aplikasi CRM Relasy?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Relasy membantu pemilik usaha dan tim penjualan menyimpan data pelanggan, memantau perkembangan peluang penjualan di pipeline, mencatat riwayat komunikasi, dan menjadwalkan follow-up harian.",
          },
        },
        {
          "@type": "Question",
          name: "Apakah pengguna bisa membuat custom template teks sendiri di Relasy?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ya. Pengguna dapat menulis dan menyimpan custom template teks sendiri lengkap dengan variabel otomatis seperti nama pelanggan, perusahaan, judul tugas, dan tanggal tenggat, serta mengaktifkan atau menonaktifkannya kapan saja.",
          },
        },
      ],
    },
  ],
};

const LANDING_SECTIONS = [
  { id: "beranda", label: "Beranda" },
  { id: "pratinjau-aplikasi", label: "Pratinjau" },
  { id: "keunggulan", label: "Keunggulan" },
  { id: "ekosistem-fitur", label: "Modul" },
  { id: "simulasi-template", label: "Template" },
  { id: "panduan-crm", label: "Panduan" },
] as const;

const EASE_LUXE = [0.22, 1, 0.36, 1] as const;

const HIGHLIGHTS = [
  {
    title: "Prioritas hari ini langsung terlihat",
    line: "Follow-up hari ini, yang terlambat, dan nilai peluang terbuka.",
    Mark: MarkSchedule,
  },
  {
    title: "Template pesan tanpa ketik ulang",
    line: "Nama pelanggan dan jadwal terisi otomatis.",
    Mark: MarkTemplate,
  },
  {
    title: "Impor CSV tanpa data ganda",
    line: "Nomor telepon dan email dicek sebelum masuk.",
    Mark: MarkLedger,
  },
];

const PRIMARY_MODULES = [
  {
    title: "Data Pelanggan",
    line: "Kontak terpusat, impor dan ekspor CSV",
    Mark: MarkContacts,
  },
  {
    title: "Pipeline Penjualan",
    line: "Nilai Rupiah per tahap, terhitung otomatis",
    Mark: MarkFunnel,
  },
  {
    title: "Jadwal Follow-up",
    line: "Hari ini, mendatang, terlambat, selesai",
    Mark: MarkSchedule,
  },
];

const SUPPORTING_MODULES = [
  {
    title: "Template Pesan",
    line: "Variabel nama dan jadwal otomatis",
    Mark: MarkTemplate,
  },
  {
    title: "Riwayat Aktivitas",
    line: "Catatan telepon dan pertemuan per pelanggan",
    Mark: MarkTimeline,
  },
  {
    title: "Dashboard Ringkasan",
    line: "Angka kunci dan jadwal harian",
    Mark: MarkGauge,
  },
];

const TEMPLATE_VARIABLES = [
  { token: "{nama}", label: "Nama pelanggan" },
  { token: "{perusahaan}", label: "Perusahaan" },
  { token: "{judul_tugas}", label: "Topik follow-up" },
  { token: "{tanggal}", label: "Tanggal jadwal" },
];

const WORKFLOW = [
  { step: "01", title: "Impor pelanggan", line: "Langsung atau dari CSV." },
  { step: "02", title: "Susun pipeline", line: "Isi nilai penawaran per tahap." },
  { step: "03", title: "Jalankan follow-up", line: "Pesan tersusun dari template." },
];

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: EASE_LUXE }}
    >
      {children}
    </motion.div>
  );
}

export default function FrontLandingPage() {
  const [activeSection, setActiveSection] = useState<string>("beranda");
  const [templateModePreview, setTemplateModePreview] = useState<
    "auto" | "manual"
  >("auto");
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 150;

      // When the page is scrolled to the very bottom, the last section can
      // never satisfy the offsetTop test because its top is above the fold
      // but the viewport cannot scroll any further. Pin it explicitly.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;

      if (atBottom) {
        setActiveSection(LANDING_SECTIONS[LANDING_SECTIONS.length - 1].id);
        return;
      }

      for (let i = LANDING_SECTIONS.length - 1; i >= 0; i--) {
        const sec = LANDING_SECTIONS[i];
        const el = document.getElementById(sec.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= scrollPos) {
          setActiveSection(sec.id);
          break;
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-[#F7F6F1] text-[#252927] transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SEO_JSON_LD) }}
      />

      <header className="landing-header fixed top-0 inset-x-0 z-50 h-16 backdrop-blur-md border-b px-4 sm:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => scrollToSection("beranda")}
            aria-label="Relasy Beranda"
            className="inline-flex items-center text-left bg-transparent hover:bg-transparent active:bg-transparent border-0 shadow-none p-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:ring-offset-2 transition-opacity hover:opacity-85 cursor-pointer shrink-0 [-webkit-tap-highlight-color:transparent]"
          >
            <RelasyLogo size="sm" />
          </button>

          <nav
            aria-label="Navigasi Bagian Halaman"
            className="landing-nav-shell flex items-center gap-1 p-1 rounded-lg border overflow-x-auto max-w-full"
          >
            {LANDING_SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] ${
                    isActive
                      ? "text-[#635BCE]"
                      : "text-[#6F716D] hover:text-[#252927]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="landing-section-pill"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 34,
                        mass: 0.7,
                      }}
                      className="landing-nav-pill absolute inset-0 rounded-md border"
                    >
                      {!reduceMotion && (
                        <motion.span
                          key={`shine-${activeSection}`}
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 overflow-hidden rounded-md"
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 0 }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                        >
                          <motion.span
                            className="landing-pill-shine absolute inset-y-0 -left-1/3 w-1/3"
                            initial={{ x: "0%" }}
                            animate={{ x: "420%" }}
                            transition={{ duration: 0.7, ease: EASE_LUXE }}
                          />
                        </motion.span>
                      )}
                    </motion.span>
                  )}
                  <span className="relative z-10">{sec.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#635BCE] hover:bg-[#524AB8] text-white text-xs sm:text-sm font-semibold transition-colors duration-150 no-underline"
            >
              <span>Masuk</span>
            </Link>
          </div>
        </div>

        <motion.div
          aria-hidden="true"
          style={{ scaleX: progressX }}
          className="absolute bottom-0 left-0 h-px w-full origin-left bg-gradient-to-r from-[#635BCE] to-[#9D96F0]"
        />
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 space-y-24 pb-20">
        <div id="beranda" className="scroll-mt-24">
          <CTASection primaryHref="/login" />
        </div>

        <ProductShowcase />

        <section
          id="keunggulan"
          aria-labelledby="keunggulan-relasy-heading"
          className="scroll-mt-24 pt-10 border-t border-[#E5E4DE]"
        >
          <Reveal className="max-w-2xl space-y-2 mb-8">
            <h2
              id="keunggulan-relasy-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252927] leading-tight"
            >
              Rapih tanpa banyak pengaturan
            </h2>
            <p className="text-sm text-[#6F716D] leading-relaxed">
              Tiga hal yang paling sering membuat peluang penjualan lepas.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HIGHLIGHTS.map((item, i) => {
              const Mark = item.Mark;
              return (
                <Reveal key={item.title} delay={i * 0.07}>
                  <div className="group relative h-full rounded-2xl bg-[#FFFFFF] border border-[#E5E4DE] p-6 transition-colors duration-300 hover:border-[#D5D3F5]">
                    <span
                      aria-hidden="true"
                      className="absolute top-5 right-6 font-mono text-[11px] font-semibold text-[#D5D4CD] tabular-nums"
                    >
                      0{i + 1}
                    </span>
                    <Mark className="w-7 h-7 text-[#635BCE] mb-5" />
                    <h3 className="text-sm sm:text-base font-bold text-[#252927] leading-snug pr-8">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6F716D] leading-relaxed mt-1.5">
                      {item.line}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section
          id="ekosistem-fitur"
          aria-labelledby="fitur-lengkap-heading"
          className="scroll-mt-24 space-y-6 pt-10 border-t border-[#E5E4DE]"
        >
          <Reveal className="max-w-2xl space-y-2">
            <h2
              id="fitur-lengkap-heading"
              className="text-2xl sm:text-3xl font-bold text-[#252927] tracking-tight"
            >
              6 modul, satu alur kerja
            </h2>
            <p className="text-sm text-[#6F716D] leading-relaxed">
              Kontak, penawaran, dan follow-up saling terhubung.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRIMARY_MODULES.map((feat, i) => {
              const Mark = feat.Mark;
              return (
                <Reveal key={feat.title} delay={i * 0.07}>
                  <div className="group h-full rounded-2xl border border-[#E5E4DE] bg-[#FFFFFF] p-6 transition-colors duration-300 hover:border-[#D5D3F5]">
                    <Mark className="w-7 h-7 text-[#635BCE] mb-5" />
                    <h3 className="text-base font-bold text-[#252927] tracking-tight">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6F716D] leading-relaxed mt-1.5">
                      {feat.line}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.1}>
            <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5E4DE] divide-y md:divide-y-0 md:divide-x divide-[#E5E4DE] grid grid-cols-1 md:grid-cols-3 overflow-hidden">
              {SUPPORTING_MODULES.map((feat) => {
                const Mark = feat.Mark;
                return (
                  <div
                    key={feat.title}
                    className="p-5 flex items-center gap-3.5 transition-colors duration-200 hover:bg-[#F7F6F1]/60"
                  >
                    <Mark className="w-5 h-5 text-[#635BCE] shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#252927]">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-[#6F716D] mt-0.5 leading-snug">
                        {feat.line}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </section>

        <section
          id="simulasi-template"
          aria-labelledby="demo-template-heading"
          className="scroll-mt-24 pt-10 border-t border-[#E5E4DE]"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-8">
            <Reveal className="max-w-2xl space-y-2">
              <h2
                id="demo-template-heading"
                className="text-2xl sm:text-3xl font-bold text-[#252927] tracking-tight leading-tight"
              >
                Buat custom template teks sesuai gaya bahasa bisnis Anda
              </h2>
              <p className="text-sm text-[#6F716D] leading-relaxed">
                Tulis sekali, pakai berkali-kali. Aktifkan saat ingin otomatis,
                matikan saat ingin menulis manual.
              </p>
            </Reveal>

            <Reveal delay={0.06} className="shrink-0">
              <div
                role="group"
                aria-label="Pilih mode template"
                className="relative inline-flex items-center p-1 rounded-lg bg-[#F7F6F1] border border-[#E5E4DE]"
              >
                {(
                  [
                    { id: "auto", label: "Mode Otomatis" },
                    { id: "manual", label: "Mode Manual" },
                  ] as const
                ).map((mode) => {
                  const isActive = templateModePreview === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTemplateModePreview(mode.id)}
                      aria-pressed={isActive}
                      className={`relative px-4 py-2 rounded-md text-xs font-semibold transition-colors duration-200 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] ${
                        isActive
                          ? "text-[#635BCE]"
                          : "text-[#6F716D] hover:text-[#252927]"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="template-mode-pill"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 34,
                            mass: 0.7,
                          }}
                          className="landing-nav-pill absolute inset-0 rounded-md border"
                        />
                      )}
                      <span className="relative z-10">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
            <Reveal className="lg:col-span-5">
              <div className="h-full rounded-2xl bg-[#FFFFFF] border border-[#E5E4DE] p-6 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#6F716D]">
                    Perilaku template
                  </p>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                      templateModePreview === "auto"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-[#F7F6F1] text-[#6F716D] border-[#E5E4DE]"
                    }`}
                  >
                    {templateModePreview === "auto" ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                <p className="text-lg font-bold text-[#252927] tracking-tight mt-4">
                  {templateModePreview === "auto"
                    ? "Pesan tersusun sendiri"
                    : "Pesan Anda tulis sendiri"}
                </p>
                <p className="text-xs sm:text-sm text-[#6F716D] leading-relaxed mt-2">
                  {templateModePreview === "auto"
                    ? "Nama pelanggan dan jadwal terisi otomatis saat Anda membuka tugas follow-up."
                    : "Tulis pesan dari awal untuk situasi yang butuh kalimat khusus."}
                </p>

                <div className="mt-6 pt-4 border-t border-[#E5E4DE] flex items-center gap-2 text-xs text-[#6F716D]">
                  <MarkTemplate className="w-4 h-4 text-[#635BCE] shrink-0" />
                  <span>Bisa diubah kapan saja tanpa kehilangan riwayat.</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="lg:col-span-7">
              <div className="h-full rounded-2xl bg-[#FFFFFF] border border-[#E5E4DE] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-[#E5E4DE] flex items-center justify-between gap-3">
                  <h3 className="text-sm sm:text-base font-bold text-[#252927]">
                    Variabel otomatis
                  </h3>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#E9E8FC] text-[#635BCE] border border-[#D5D3F5] shrink-0">
                    4 Variabel
                  </span>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  {TEMPLATE_VARIABLES.map((item) => (
                    <div
                      key={item.token}
                      className="rounded-lg border border-[#E5E4DE] bg-[#F7F6F1]/60 px-4 py-3 transition-colors duration-200 hover:border-[#D5D3F5] hover:bg-[#E9E8FC]/50"
                    >
                      <code className="block font-mono text-xs font-bold text-[#635BCE]">
                        {item.token}
                      </code>
                      <span className="block text-xs text-[#6F716D] mt-1">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-3.5 border-t border-[#E5E4DE] text-xs text-[#6F716D]">
                  Tersedia 3 pilihan gaya bahasa awal yang bisa Anda ubah.
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="panduan-crm"
          aria-labelledby="seo-guide-heading"
          className="scroll-mt-24 pt-10 border-t border-[#E5E4DE] space-y-6"
        >
          <Reveal className="max-w-2xl space-y-2">
            <h2
              id="seo-guide-heading"
              className="text-2xl sm:text-3xl font-bold text-[#252927] tracking-tight"
            >
              Tiga langkah, selesai
            </h2>
            <p className="text-sm text-[#6F716D] leading-relaxed">
              Alur kerja harian dari kontak masuk sampai follow-up terkirim.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WORKFLOW.map((item, i) => (
              <Reveal key={item.step} delay={i * 0.07}>
                <div className="h-full rounded-2xl bg-[#FFFFFF] border border-[#E5E4DE] p-6">
                  <span className="font-mono text-2xl font-bold text-[#E9E8FC] tabular-nums">
                    {item.step}
                  </span>
                  <h3 className="text-base font-bold text-[#252927] tracking-tight mt-3">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6F716D] leading-relaxed mt-1.5">
                    {item.line}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <footer className="pt-8 border-t border-[#E5E4DE] space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#6F716D]">
            <div className="flex items-center gap-3">
              <RelasyLogo size="sm" />
            </div>
            <p>Relasy CRM. Data pelanggan, pipeline penjualan, jadwal follow-up.</p>
          </div>
          <DemoNotice />
        </footer>
      </main>
    </div>
  );
}
