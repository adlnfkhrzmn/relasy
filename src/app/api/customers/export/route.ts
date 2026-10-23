import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { ensureDefaultAccount } from "@/lib/db/bootstrap";
import {
  getAllWorkspaceCustomers,
  getCustomers,
} from "@/lib/db/repositories/customer.repo";
import { serializeCustomersToCsv } from "@/lib/customer-csv";

export async function GET(request: Request) {
  try {
    const defaultAcc = await ensureDefaultAccount();
    const session = await getCurrentSession();
    const workspaceId = session?.workspaceId || defaultAcc.workspaceId;

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "filtered";
    const search = searchParams.get("search") || undefined;
    const filterArchived = searchParams.get("archived") === "true";

    const records =
      scope === "all"
        ? getAllWorkspaceCustomers(workspaceId)
        : getCustomers(workspaceId, { search, filterArchived });

    const csvContent = serializeCustomersToCsv(records);
    const dateStamp = new Date().toISOString().split("T")[0];
    const filename = `pelanggan-relasy-${dateStamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Gagal mengekspor data pelanggan ke file CSV." },
      { status: 500 }
    );
  }
}
