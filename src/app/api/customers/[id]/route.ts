import { NextResponse } from "next/server";
import { z } from "zod";
import { firstIssueMessage } from "@/lib/utils";
import { getCurrentSession } from "@/lib/auth/session";
import { ensureDefaultAccount } from "@/lib/db/bootstrap";
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  archiveCustomer,
  restoreCustomer,
} from "@/lib/db/repositories/customer.repo";
import { getOpportunities } from "@/lib/db/repositories/opportunity.repo";
import { getFollowups } from "@/lib/db/repositories/followup.repo";
import { getActivities } from "@/lib/db/repositories/activity.repo";

const updateCustomerSchema = z.object({
  name: z.string().min(1, "Nama lengkap wajib diisi.").max(120).optional(),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email("Format email tidak valid.").optional().nullable().or(z.literal("")),
  company: z.string().max(120).optional().nullable(),
  source: z.string().max(80).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  action: z.enum(["update", "archive", "restore"]).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    const customer = await getCustomerById(workspaceId, id);
    if (!customer) {
      return NextResponse.json(
        { message: "Pelanggan tidak ditemukan atau tidak memiliki hak akses." },
        { status: 404 }
      );
    }

    const [opportunities, followups, activities] = await Promise.all([
      getOpportunities(workspaceId, { customerId: id }),
      getFollowups(workspaceId, { customerId: id }),
      getActivities(workspaceId, { customerId: id }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        customer,
        opportunities,
        followups,
        activities,
      },
    });
  } catch (error) {
    console.error("GET /api/customers/[id] error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memuat detail pelanggan." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    // Body kosong atau JSON rusak harus dijawab 400, bukan 500.
    const body = await request.json().catch(() => ({}));
    const parsed = updateCustomerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: firstIssueMessage(parsed.error.issues, "Input tidak valid.") },
        { status: 400 }
      );
    }

    // Handle archive / restore action
    if (parsed.data.action === "archive") {
      const archived = await archiveCustomer(workspaceId, id);
      if (!archived) {
        return NextResponse.json({ message: "Gagal mengarsipkan pelanggan." }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "Pelanggan berhasil diarsipkan." });
    }

    if (parsed.data.action === "restore") {
      const restored = await restoreCustomer(workspaceId, id);
      if (!restored) {
        return NextResponse.json({ message: "Gagal memulihkan pelanggan." }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "Pelanggan berhasil dipulihkan." });
    }

    const updated = await updateCustomer(workspaceId, id, {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      company: parsed.data.company || null,
      source: parsed.data.source || null,
      notes: parsed.data.notes || null,
    });

    if (!updated) {
      return NextResponse.json(
        { message: "Pelanggan tidak ditemukan atau tidak memiliki hak akses." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/customers/[id] error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui data pelanggan." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    const deleted = await deleteCustomer(workspaceId, id);
    if (!deleted) {
      return NextResponse.json(
        { message: "Pelanggan tidak ditemukan atau tidak dapat dihapus." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Pelanggan berhasil dihapus." });
  } catch (error) {
    console.error("DELETE /api/customers/[id] error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menghapus pelanggan." },
      { status: 500 }
    );
  }
}
