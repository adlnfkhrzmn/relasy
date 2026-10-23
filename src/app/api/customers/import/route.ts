import { NextResponse } from "next/server";
import { z } from "zod";
import { firstIssueMessage } from "@/lib/utils";
import { getCurrentSession } from "@/lib/auth/session";
import { ensureDefaultAccount } from "@/lib/db/bootstrap";
import {
  createCustomer,
  getAllWorkspaceCustomers,
  updateCustomer,
} from "@/lib/db/repositories/customer.repo";
import {
  cleanImportedPhone,
  normalizePhoneForComparison,
} from "@/lib/customer-csv";

const importRowSchema = z.object({
  rowNumber: z.number().int().positive().optional(),
  id: z.string().max(100).optional().nullable(),
  name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const importRequestSchema = z.object({
  duplicateStrategy: z.enum(["skip", "update"]).default("skip"),
  rows: z
    .array(importRowSchema)
    .min(1, "Tidak ada baris data yang dikirim untuk diimpor.")
    .max(2000, "Maksimal 2000 baris pelanggan dalam satu kali impor."),
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ImportRowReport {
  rowNumber: number;
  name: string;
  outcome: "imported" | "updated" | "skipped" | "rejected";
  reason?: string;
}

export async function POST(request: Request) {
  try {
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { message: "Format permintaan impor tidak valid." },
        { status: 400 }
      );
    }

    const parsed = importRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: firstIssueMessage(parsed.error.issues, "Data impor tidak valid.") },
        { status: 400 }
      );
    }

    const { duplicateStrategy, rows } = parsed.data;
    const existingCustomers = getAllWorkspaceCustomers(workspaceId);

    const byId = new Map<string, string>();
    const byPhone = new Map<string, string>();
    const byEmail = new Map<string, string>();

    for (const cust of existingCustomers) {
      byId.set(cust.id.toLowerCase(), cust.id);
      const normPhone = normalizePhoneForComparison(cust.phone);
      if (normPhone && normPhone.length >= 7) {
        byPhone.set(normPhone, cust.id);
      }
      if (cust.email && cust.email.trim()) {
        byEmail.set(cust.email.trim().toLowerCase(), cust.id);
      }
    }

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let rejectedCount = 0;
    const details: ImportRowReport[] = [];

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const rowNumber = raw.rowNumber ?? i + 1;
      const id = raw.id ? raw.id.trim() : null;
      const name = (raw.name ?? "").trim();
      const phone = cleanImportedPhone(raw.phone);
      const email = raw.email ? raw.email.trim().toLowerCase() : null;
      const company = raw.company ? raw.company.trim() : null;
      const source = raw.source ? raw.source.trim() : null;
      const notes = raw.notes ? raw.notes.trim() : null;

      if (!name) {
        rejectedCount++;
        details.push({
          rowNumber,
          name: "(Tanpa Nama)",
          outcome: "rejected",
          reason: "Nama pelanggan wajib diisi.",
        });
        continue;
      }

      if (name.length > 120) {
        rejectedCount++;
        details.push({
          rowNumber,
          name,
          outcome: "rejected",
          reason: "Nama pelanggan melebihi 120 karakter.",
        });
        continue;
      }

      if (email && !EMAIL_REGEX.test(email)) {
        rejectedCount++;
        details.push({
          rowNumber,
          name,
          outcome: "rejected",
          reason: "Format alamat email tidak valid.",
        });
        continue;
      }

      if (phone && phone.length > 30) {
        rejectedCount++;
        details.push({
          rowNumber,
          name,
          outcome: "rejected",
          reason: "Nomor telepon melebihi 30 karakter.",
        });
        continue;
      }

      const normPhone = normalizePhoneForComparison(phone);
      let matchedId: string | undefined;
      let duplicateReason: string | undefined;

      if (id && byId.has(id.toLowerCase())) {
        matchedId = byId.get(id.toLowerCase());
        duplicateReason = "ID pelanggan sudah terdaftar.";
      } else if (normPhone && normPhone.length >= 7 && byPhone.has(normPhone)) {
        matchedId = byPhone.get(normPhone);
        duplicateReason = "Nomor telepon sudah terdaftar.";
      } else if (email && byEmail.has(email)) {
        matchedId = byEmail.get(email);
        duplicateReason = "Alamat email sudah terdaftar.";
      }

      if (matchedId) {
        if (duplicateStrategy === "update") {
          updateCustomer(workspaceId, matchedId, {
            name,
            phone: phone || undefined,
            email: email || undefined,
            company: company || undefined,
            source: source || undefined,
            notes: notes || undefined,
          });
          updatedCount++;
          details.push({
            rowNumber,
            name,
            outcome: "updated",
            reason: "Data pelanggan yang cocok berhasil diperbarui.",
          });
        } else {
          skippedCount++;
          details.push({
            rowNumber,
            name,
            outcome: "skipped",
            reason: duplicateReason || "Dilewati karena duplikat.",
          });
        }
        continue;
      }

      const created = createCustomer(workspaceId, {
        name,
        phone,
        email,
        company,
        source,
        notes,
      });

      byId.set(created.id.toLowerCase(), created.id);
      if (normPhone && normPhone.length >= 7) {
        byPhone.set(normPhone, created.id);
      }
      if (email) {
        byEmail.set(email, created.id);
      }

      importedCount++;
      details.push({
        rowNumber,
        name,
        outcome: "imported",
      });
    }

    return NextResponse.json({
      success: true,
      report: {
        importedCount,
        updatedCount,
        skippedCount,
        rejectedCount,
        totalProcessed: rows.length,
        details,
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memproses impor data pelanggan." },
      { status: 500 }
    );
  }
}
