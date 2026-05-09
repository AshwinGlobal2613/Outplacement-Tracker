"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Mail, ArrowLeft, Copy, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);
    setSubmitted(true);

    if (data.devMode && data.resetUrl) {
      setDevLink(data.resetUrl);
    }
  }

  async function copyLink() {
    if (!devLink) return;
    await navigator.clipboard.writeText(devLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
            {submitted ? (
              <Mail className="h-6 w-6 text-primary" />
            ) : (
              <Zap className="h-6 w-6 text-primary" />
            )}
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {submitted ? "Check your inbox" : "Reset password"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {submitted
            ? "If that email is registered, a reset link has been sent."
            : "Enter your email and we'll send you a reset link"}
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@company.com"
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card/50 px-4 py-4 text-sm text-muted-foreground">
            <p>The reset link expires in <span className="text-foreground font-medium">1 hour</span>.</p>
            <p className="mt-1">If you don&apos;t see the email, check your spam folder.</p>
          </div>

          {devLink && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Dev Mode — No SMTP Configured
              </p>
              <p className="text-xs text-muted-foreground">Share this link manually:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-black/30 px-2 py-1.5 text-xs text-amber-300 break-all">
                  {devLink}
                </code>
                <button
                  onClick={copyLink}
                  className="shrink-0 rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => { setSubmitted(false); setDevLink(null); setEmail(""); }}
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-sidebar-accent transition-colors"
          >
            Try a different email
          </button>
        </div>
      )}

      <div className="flex justify-center">
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
