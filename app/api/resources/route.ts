import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { getResources, createResource } from "@/lib/db";

export async function GET() {
  const resources = await getResources();
  return NextResponse.json(resources);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const now = new Date().toISOString();
  const resource = await createResource({
    id: uuidv4(),
    title: body.title,
    description: body.description ?? "",
    category: body.category,
    content: body.content ?? "",
    type: body.type,
    createdBy: session.user.id,
    createdByName: session.user.name ?? session.user.email ?? "Unknown",
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json(resource);
}
