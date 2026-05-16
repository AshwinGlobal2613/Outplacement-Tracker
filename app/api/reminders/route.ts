import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCandidates } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const candidates = await getCandidates();

  const pending = candidates.filter(
    (c) =>
      c.status === "active" &&
      (c.discDone === "Not Done" ||
        c.invoiceStatus === "Not Raised" ||
        c.costingStatus === "Not Done")
  );

  if (pending.length === 0) {
    return NextResponse.json({ message: "No pending actions — no emails sent." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: `${pending.length} pending action(s) found but RESEND_API_KEY is not configured.` },
      { status: 200 }
    );
  }

  const adminEmail = session.user.email;
  if (!adminEmail) {
    return NextResponse.json({ error: "Admin email not found in session" }, { status: 400 });
  }

  const rows = pending
    .map((c) => {
      const actions = [];
      if (c.discDone === "Not Done") actions.push("DiSC not done");
      if (c.invoiceStatus === "Not Raised") actions.push("Invoice not raised");
      if (c.costingStatus === "Not Done") actions.push("Costing not done");
      return `
        <tr style="border-bottom:1px solid #333;">
          <td style="padding:8px 12px;">${c.candidateName}</td>
          <td style="padding:8px 12px;">${c.clientName}</td>
          <td style="padding:8px 12px;">${c.support || c.leadCoach}</td>
          <td style="padding:8px 12px;color:#f87171;">${actions.join(", ")}</td>
        </tr>`;
    })
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:24px;border-radius:12px;">
      <h2 style="color:#a78bfa;margin-bottom:4px;">Global Management Consultants — Pending Action Reminders</h2>
      <p style="color:#94a3b8;margin-bottom:24px;">The following active candidates have outstanding actions requiring attention:</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#1e293b;">
            <th style="padding:8px 12px;text-align:left;color:#94a3b8;">Candidate</th>
            <th style="padding:8px 12px;text-align:left;color:#94a3b8;">Client</th>
            <th style="padding:8px 12px;text-align:left;color:#94a3b8;">Support</th>
            <th style="padding:8px 12px;text-align:left;color:#94a3b8;">Pending Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:24px;font-size:12px;color:#475569;">Sent from Global Management Consultants Outplacement Tracker</p>
    </div>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `"Global Management Consultants" <team@global-dubai.com>`,
      to: adminEmail,
      subject: `${pending.length} Pending Action${pending.length !== 1 ? "s" : ""} Require Attention`,
      html,
    }),
  });

  return NextResponse.json({
    message: `Reminder sent for ${pending.length} candidate${pending.length !== 1 ? "s" : ""} with pending actions.`,
  });
}
