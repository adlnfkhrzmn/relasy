import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { ensureDefaultAccount } from "@/lib/db/bootstrap";
import { getDashboardMetrics } from "@/lib/db/repositories/dashboard.repo";
import { getFollowups } from "@/lib/db/repositories/followup.repo";
import { getActivities } from "@/lib/db/repositories/activity.repo";

export async function GET(request: Request) {
  try {
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    const { searchParams } = new URL(request.url);
    const referenceDate = searchParams.get("refDate") || undefined;

    // 1. Fetch aggregate metrics
    const metrics = getDashboardMetrics(workspaceId, referenceDate);

    // 2. Fetch today's pending follow-ups (up to 5 items)
    const todayFollowups = getFollowups(workspaceId, {
      tab: "today",
      referenceDate,
    }).slice(0, 5);

    // 3. Fetch recent customer activities (up to 5 items)
    const recentActivities = getActivities(workspaceId, { limit: 5 });

    return NextResponse.json({
      success: true,
      metrics,
      tasksToday: todayFollowups,
      recentActivities,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memuat ringkasan dashboard." },
      { status: 500 }
    );
  }
}
