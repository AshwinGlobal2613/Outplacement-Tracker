import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCandidateById } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "client") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clientCompany = session.user.clientCompany;
  const candidate = await getCandidateById(params.id);

  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify this candidate belongs to the client's company
  if (candidate.clientName.toLowerCase().trim() !== clientCompany?.toLowerCase().trim()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Strip sensitive internal fields
  const { notes, adminNotes, invoiceStatus, costingStatus, budget, budgetCurrency, discStyle, discDone, updatedBy, ...safe } = candidate;

  return NextResponse.json(safe);
}
