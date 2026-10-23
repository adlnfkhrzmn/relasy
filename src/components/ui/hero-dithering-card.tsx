"use client";

import Link from "next/link";
import React, { Suspense, lazy, useEffect, useState } from "react";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({
    default: mod.Dithering,
  }))
);

export type CTASectionProps = {
  primaryHref: string;
};

export function CTASection({ primaryHref }: CTASectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <section
      aria-label="Hero Utama Relasy CRM"
      className="w-full flex justify-center items-center"
    >
      <div
        className="w-full max-w-7xl relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-[32px] md:rounded-[48px] border border-[#E5E4DE] bg-[#FFFFFF] shadow-sm min-h-[540px] md:min-h-[600px] flex flex-col items-center justify-center">
          <Suspense
            fallback={<div className="absolute inset-0 bg-[#F7F6F1]/50" />}
          >
            <div className="absolute inset-0 z-0 pointer-events-none opacity-35 dark:opacity-25 mix-blend-multiply dark:mix-blend-screen">
              <Dithering
                colorBack="#00000000"
                colorFront="#635BCE"
                shape="warp"
                type="4x4"
                speed={prefersReducedMotion ? 0 : isHovered ? 0.6 : 0.2}
                className="size-full"
                minPixelRatio={1}
              />
            </div>
          </Suspense>

          <div className="relative z-10 px-6 py-14 md:py-20 max-w-4xl mx-auto text-center flex flex-col items-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#D5D3F5] bg-[#E9E8FC] px-4 py-1.5 text-sm font-medium text-[#635BCE] backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#635BCE] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#635BCE]" />
              </span>
              CRM Mandiri untuk Bisnis Indonesia
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#252927] mb-8 leading-[1.05]">
              Data pelanggan tertata.
              <br />
              <span className="text-[#6F716D]">Langkah berikutnya jelas.</span>
            </h1>

            <p className="text-[#6F716D] text-base sm:text-lg md:text-xl max-w-2xl mb-11 leading-relaxed">
              Kelola database pelanggan bebas duplikat, pantau nilai penawaran
              dalam Rupiah, dan jalankan jadwal follow-up harian dengan custom
              template teks. Semua dari satu ruang kerja.
            </p>

            <div className="flex items-center justify-center">
              <Link
                href={primaryHref}
                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-[#635BCE] px-10 sm:px-12 text-base font-medium text-white transition-all duration-300 hover:bg-[#524AB8] hover:ring-4 hover:ring-[#635BCE]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:ring-offset-2 no-underline"
              >
                <span className="relative z-10">Masuk ke Aplikasi</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
