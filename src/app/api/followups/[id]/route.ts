import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { ensureDefaultAccount } from "@/lib/db/bootstrap";
import {
  getFollowupById,
  updateFollowup,
  updateFollowupStatus,
  rescheduleFollowup,
  deleteFollowup,
} from "@/lib/db/repositories/followup.repo";

const updateFollowupSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  note: z.string().max(2000).optional().nullable(),
  dueAt: z.string().optional(),
  status: z.enum(["pending", "completed"]).optional(),
  action: z.enum(["toggle_status", "reschedule"]).optional(),
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

    const task = getFollowupById(workspaceId, id);
    if (!task) {
      return NextResponse.json({ message: "Tugas tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("GET /api/followups/[id] error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    const body = await request.json();

    // Check specific action
    if (body.action === "toggle_status") {
      const existing = getFollowupById(workspaceId, id);
      if (!existing) {
        return NextResponse.json({ message: "Tugas tidak ditemukan." }, { status: 404 });
      }
      const newStatus = existing.status === "completed" ? "pending" : "completed";
      const updated = updateFollowupStatus(workspaceId, id, newStatus);
      return NextResponse.json({ success: true, status: newStatus });
    }

    if (body.action === "reschedule" && body.dueAt) {
      const updated = rescheduleFollowup(workspaceId, id, body.dueAt);
      if (!updated) {
        return NextResponse.json({ message: "Tugas tidak ditemukan." }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "Jadwal berhasil diperbarui." });
    }

    const parsed = updateFollowupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Input tidak valid." },
        { status: 400 }
      );
    }

    const updated = updateFollowup(workspaceId, id, parsed.data);
    if (!updated) {
      return NextResponse.json({ message: "Tugas tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/followups/[id] error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    const deleted = deleteFollowup(workspaceId, id);
    if (!deleted) {
      return NextResponse.json({ message: "Tugas tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Tugas berhasil dihapus." });
  } catch (error) {
    console.error("DELETE /api/followups/[id] error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
