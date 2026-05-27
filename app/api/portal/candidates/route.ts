import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCandidates } from "@/lib/db";
import { Candidate } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "client") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clientCompany = session.user.clientCompany;
  if (!clientCompany) return NextResponse.json({ error: "No client company assigned" }, { status: 400 });

  const all = await getCandidates();
  const candidates = all.filter(
    (c) => c.clientName.toLowerCase().trim() === clientCompany.toLowerCase().trim()
  );

  // Strip sensitive internal fields before returning to client
  const safe = candidates.map(({ notes, adminNotes, invoiceStatus, costingStatus, budget, budgetCurrency, discStyle, discDone, updatedBy, ...rest }: Candidate) => rest);

  return NextResponse.json(safe);
}
