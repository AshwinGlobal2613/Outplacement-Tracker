import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { getCompanies, createCompany, addActivityLog } from "@/lib/db";
import { Company } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getCompanies());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const company: Company = { id: `comp_${uuidv4().slice(0, 8)}`, ...body };
  await createCompany(company);
  await addActivityLog({
    id: `log_${uuidv4().slice(0, 8)}`,
    userId: session.user.id,
    userName: session.user.name || "Unknown",
    action: "created",
    entityType: "company",
    entityId: company.id,
    entityName: company.companyName,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(company, { status: 201 });
}
