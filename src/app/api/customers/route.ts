import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { ensureDefaultAccount } from "@/lib/db/bootstrap";
import {
  createCustomer,
  getCustomers,
} from "@/lib/db/repositories/customer.repo";

const createCustomerSchema = z.object({
  name: z.string().min(1, "Nama lengkap wajib diisi.").max(120, "Nama terlalu panjang."),
  phone: z.string().max(30, "Nomor telepon terlalu panjang.").optional().nullable(),
  email: z.string().email("Format email tidak valid.").optional().nullable().or(z.literal("")),
  company: z.string().max(120, "Nama perusahaan terlalu panjang.").optional().nullable(),
  source: z.string().max(80, "Sumber pelanggan terlalu panjang.").optional().nullable(),
  notes: z.string().max(2000, "Catatan maksimal 2000 karakter.").optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const filterArchived = searchParams.get("archived") === "true";

    const customers = getCustomers(workspaceId, { search, filterArchived });
    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memuat daftar pelanggan." },
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
    const parsed = createCustomerSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { message: issue?.message || "Data pelanggan tidak valid." },
        { status: 400 }
      );
    }

    const customer = createCustomer(workspaceId, {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      company: parsed.data.company || null,
      source: parsed.data.source || null,
      notes: parsed.data.notes || null,
    });

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server saat menambahkan pelanggan." },
      { status: 500 }
    );
  }
}
