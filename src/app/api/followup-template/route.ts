import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { ensureDefaultAccount } from "@/lib/db/bootstrap";
import {
  getFollowupTemplateConfig,
  updateFollowupTemplateConfig,
} from "@/lib/db/repositories/followup-template.repo";
import { FOLLOWUP_TEMPLATE_PRESETS } from "@/lib/followup-template";

const updateTemplateSchema = z.object({
  isEnabled: z.boolean().optional(),
  activePreset: z.string().max(60).optional(),
  templateText: z.string().max(1500).optional(),
});

export async function GET() {
  try {
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    const config = await getFollowupTemplateConfig(workspaceId);

    return NextResponse.json({
      success: true,
      data: config,
      presets: FOLLOWUP_TEMPLATE_PRESETS,
    });
  } catch (error) {
    console.error("GET /api/followup-template error:", error);
    return NextResponse.json(
      { message: "Gagal memuat pengaturan template follow-up." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    // Body kosong atau JSON rusak harus dijawab 400, bukan 200 tanpa perubahan.
    // Skema template seluruhnya opsional, jadi body yang gagal diurai perlu
    // ditolak lebih dulu agar permintaan cacat tidak dianggap berhasil.
    const rawBody = await request.text();
    let body: unknown = {};
    if (rawBody.trim()) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        return NextResponse.json(
          { message: "Format pengaturan template tidak valid." },
          { status: 400 }
        );
      }
    }
    const parsed = updateTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Format pengaturan template tidak valid." },
        { status: 400 }
      );
    }

    const updated = await updateFollowupTemplateConfig(workspaceId, {
      isEnabled: parsed.data.isEnabled,
      activePreset: parsed.data.activePreset,
      templateText: parsed.data.templateText,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      presets: FOLLOWUP_TEMPLATE_PRESETS,
    });
  } catch (error) {
    console.error("PUT /api/followup-template error:", error);
    return NextResponse.json(
      { message: "Gagal menyimpan pengaturan template follow-up." },
      { status: 500 }
    );
  }
}
