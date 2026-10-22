import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getWorkspaceById, updateWorkspaceName } from "@/lib/db/repositories/workspace.repo";
import { updateUser } from "@/lib/db/repositories/user.repo";
import { ensureDefaultAccount } from "@/lib/db/bootstrap";

export async function GET() {
  await ensureDefaultAccount();

  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const workspace = getWorkspaceById(session.workspaceId);

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      name: session.name,
      email: session.email,
      workspaceId: session.workspaceId,
      workspaceName: workspace?.name || "Usaha Saya",
    },
  });
}

export async function PATCH(request: Request) {
  try {
    await ensureDefaultAccount();
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ message: "Sesi tidak sah." }, { status: 401 });
    }

    const body = await request.json();

    if (body.workspaceName) {
      updateWorkspaceName(session.workspaceId, body.workspaceName.trim());
    }

    if (body.name || body.email) {
      updateUser(session.userId, {
        name: body.name,
        email: body.email,
      });
    }

    const updatedWs = getWorkspaceById(session.workspaceId);

    return NextResponse.json({
      success: true,
      message: "Pengaturan berhasil disimpan.",
      user: {
        id: session.userId,
        name: body.name || session.name,
        email: body.email || session.email,
        workspaceId: session.workspaceId,
        workspaceName: updatedWs?.name || "Usaha Saya",
      },
    });
  } catch (error) {
    console.error("PATCH /api/auth/me error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui pengaturan." },
      { status: 500 }
    );
  }
}
