"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Plus,
  Pencil,
  ShieldCheck,
  ShieldOff,
  UserX,
  UserCheck,
  Trash2,
  X,
  Eye,
  EyeOff,
  Check,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "team_member";
  disabled: boolean;
  createdAt: string;
};

type SortKey = "name" | "email" | "role" | "createdAt";
type SortDir = "asc" | "desc";

/* ─── Modal ─────────────────────────────────────────────────── */
type ModalUser = Partial<User> & { password?: string };

function UserModal({
  user,
  onClose,
  onSaved,
}: {
  user: ModalUser | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !user?.id;
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [role, setRole] = useState<"admin" | "team_member">(user?.role ?? "team_member");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setError("");
    if (!name.trim() || !email.trim()) { setError("Name and email are required."); return; }
    if (isNew && (!password || password.length < 8)) { setError("Password must be at least 8 characters."); return; }
    if (!isNew && password && password.length < 8) { setError("New password must be at least 8 characters."); return; }

    setLoading(true);
    const body: Record<string, unknown> = { name, email, phone, role };
    if (password) body.password = password;

    const url = isNew ? "/api/users" : `/api/users/${user!.id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to save user.");
    } else {
      onSaved();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {isNew ? "Add New Member" : "Edit Member"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Full Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Saima Khan"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Phone <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+971 50 000 0000"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "team_member")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="team_member">Team Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {isNew ? "Password *" : "New Password"}
              {!isNew && <span className="text-xs font-normal text-muted-foreground ml-1">(leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isNew ? "Min. 8 characters" : "Leave blank to keep current"}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? "Saving…" : isNew ? "Add Member" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "team_member">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [editUser, setEditUser] = useState<ModalUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && session?.user?.role !== "admin") { router.push("/outplacement"); return; }
    if (status === "authenticated") loadUsers();
  }, [status, session]);

  async function loadUsers() {
    setLoadingUsers(true);
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setLoadingUsers(false);
  }

  async function toggleDisabled(user: User) {
    setActionLoading(user.id + "-disable");
    await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabled: !user.disabled }),
    });
    setActionLoading(null);
    loadUsers();
  }

  async function permanentlyDelete(userId: string) {
    setActionLoading(userId + "-delete");
    await fetch(`/api/users/${userId}`, { method: "DELETE" });
    setActionLoading(null);
    setConfirmDeleteId(null);
    loadUsers();
  }

  async function toggleRole(user: User) {
    setActionLoading(user.id + "-role");
    await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: user.role === "admin" ? "team_member" : "admin" }),
    });
    setActionLoading(null);
    loadUsers();
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const filtered = useMemo(() => {
    let list = [...users];
    if (search) list = list.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    if (statusFilter === "active") list = list.filter((u) => !u.disabled);
    if (statusFilter === "disabled") list = list.filter((u) => u.disabled);
    list.sort((a, b) => {
      const av = (a[sortKey] ?? "") as string;
      const bv = (b[sortKey] ?? "") as string;
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [users, search, roleFilter, statusFilter, sortKey, sortDir]);

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="h-3 w-3 opacity-20" />;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />;
  }

  if (status === "loading" || loadingUsers) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading users…</div>
      </div>
    );
  }

  const adminCount = users.filter((u) => u.role === "admin").length;
  const activeCount = users.filter((u) => !u.disabled).length;
  const disabledCount = users.filter((u) => u.disabled).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage team members, roles, and account access
          </p>
        </div>
        <button
          onClick={() => { setEditUser({}); setModalOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Members", value: users.length, color: "text-primary" },
          { label: "Admins", value: adminCount, color: "text-violet-400" },
          { label: "Active", value: activeCount, color: "text-emerald-400" },
          { label: "Disabled", value: disabledCount, color: "text-rose-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="team_member">Team Member</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-sidebar">
                {([
                  { key: "name", label: "Member" },
                  { key: "email", label: "Email" },
                  { key: "role", label: "Role" },
                  { key: "createdAt", label: "Joined" },
                ] as { key: SortKey; label: string }[]).map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon k={col.key} />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No members found
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                  const isCurrentUser = user.id === session?.user?.id;
                  return (
                    <tr key={user.id} onMouseLeave={() => setConfirmDeleteId(null)} className={`hover:bg-sidebar-accent/40 transition-colors ${user.disabled ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            {user.phone && (
                              <p className="text-xs text-muted-foreground">{user.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-violet-500/15 text-violet-400"
                            : "bg-primary/10 text-primary"
                        }`}>
                          {user.role === "admin" ? <ShieldCheck className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                          {user.role === "admin" ? "Admin" : "Team Member"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(user.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.disabled
                            ? "bg-rose-500/15 text-rose-400"
                            : "bg-emerald-500/15 text-emerald-400"
                        }`}>
                          {user.disabled ? <UserX className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                          {user.disabled ? "Disabled" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit */}
                          <button
                            onClick={() => { setEditUser(user); setModalOpen(true); }}
                            title="Edit member"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {/* Toggle role — not self */}
                          {!isCurrentUser && (
                            <button
                              onClick={() => toggleRole(user)}
                              disabled={actionLoading === user.id + "-role"}
                              title={user.role === "admin" ? "Revoke admin" : "Grant admin"}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-violet-400 transition-colors disabled:opacity-40"
                            >
                              {user.role === "admin"
                                ? <ShieldOff className="h-3.5 w-3.5" />
                                : <ShieldCheck className="h-3.5 w-3.5" />
                              }
                            </button>
                          )}
                          {/* Toggle disabled — not self */}
                          {!isCurrentUser && (
                            <button
                              onClick={() => toggleDisabled(user)}
                              disabled={actionLoading === user.id + "-disable"}
                              title={user.disabled ? "Activate account" : "Disable account"}
                              className={`rounded-md p-1.5 text-muted-foreground transition-colors disabled:opacity-40 ${
                                user.disabled
                                  ? "hover:bg-emerald-500/15 hover:text-emerald-400"
                                  : "hover:bg-rose-500/15 hover:text-rose-400"
                              }`}
                            >
                              {user.disabled
                                ? <UserCheck className="h-3.5 w-3.5" />
                                : <UserX className="h-3.5 w-3.5" />
                              }
                            </button>
                          )}
                          {/* Permanent delete — only for disabled accounts */}
                          {!isCurrentUser && user.disabled && (
                            confirmDeleteId === user.id ? (
                              <button
                                onClick={() => permanentlyDelete(user.id)}
                                disabled={actionLoading === user.id + "-delete"}
                                title="Confirm permanent delete"
                                className="rounded-md px-2 py-1 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-40"
                              >
                                {actionLoading === user.id + "-delete" ? "…" : "Confirm"}
                              </button>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(user.id)}
                                title="Permanently delete user"
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-rose-500/15 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )
                          )}
                          {isCurrentUser && (
                            <span className="text-xs text-muted-foreground/50 px-1">(you)</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Showing {filtered.length} of {users.length} members
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <UserModal
          user={editUser}
          onClose={() => { setModalOpen(false); setEditUser(null); }}
          onSaved={loadUsers}
        />
      )}
    </div>
  );
}
