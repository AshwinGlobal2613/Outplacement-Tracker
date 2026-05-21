import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { getResources, createResource } from "@/lib/db";

export async function GET() {
  try {
    const resources = await getResources();
    return NextResponse.json(resources);
  } catch (err) {
    console.error("GET /api/resources error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("POST /api/resources error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
