import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No GEMINI_API_KEY set" });

  const results: Record<string, string> = {};

  // List available models
  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const listJson = await listRes.json();
    const models = (listJson.models ?? []) as Array<{ name: string; supportedGenerationMethods?: string[] }>;
    const generateModels = models
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => m.name);
    results["availableModels"] = generateModels.join(", ") || "none found";
    results["listStatus"] = String(listRes.status);
  } catch (e) {
    results["listError"] = String(e);
  }

  // Quick test with gemini-2.0-flash
  try {
    const testRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Say hello" }] }] }),
      }
    );
    results["gemini-2.0-flash"] = `${testRes.status} ${testRes.statusText}`;
  } catch (e) {
    results["gemini-2.0-flash"] = `error: ${e}`;
  }

  return NextResponse.json(results);
}
