import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { ensureDefaultAccount } from "@/lib/db/bootstrap";
import { createActivity, getActivities } from "@/lib/db/repositories/activity.repo";
import { getCustomerById } from "@/lib/db/repositories/customer.repo";
import { ACTIVITY_TYPES, ActivityType } from "@/lib/constants";

const validTypes = ACTIVITY_TYPES.map((t) => t.id) as [ActivityType, ...ActivityType[]];

const createActivitySchema = z.object({
  customerId: z.string().min(1, "Pelanggan wajib dipilih."),
  opportunityId: z.string().optional().nullable(),
  type: z.enum(validTypes),
  title: z.string().min(1, "Ringkasan aktivitas wajib diisi.").max(120),
  body: z.string().max(2000).optional().nullable(),
  happenedAt: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId") || undefined;
    const opportunityId = searchParams.get("opportunityId") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    const activities = getActivities(workspaceId, { customerId, opportunityId, limit });
    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    console.error("GET /api/activities error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memuat riwayat aktivitas." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    const body = await request.json();
    const parsed = createActivitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Data aktivitas tidak valid." },
        { status: 400 }
      );
    }

    // Verify customer exists in this workspace
    const customer = getCustomerById(workspaceId, parsed.data.customerId);
    if (!customer) {
      return NextResponse.json(
        { message: "Pelanggan tidak valid atau tidak ditemukan." },
        { status: 404 }
      );
    }

    const activity = createActivity(workspaceId, {
      customerId: parsed.data.customerId,
      opportunityId: parsed.data.opportunityId || null,
      type: parsed.data.type,
      title: parsed.data.title,
      body: parsed.data.body || null,
      happenedAt: parsed.data.happenedAt || undefined,
    });

    return NextResponse.json({ success: true, data: activity }, { status: 201 });
  } catch (error) {
    console.error("POST /api/activities error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server saat mencatat aktivitas." },
      { status: 500 }
    );
  }
}
