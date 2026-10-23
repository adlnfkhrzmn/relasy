import { NextResponse } from "next/server";
import { z } from "zod";
import { firstIssueMessage } from "@/lib/utils";
import { getCurrentSession } from "@/lib/auth/session";
import { ensureDefaultAccount } from "@/lib/db/bootstrap";
import {
  createFollowup,
  getFollowups,
} from "@/lib/db/repositories/followup.repo";
import { getCustomerById } from "@/lib/db/repositories/customer.repo";

const createFollowupSchema = z.object({
  customerId: z.string().min(1, "Pelanggan wajib dipilih."),
  opportunityId: z.string().optional().nullable(),
  title: z.string().min(1, "Judul tugas follow-up wajib diisi.").max(120),
  note: z.string().max(2000).optional().nullable(),
  dueAt: z.string().min(1, "Tanggal tenggat wajib diisi."),
});

export async function GET(request: Request) {
  try {
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    const { searchParams } = new URL(request.url);
    const tab = (searchParams.get("tab") as any) || undefined;
    const customerId = searchParams.get("customerId") || undefined;
    const referenceDate = searchParams.get("refDate") || undefined;

    const followups = getFollowups(workspaceId, { tab, customerId, referenceDate });

    // Also get tab counts for live badges
    const allToday = getFollowups(workspaceId, { tab: "today", customerId, referenceDate });
    const allUpcoming = getFollowups(workspaceId, { tab: "upcoming", customerId, referenceDate });
    const allOverdue = getFollowups(workspaceId, { tab: "overdue", customerId, referenceDate });
    const allCompleted = getFollowups(workspaceId, { tab: "completed", customerId, referenceDate });

    return NextResponse.json({
      success: true,
      data: followups,
      counts: {
        today: allToday.length,
        upcoming: allUpcoming.length,
        overdue: allOverdue.length,
        completed: allCompleted.length,
      },
    });
  } catch (error) {
    console.error("GET /api/followups error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memuat tugas follow-up." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    // Body kosong atau JSON rusak harus dijawab 400, bukan 500.
    const body = await request.json().catch(() => ({}));
    const parsed = createFollowupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: firstIssueMessage(parsed.error.issues, "Data follow-up tidak valid.") },
        { status: 400 }
      );
    }

    const customer = getCustomerById(workspaceId, parsed.data.customerId);
    if (!customer) {
      return NextResponse.json(
        { message: "Pelanggan tidak valid atau tidak ditemukan." },
        { status: 404 }
      );
    }

    const followup = createFollowup(workspaceId, {
      customerId: parsed.data.customerId,
      opportunityId: parsed.data.opportunityId || null,
      title: parsed.data.title,
      note: parsed.data.note || null,
      dueAt: parsed.data.dueAt,
    });

    return NextResponse.json({ success: true, data: followup }, { status: 201 });
  } catch (error) {
    console.error("POST /api/followups error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server saat membuat follow-up." },
      { status: 500 }
    );
  }
}
