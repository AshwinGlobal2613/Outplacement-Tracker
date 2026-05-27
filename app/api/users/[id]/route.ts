import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { getUserById, updateUser, deleteUser } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getUserById(params.id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { password: _pw, ...safe } = user;
  return NextResponse.json(safe);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name;
  if (body.email !== undefined) updates.email = body.email;
  if (body.phone !== undefined) updates.phone = body.phone;
  if (body.role !== undefined) updates.role = body.role;
  // Sync clientCompany: set it when role is client, clear it when switching away from client
  if (body.role === "client") {
    updates.clientCompany = body.clientCompany ?? "";
    updates.candidateId = undefined;
  } else if (body.role === "candidate") {
    updates.candidateId = body.candidateId ?? "";
    updates.clientCompany = undefined;
  } else if (body.role !== undefined) {
    // Switched to admin/team_member — clear both portal fields
    updates.clientCompany = undefined;
    updates.candidateId = undefined;
  } else {
    // Role unchanged — allow updating individual fields
    if (body.clientCompany !== undefined) updates.clientCompany = body.clientCompany;
    if (body.candidateId  !== undefined) updates.candidateId  = body.candidateId;
  }
  if (body.disabled !== undefined) updates.disabled = body.disabled;

  if (body.password && body.password.length >= 8) {
    updates.password = await bcrypt.hash(body.password, 10);
  }

  let updated;
  try {
    updated = await updateUser(params.id, updates);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[updateUser]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { password: _p2, ...safe } = updated;
  return NextResponse.json(safe);
}

export async function DELETE(_req2: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (params.id === session.user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }
  const success = await deleteUser(params.id);
  if (!success) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
