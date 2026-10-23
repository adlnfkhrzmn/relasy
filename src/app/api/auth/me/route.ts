import { NextResponse } from "next/server";
import {
  getCurrentSession,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { getWorkspaceById, updateWorkspaceName } from "@/lib/db/repositories/workspace.repo";
import { getUserById, updateUser } from "@/lib/db/repositories/user.repo";
import { ensureDefaultAccount } from "@/lib/db/bootstrap";

export async function GET() {
  await ensureDefaultAccount();

  const session = await getCurrentSession();
  if (!session) {
    // Endpoint ini dipakai sebagai pemeriksa sesi ringan oleh AppShell dan
    // halaman Pengaturan. Balasan 401 membuat browser mencatat error konsol
    // pada setiap muat halaman, jadi status "belum masuk" dijawab 200.
    return NextResponse.json({ authenticated: false, user: null });
  }

  const dbUser = getUserById(session.userId);
  const workspace = getWorkspaceById(session.workspaceId);

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      name: dbUser?.name || session.name,
      email: dbUser?.email || session.email,
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

    const rawText = await request.text();
    const body = rawText.trim() ? JSON.parse(rawText) : {};

    if (typeof body.workspaceName === "string" && body.workspaceName.trim()) {
      updateWorkspaceName(session.workspaceId, body.workspaceName.trim());
    }

    if (body.name || body.email) {
      updateUser(session.userId, {
        name: typeof body.name === "string" ? body.name.trim() : undefined,
        email: typeof body.email === "string" ? body.email.trim() : undefined,
      });
    }

    const updatedUser = getUserById(session.userId);
    const updatedWs = getWorkspaceById(session.workspaceId);

    const nextName = updatedUser?.name || body.name || session.name;
    const nextEmail = updatedUser?.email || body.email || session.email;

    const response = NextResponse.json({
      success: true,
      message: "Pengaturan berhasil disimpan.",
      user: {
        id: session.userId,
        name: nextName,
        email: nextEmail,
        workspaceId: session.workspaceId,
        workspaceName: updatedWs?.name || "Usaha Saya",
      },
    });

    const newToken = createSessionToken({
      userId: session.userId,
      workspaceId: session.workspaceId,
      name: nextName,
      email: nextEmail,
    });

    response.cookies.set(SESSION_COOKIE_NAME, newToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("PATCH /api/auth/me error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui pengaturan." },
      { status: 500 }
    );
  }
}
