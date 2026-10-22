import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { ensureDefaultAccount } from "@/lib/db/bootstrap";
import {
  getOpportunityById,
  updateOpportunity,
  updateOpportunityStage,
  deleteOpportunity,
} from "@/lib/db/repositories/opportunity.repo";
import { PIPELINE_STAGES, PipelineStage } from "@/lib/constants";

const validStages = PIPELINE_STAGES.map((s) => s.id) as [PipelineStage, ...PipelineStage[]];

const updateOpportunitySchema = z.object({
  title: z.string().min(1).max(120).optional(),
  stage: z.enum(validStages).optional(),
  estimatedValue: z.number().nonnegative().optional(),
  expectedCloseDate: z.string().optional().nullable(),
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

    const opp = getOpportunityById(workspaceId, id);
    if (!opp) {
      return NextResponse.json({ message: "Peluang tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: opp });
  } catch (error) {
    console.error("GET /api/opportunities/[id] error:", error);
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

    // If payload contains stage change only
    if (body.stage && Object.keys(body).length === 1) {
      const validStage = validStages.includes(body.stage);
      if (!validStage) {
        return NextResponse.json({ message: "Tahapan peluang tidak valid." }, { status: 400 });
      }
      const updated = updateOpportunityStage(workspaceId, id, body.stage);
      if (!updated) {
        return NextResponse.json({ message: "Peluang tidak ditemukan." }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "Tahapan berhasil diperbarui." });
    }

    const parsed = updateOpportunitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Input tidak valid." },
        { status: 400 }
      );
    }

    const updated = updateOpportunity(workspaceId, id, parsed.data);
    if (!updated) {
      return NextResponse.json({ message: "Peluang tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/opportunities/[id] error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    const deleted = deleteOpportunity(workspaceId, id);
    if (!deleted) {
      return NextResponse.json({ message: "Peluang tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Peluang berhasil dihapus." });
  } catch (error) {
    console.error("DELETE /api/opportunities/[id] error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
