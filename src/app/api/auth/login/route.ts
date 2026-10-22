import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserByEmail } from "@/lib/db/repositories/user.repo";
import { getWorkspaceById } from "@/lib/db/repositories/workspace.repo";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { ensureDefaultAccount } from "@/lib/db/bootstrap";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

export async function POST(request: Request) {
  try {
    // Ensure default demo account exists if database is fresh
    await ensureDefaultAccount();

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Input tidak valid." },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { message: "Email atau kata sandi tidak cocok. Silakan coba lagi." },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Email atau kata sandi tidak cocok. Silakan coba lagi." },
        { status: 401 }
      );
    }

    const workspace = getWorkspaceById(user.workspace_id);
    const workspaceName = workspace?.name || "Usaha Saya";

    const token = createSessionToken({
      userId: user.id,
      workspaceId: user.workspace_id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workspaceId: user.workspace_id,
        workspaceName,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server saat memproses login." },
      { status: 500 }
    );
  }
}
