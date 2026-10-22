import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { ensureDefaultAccount } from "@/lib/db/bootstrap";
import {
  createOpportunity,
  getOpportunities,
} from "@/lib/db/repositories/opportunity.repo";
import { getCustomerById } from "@/lib/db/repositories/customer.repo";
import { PIPELINE_STAGES, PipelineStage } from "@/lib/constants";

const validStages = PIPELINE_STAGES.map((s) => s.id) as [PipelineStage, ...PipelineStage[]];

const createOpportunitySchema = z.object({
  customerId: z.string().min(1, "Pelanggan terkait wajib dipilih."),
  title: z.string().min(1, "Judul peluang wajib diisi.").max(120, "Judul terlalu panjang."),
  stage: z.enum(validStages).optional(),
  estimatedValue: z.number().nonnegative("Nilai estimasi tidak boleh negatif.").optional(),
  expectedCloseDate: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId") || undefined;
    const stage = (searchParams.get("stage") as PipelineStage) || undefined;

    const opportunities = getOpportunities(workspaceId, { customerId, stage });
    return NextResponse.json({ success: true, data: opportunities });
  } catch (error) {
    console.error("GET /api/opportunities error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memuat peluang penjualan." },
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
    const parsed = createOpportunitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Data peluang tidak valid." },
        { status: 400 }
      );
    }

    // Verify customer belongs to this workspace
    const customer = getCustomerById(workspaceId, parsed.data.customerId);
    if (!customer) {
      return NextResponse.json(
        { message: "Pelanggan yang dipilih tidak valid atau tidak ditemukan." },
        { status: 404 }
      );
    }

    const opportunity = createOpportunity(workspaceId, {
      customerId: parsed.data.customerId,
      title: parsed.data.title,
      stage: parsed.data.stage || "baru",
      estimatedValue: parsed.data.estimatedValue || 0,
      expectedCloseDate: parsed.data.expectedCloseDate || null,
    });

    return NextResponse.json({ success: true, data: opportunity }, { status: 201 });
  } catch (error) {
    console.error("POST /api/opportunities error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server saat membuat peluang." },
      { status: 500 }
    );
  }
}
