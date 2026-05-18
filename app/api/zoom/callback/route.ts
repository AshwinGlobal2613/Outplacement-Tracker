import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { saveZoomTokens } from "@/lib/db";

function errorPage(error: string) {
  return new NextResponse(
    `<html><body><script>window.opener?.postMessage({type:"zoom-error",error:${JSON.stringify(error)}},"*");window.close();</script></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "outplacement-tracker-secret-key-2026" });
  if (!token?.id) return errorPage("unauthorized - no session found");

  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) return errorPage(error ?? "missing_code");

  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString("base64");

  const tokenRes = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.ZOOM_REDIRECT_URI!,
    }),
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    return errorPage(`token_exchange_failed: ${detail}`);
  }

  const { access_token, refresh_token, expires_in } = await tokenRes.json();
  const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

  await saveZoomTokens({
    userId: token.id as string,
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresAt,
  });

  return new NextResponse(
    `<html><body><script>window.opener?.postMessage({type:"zoom-connected"},"*");window.close();</script></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
