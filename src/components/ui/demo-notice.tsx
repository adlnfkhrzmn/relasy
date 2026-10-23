import { MarkGithub } from "./marks";

/**
 * Tautan resmi Relasy.
 *
 * `SOURCE_REPO_URL` adalah repositori publik yang boleh dibaca siapa saja,
 * sedangkan `PRIVATE_REPO_URL` menunjuk repositori privat berisi source code
 * yang dijual. Keduanya dipakai oleh pemberitahuan demo di landing page dan
 * sidebar aplikasi.
 */
export const SOURCE_REPO_URL = "https://github.com/adlnfkhrzmn/relasy";
export const PRIVATE_REPO_URL = "https://github.com/adlnfkhrzmn/source-relasy";

const linkClass =
  "inline-flex items-center gap-1.5 font-medium text-[#252927] underline decoration-[#D5D4CD] decoration-1 underline-offset-2 hover:decoration-[#635BCE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:ring-offset-2 rounded-sm transition-colors";

/**
 * Pemberitahuan kecil bahwa Relasy adalah versi demo dan source code-nya dijual.
 *
 * Sengaja dibuat setipis mungkin: satu baris, satu label, satu tautan. Tidak
 * memakai kartu, bayangan, atau ikon dekoratif supaya komposisi halaman tetap
 * utuh dan pemberitahuan ini terbaca sebagai keterangan, bukan promosi.
 */
export function DemoNotice({ className = "" }: { className?: string }) {
  return (
    <p
      className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-[#6F716D] ${className}`}
    >
      <span className="inline-flex items-center rounded-sm border border-[#E5E4DE] bg-[#FFFFFF] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6F716D]">
        Demo
      </span>
      <span>Source code tersedia untuk dibeli.</span>
      <a
        href={SOURCE_REPO_URL}
        target="_blank"
        rel="noreferrer noopener"
        className={linkClass}
        aria-label="Buka repositori Relasy di GitHub"
      >
        <MarkGithub className="w-3.5 h-3.5 shrink-0" />
        <span className="sm:hidden">GitHub</span>
        <span className="hidden sm:inline">github.com/adlnfkhrzmn/relasy</span>
      </a>
    </p>
  );
}
