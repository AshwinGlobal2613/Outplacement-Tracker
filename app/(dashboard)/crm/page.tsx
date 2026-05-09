"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, X, DollarSign, Briefcase, TrendingUp, Award } from "lucide-react";

type Stage = "Lead" | "Qualified" | "Proposal" | "Negotiation" | "Closed Won";
type Priority = "High" | "Medium" | "Low";

interface Deal {
  id: string;
  company: string;
  contact: string;
  value: number;
  daysInStage: number;
  priority: Priority;
  stage: Stage;
}

const stages: Stage[] = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won"];

const stageColors: Record<Stage, string> = {
  Lead: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  Qualified: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  Proposal: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Negotiation: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Closed Won": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const stageHeaderColors: Record<Stage, string> = {
  Lead: "border-t-zinc-500",
  Qualified: "border-t-sky-500",
  Proposal: "border-t-violet-500",
  Negotiation: "border-t-amber-500",
  "Closed Won": "border-t-emerald-500",
};

const priorityColors: Record<Priority, string> = {
  High: "bg-red-500/20 text-red-400",
  Medium: "bg-yellow-500/20 text-yellow-400",
  Low: "bg-blue-500/20 text-blue-400",
};

const initialDeals: Deal[] = [
  { id: "1", company: "Acme Corp", contact: "Sarah Johnson", value: 18000, daysInStage: 3, priority: "High", stage: "Lead" },
  { id: "2", company: "BlueSky Media", contact: "Tom Richards", value: 9500, daysInStage: 7, priority: "Medium", stage: "Lead" },
  { id: "3", company: "Vertex Labs", contact: "Priya Patel", value: 32000, daysInStage: 5, priority: "High", stage: "Qualified" },
  { id: "4", company: "NovaTech Inc", contact: "James Wu", value: 14500, daysInStage: 2, priority: "Medium", stage: "Qualified" },
  { id: "5", company: "TechStart Inc", contact: "Emily Chen", value: 25000, daysInStage: 12, priority: "High", stage: "Proposal" },
  { id: "6", company: "Cascade Digital", contact: "Marcus Lee", value: 8800, daysInStage: 4, priority: "Low", stage: "Proposal" },
  { id: "7", company: "Pinnacle Group", contact: "Rachel Moore", value: 42000, daysInStage: 9, priority: "High", stage: "Negotiation" },
  { id: "8", company: "Orbit Systems", contact: "David Kim", value: 19500, daysInStage: 6, priority: "Medium", stage: "Negotiation" },
  { id: "9", company: "Summit Solutions", contact: "Lisa Park", value: 55000, daysInStage: 1, priority: "High", stage: "Closed Won" },
  { id: "10", company: "Echo Analytics", contact: "Chris Taylor", value: 28000, daysInStage: 3, priority: "Medium", stage: "Closed Won" },
  { id: "11", company: "FlowState Agency", contact: "Anna Martinez", value: 12000, daysInStage: 15, priority: "Low", stage: "Lead" },
];

interface NewDealForm {
  company: string;
  contact: string;
  value: string;
  stage: Stage;
  priority: Priority;
}

const emptyForm: NewDealForm = {
  company: "",
  contact: "",
  value: "",
  stage: "Lead",
  priority: "Medium",
};

function formatCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n}`;
}

export default function CRMPage() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [showModal, setShowModal] = useState(false);
  const [newDeal, setNewDeal] = useState<NewDealForm>(emptyForm);

  const totalPipeline = deals.filter(d => d.stage !== "Closed Won").reduce((s, d) => s + d.value, 0);
  const totalDeals = deals.length;
  const closedWon = deals.filter(d => d.stage === "Closed Won").length;
  const winRate = totalDeals > 0 ? Math.round((closedWon / totalDeals) * 100) : 0;
  const avgDealSize = totalDeals > 0 ? Math.round(deals.reduce((s, d) => s + d.value, 0) / totalDeals) : 0;

  const dealsByStage = (stage: Stage) => deals.filter(d => d.stage === stage);
  const stageTotal = (stage: Stage) => dealsByStage(stage).reduce((s, d) => s + d.value, 0);

  const handleAddDeal = () => {
    if (!newDeal.company || !newDeal.contact) return;
    const deal: Deal = {
      id: Date.now().toString(),
      company: newDeal.company,
      contact: newDeal.contact,
      value: parseFloat(newDeal.value) || 0,
      daysInStage: 0,
      priority: newDeal.priority,
      stage: newDeal.stage,
    };
    setDeals(p => [...p, deal]);
    setNewDeal(emptyForm);
    setShowModal(false);
  };

  const inputClass = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const selectClass = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="flex flex-col">
      <PageHeader
        title="CRM Pipeline"
        description="Manage your deals from first touch to closed won."
      >
        <Button className="gap-2" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Add Deal
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-6 p-6">
        {/* Top Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Pipeline", value: `$${(totalPipeline / 1000).toFixed(0)}k`, icon: TrendingUp, color: "text-violet-400" },
            { label: "Total Deals", value: totalDeals.toString(), icon: Briefcase, color: "text-sky-400" },
            { label: "Win Rate", value: `${winRate}%`, icon: Award, color: "text-emerald-400" },
            { label: "Avg Deal Size", value: `$${(avgDealSize / 1000).toFixed(1)}k`, icon: DollarSign, color: "text-amber-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card">
                <Icon className={cn("h-5 w-5", color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {stages.map((stage) => {
              const stageDeals = dealsByStage(stage);
              const total = stageTotal(stage);
              return (
                <div key={stage} className="flex w-72 flex-shrink-0 flex-col">
                  {/* Column Header */}
                  <div className={cn("mb-3 rounded-lg border border-border bg-card p-3 border-t-2", stageHeaderColors[stage])}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{stage}</span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {stageDeals.length}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatCurrency(total)} total
                    </p>
                  </div>

                  {/* Deal Cards */}
                  <div className="flex flex-col gap-3">
                    {stageDeals.map((deal) => (
                      <Card key={deal.id} className="cursor-default hover:border-primary/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-foreground leading-tight">{deal.company}</p>
                            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", priorityColors[deal.priority])}>
                              {deal.priority}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{deal.contact}</p>
                          <div className="mt-3 flex items-end justify-between">
                            <p className="text-lg font-bold text-emerald-400">{formatCurrency(deal.value)}</p>
                            <p className="text-xs text-muted-foreground">{deal.daysInStage}d in stage</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
                        <p className="text-xs text-muted-foreground">No deals in this stage</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base">Add New Deal</CardTitle>
              <button
                onClick={() => { setShowModal(false); setNewDeal(emptyForm); }}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Company Name</label>
                <input className={inputClass} placeholder="e.g. Acme Corp" value={newDeal.company} onChange={(e) => setNewDeal(p => ({ ...p, company: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Contact Name</label>
                <input className={inputClass} placeholder="e.g. John Smith" value={newDeal.contact} onChange={(e) => setNewDeal(p => ({ ...p, contact: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Deal Value ($)</label>
                <input type="number" className={inputClass} placeholder="e.g. 15000" value={newDeal.value} onChange={(e) => setNewDeal(p => ({ ...p, value: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Stage</label>
                  <select className={selectClass} value={newDeal.stage} onChange={(e) => setNewDeal(p => ({ ...p, stage: e.target.value as Stage }))}>
                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <select className={selectClass} value={newDeal.priority} onChange={(e) => setNewDeal(p => ({ ...p, priority: e.target.value as Priority }))}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setShowModal(false); setNewDeal(emptyForm); }}>
                  Cancel
                </Button>
                <Button className="flex-1" disabled={!newDeal.company || !newDeal.contact} onClick={handleAddDeal}>
                  Add Deal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
