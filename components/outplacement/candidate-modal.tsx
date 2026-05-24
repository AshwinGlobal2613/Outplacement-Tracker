"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Candidate, Lists } from "@/lib/types";
import { CreatableSelect } from "./creatable-select";
import { MultiCreatableSelect } from "./multi-creatable-select";

interface Props {
  candidate?: Candidate;
  isAdmin?: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function calcEndDate(dateStarted: string, duration: string): string {
  if (!dateStarted || !duration) return "";
  const match = duration.match(/^(\d+)\s*month/i);
  if (!match) return "";
  const months = parseInt(match[1]);
  const d = new Date(dateStarted);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

const STATUS_OPTIONS = [
  { value: "referred", label: "Referred" },
  { value: "active", label: "Active" },
  { value: "candidate_reached", label: "Candidate Reached" },
  { value: "completed", label: "Completed" },
  { value: "declined", label: "Declined" },
];

const SUPPORT_LEVELS = ["Low", "Low-Mid", "Mid", "Mid-High", "High"];

export function CandidateModal({ candidate, isAdmin = false, onClose, onSaved }: Props) {
  const isEdit = !!candidate;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lists, setLists] = useState<Lists>({ partners: [], clients: [], coaches: [], supports: [] });

  const [form, setForm] = useState({
    candidateName: candidate?.candidateName ?? "",
    email: candidate?.email ?? "",
    whatsapp: candidate?.whatsapp ?? "",
    linkedin: candidate?.linkedin ?? "",
    partner: candidate?.partner ?? "",
    clientName: candidate?.clientName ?? "",
    levelOfSupport: candidate?.levelOfSupport ?? "Low",
    leadCoach: candidate?.leadCoach ?? "",
    support: candidate?.support ?? "",
    duration: candidate?.duration ?? "",
    dateStarted: candidate?.dateStarted ?? "",
    endDate: candidate?.endDate ?? "",
    sessionsCompleted: candidate?.sessionsCompleted ?? 0,
    notes: candidate?.notes ?? "",
    budget: candidate?.budget ?? null as number | null,
    budgetCurrency: candidate?.budgetCurrency ?? "AED",
    status: candidate?.status ?? "referred",
    discStyle: candidate?.discStyle ?? "",
    oldPlacement: candidate?.oldPlacement ?? "",
    newPlacement: candidate?.newPlacement ?? "",
    position: candidate?.position ?? "",
    sector: candidate?.sector ?? "",
    progress: candidate?.progress ?? {
      introductorySession: false,
      cvSessions: false,
      linkedinProfile: false,
      profiling: false,
      networkingPersonalBranding: false,
    },
  });

  useEffect(() => {
    fetch("/api/lists").then((r) => r.json()).then(setLists);
  }, []);

  useEffect(() => {
    if (form.dateStarted && form.duration) {
      const computed = calcEndDate(form.dateStarted, form.duration);
      if (computed) setForm((prev) => ({ ...prev, endDate: computed }));
    }
  }, [form.dateStarted, form.duration]);

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setProgress(field: string, value: boolean) {
    setForm((prev) => ({ ...prev, progress: { ...prev.progress, [field]: value } }));
  }

  function refreshLists() {
    fetch("/api/lists").then((r) => r.json()).then(setLists);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const url = isEdit ? `/api/candidates/${candidate!.id}` : "/api/candidates";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) setError("Failed to save. Please try again.");
    else onSaved();
  }

  const showCompletedFields = isEdit && form.status === "completed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Edit Candidate" : "Add Candidate"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-2 text-sm text-destructive">{error}</div>
          )}

          {/* Name + contact */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Candidate Name *">
              <input value={form.candidateName} onChange={(e) => set("candidateName", e.target.value)} placeholder="Full name" className={inputCls} />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@example.com" className={inputCls} />
            </Field>
            <Field label="WhatsApp">
              <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+971 50 000 0000" className={inputCls} />
            </Field>
            <Field label="LinkedIn URL">
              <input value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/…" className={inputCls} />
            </Field>
          </div>

          {/* Partner + Client — creatable dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Partner">
              <CreatableSelect
                value={form.partner}
                listKey="partners"
                options={lists.partners}
                placeholder="Challenger Grey, Intoo US…"
                canCreate={true}
                onChange={(v) => set("partner", v)}
                onNewOption={refreshLists}
              />
            </Field>
            <Field label="Client Name">
              <CreatableSelect
                value={form.clientName}
                listKey="clients"
                options={lists.clients}
                placeholder="Epic Games, Sprinklr…"
                canCreate={true}
                onChange={(v) => set("clientName", v)}
                onNewOption={refreshLists}
              />
            </Field>
          </div>

          {/* Coach + Support — creatable dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Lead Coach">
              <MultiCreatableSelect
                value={form.leadCoach}
                listKey="coaches"
                options={lists.coaches}
                placeholder="Select coaches…"
                canCreate={true}
                canDelete={true}
                onChange={(v) => set("leadCoach", v)}
                onNewOption={refreshLists}
                onOptionDeleted={refreshLists}
              />
            </Field>
            <Field label="Support">
              <MultiCreatableSelect
                value={form.support}
                listKey="supports"
                options={lists.supports}
                placeholder="Select support…"
                canCreate={true}
                canDelete={true}
                onChange={(v) => set("support", v)}
                onNewOption={refreshLists}
                onOptionDeleted={refreshLists}
              />
            </Field>
          </div>

          {/* Status + Level */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Level of Support">
              <select value={form.levelOfSupport} onChange={(e) => set("levelOfSupport", e.target.value)} className={inputCls}>
                {SUPPORT_LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
          </div>

          {/* Duration + Dates */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Duration">
              <input
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="e.g. 3 Months"
                className={inputCls}
              />
            </Field>
            <Field label="Date Started">
              <input type="date" value={form.dateStarted ?? ""} onChange={(e) => set("dateStarted", e.target.value || null)} className={inputCls} />
            </Field>
            <Field label="End Date (auto-calc)">
              <input type="date" value={form.endDate ?? ""} onChange={(e) => set("endDate", e.target.value || null)} className={inputCls} />
            </Field>
          </div>

          {/* Budget — admin only */}
          {isAdmin && (
            <Field label="Programme Budget">
              <div className="flex gap-2">
                <select
                  value={form.budgetCurrency}
                  onChange={(e) => set("budgetCurrency", e.target.value)}
                  className="w-28 shrink-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {["AED","USD","GBP","EUR","SAR","QAR","KWD","BHD","OMR","EGP","INR","PKR"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  value={form.budget ?? ""}
                  onChange={(e) => set("budget", e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g. 25000"
                  className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </Field>
          )}

          {/* Notes — optional */}
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder="Session notes, follow-ups, reminders…"
              className={inputCls + " resize-none"}
            />
          </Field>

          {/* Edit-only: Sessions completed */}
          {isEdit && (
            <Field label="Sessions Completed">
              <input
                type="number"
                min="0"
                value={form.sessionsCompleted}
                onChange={(e) => set("sessionsCompleted", parseInt(e.target.value) || 0)}
                className={inputCls + " w-28"}
              />
            </Field>
          )}

          {/* Edit-only: DiSC + Program Progress */}
          {isEdit && (
            <>
              <Field label="DiSC Style">
                <input value={form.discStyle} onChange={(e) => set("discStyle", e.target.value)} placeholder="iD, iS, SC…" className={inputCls} />
              </Field>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Program Progress</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {([
                    ["introductorySession", "Introductory Session"],
                    ["cvSessions", "CV Sessions"],
                    ["linkedinProfile", "LinkedIn & Profile"],
                    ["profiling", "Profiling (DiSC)"],
                    ["networkingPersonalBranding", "Networking & Personal Branding"],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 hover:bg-sidebar-accent">
                      <input
                        type="checkbox"
                        checked={form.progress[key]}
                        onChange={(e) => setProgress(key, e.target.checked)}
                        className="h-4 w-4 rounded border-border accent-primary"
                      />
                      <span className="text-sm text-foreground">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Completed-only: placement fields */}
          {showCompletedFields && (
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <p className="col-span-2 text-xs font-semibold uppercase tracking-wider text-blue-400">Placement Details</p>
              <Field label="Old Placement">
                <input value={form.oldPlacement} onChange={(e) => set("oldPlacement", e.target.value)} placeholder="Previous company" className={inputCls} />
              </Field>
              <Field label="New Placement / Target">
                <input value={form.newPlacement} onChange={(e) => set("newPlacement", e.target.value)} placeholder="New company" className={inputCls} />
              </Field>
              <Field label="Position / Title">
                <input value={form.position} onChange={(e) => set("position", e.target.value)} placeholder="Job title" className={inputCls} />
              </Field>
              <Field label="Sector">
                <input value={form.sector} onChange={(e) => set("sector", e.target.value)} placeholder="Industry sector" className={inputCls} />
              </Field>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.candidateName || saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Candidate"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
