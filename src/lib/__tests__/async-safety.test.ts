import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Penjaga regresi: memastikan tidak ada fungsi repository async yang
 * dipanggil tanpa `await`.
 *
 * Kenapa test ini perlu ada padahal TypeScript sudah jalan?
 *
 * TypeScript menangkap sebagian besar kasus, tetapi tidak semuanya. Contoh
 * yang lolos:
 *
 *   const archived = archiveCustomer(ws, id);
 *   if (!archived) { ... }            // Promise selalu truthy -> tidak error
 *   return NextResponse.json({ data: customer }); // argumen bertipe any
 *
 * Pada kasus seperti itu bug tidak terdeteksi sampai aplikasi berjalan:
 * respons berisi `{}` dan pengecekan berhasil/gagal selalu dianggap benar.
 * Test ini menutup celah tersebut.
 */

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

/** Mengumpulkan nama fungsi async yang diekspor dari lapisan database. */
function collectAsyncRepoNames(): Set<string> {
  const names = new Set<string>();
  const dbDir = path.join(SRC, "lib", "db");

  for (const file of walk(dbDir)) {
    if (file.includes(`${path.sep}__tests__${path.sep}`)) continue;
    const source = fs.readFileSync(file, "utf8");
    const pattern = /export\s+async\s+function\s+(\w+)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source))) names.add(match[1]);
  }

  return names;
}

/**
 * Mencari pemanggilan `nama(...)` yang tidak didahului `await`.
 *
 * Beberapa bentuk sengaja diabaikan karena memang benar:
 *  - `return nama(...)` di dalam fungsi async: nilai kembaliannya otomatis
 *    ditunggu oleh JavaScript.
 *  - `nama(...)` sebagai elemen array di dalam Promise.all([...]).
 */
function findMissingAwait(file: string, names: Set<string>): string[] {
  const source = fs.readFileSync(file, "utf8");
  const lines = source.split(/\r?\n/);
  const problems: string[] = [];

  // Deteksi apakah pemanggilan berada di dalam Promise.all([...]).
  const insidePromiseAll = (lineIndex: number): boolean => {
    let depth = 0;
    for (let i = lineIndex; i >= Math.max(0, lineIndex - 12); i--) {
      const text = lines[i];
      depth += (text.match(/\]/g) || []).length;
      depth -= (text.match(/\[/g) || []).length;
      if (text.includes("Promise.all(") && depth <= 0) return true;
    }
    return false;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*")) return;
    if (/^\s*import\b/.test(line)) return;
    if (/export\s+async\s+function/.test(line)) return;

    for (const name of names) {
      const pattern = new RegExp(`(^|[^.\\w])${name}\\s*\\(`, "g");
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(line))) {
        const before = line.slice(0, match.index + match[1].length);

        if (/\bawait\s*$/.test(before)) continue;
        if (/\bfunction\s+$/.test(before)) continue;
        if (/^\s*return\s+$/.test(before)) continue;
        if (insidePromiseAll(index)) continue;

        problems.push(`${path.relative(ROOT, file)}:${index + 1} -> ${trimmed}`);
      }
    }
  });

  return problems;
}

describe("Async correctness", () => {
  it("tidak ada pemanggilan fungsi database tanpa await", () => {
    const names = collectAsyncRepoNames();
    expect(names.size).toBeGreaterThan(20);

    const problems: string[] = [];
    for (const file of walk(SRC)) {
      if (file.includes(`${path.sep}__tests__${path.sep}`)) continue;
      problems.push(...findMissingAwait(file, names));
    }

    expect(problems, `Pemanggilan tanpa await:\n${problems.join("\n")}`).toEqual([]);
  });
});
