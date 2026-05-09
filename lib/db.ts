import { supabase } from "./supabase";
import {
  Candidate,
  User,
  Transition,
  Company,
  Headhunter,
  Notification,
  ActivityLog,
  Lists,
  PasswordResetToken,
} from "./types";

// ─── Mappers: DB row (snake_case) → TypeScript type (camelCase) ───────────────

function toUser(r: Record<string, unknown>): User {
  return {
    id: r.id as string,
    name: r.name as string,
    email: r.email as string,
    phone: (r.phone as string) ?? "",
    password: r.password as string,
    role: r.role as User["role"],
    disabled: r.disabled as boolean,
    createdAt: r.created_at as string,
    lastLoginAt: (r.last_login_at as string) ?? undefined,
  };
}

function toCandidate(r: Record<string, unknown>): Candidate {
  return {
    id: r.id as string,
    status: r.status as Candidate["status"],
    partner: (r.partner as string) ?? "",
    clientName: (r.client_name as string) ?? "",
    candidateName: (r.candidate_name as string) ?? "",
    levelOfSupport: r.level_of_support as Candidate["levelOfSupport"],
    leadCoach: (r.lead_coach as string) ?? "",
    support: (r.support as string) ?? "",
    email: (r.email as string) ?? "",
    whatsapp: (r.whatsapp as string) ?? "",
    linkedin: (r.linkedin as string) ?? "",
    duration: (r.duration as string) ?? "",
    dateStarted: (r.date_started as string) ?? null,
    endDate: (r.end_date as string) ?? null,
    sessionsCompleted: (r.sessions_completed as number) ?? 0,
    notes: (r.notes as string) ?? "",
    discStyle: (r.disc_style as string) ?? "",
    jobStatus: (r.job_status as string) ?? null,
    newCompany: (r.new_company as string) ?? null,
    newPlacement: (r.new_placement as string) ?? null,
    position: (r.position as string) ?? null,
    sector: (r.sector as string) ?? null,
    oldPlacement: (r.old_placement as string) ?? null,
    progress: (r.progress as Candidate["progress"]) ?? {
      introductorySession: false,
      cvSessions: false,
      linkedinProfile: false,
      profiling: false,
      networkingPersonalBranding: false,
    },
    activities: (r.activities as Candidate["activities"]) ?? [],
    discDone: (r.disc_done as Candidate["discDone"]) ?? "Not Done",
    invoiceStatus: (r.invoice_status as Candidate["invoiceStatus"]) ?? "Not Raised",
    costingStatus: (r.costing_status as Candidate["costingStatus"]) ?? "Not Done",
    createdAt: r.created_at as string,
    updatedAt: (r.updated_at as string) ?? new Date().toISOString(),
    updatedBy: (r.updated_by as string) ?? null,
  };
}

function toTransition(r: Record<string, unknown>): Transition {
  return {
    id: r.id as string,
    year: (r.year as string) ?? "",
    candidateName: (r.candidate_name as string) ?? "",
    clientName: (r.client_name as string) ?? "",
    leadOwner: (r.lead_owner as string) ?? "",
    consultantInCharge: (r.consultant_in_charge as string) ?? "",
    supports: (r.supports as string) ?? "",
    oldJob: (r.old_job as string) ?? "",
    newPlacement: (r.new_placement as string) ?? "",
    newJobTitle: (r.new_job_title as string) ?? "",
    email: (r.email as string) ?? "",
    phone: (r.phone as string) ?? "",
  };
}

function toCompany(r: Record<string, unknown>): Company {
  return {
    id: r.id as string,
    companyName: (r.company_name as string) ?? "",
    industry: (r.industry as string) ?? "",
    website: (r.website as string) ?? "",
    pointOfContact: (r.point_of_contact as string) ?? "",
    pocLinkedin: (r.poc_linkedin as string) ?? "",
    pocLocation: (r.poc_location as string) ?? "",
    notes: (r.notes as string) ?? "",
  };
}

function toHeadhunter(r: Record<string, unknown>): Headhunter {
  return {
    id: r.id as string,
    name: (r.name as string) ?? "",
    type: (r.type as Headhunter["type"]) ?? "Recruiter",
    specialization: (r.specialization as string) ?? "",
    linkedin: (r.linkedin as string) ?? "",
    email: (r.email as string) ?? "",
    location: (r.location as string) ?? "",
    notes: (r.notes as string) ?? "",
  };
}

function toNotification(r: Record<string, unknown>): Notification {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    message: (r.message as string) ?? "",
    link: (r.link as string) ?? "",
    read: (r.read as boolean) ?? false,
    createdAt: r.created_at as string,
  };
}

function toActivityLog(r: Record<string, unknown>): ActivityLog {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    userName: (r.user_name as string) ?? "",
    action: (r.action as string) ?? "",
    entityType: (r.entity_type as string) ?? "",
    entityId: (r.entity_id as string) ?? "",
    entityName: (r.entity_name as string) ?? "",
    createdAt: r.created_at as string,
  };
}

function toResetToken(r: Record<string, unknown>): PasswordResetToken {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    token: r.token as string,
    expiresAt: r.expires_at as string,
    used: r.used as boolean,
  };
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from("users").select("*").order("created_at");
  if (error) throw error;
  return (data ?? []).map((r) => toUser(r as Record<string, unknown>));
}

export async function getUserById(id: string): Promise<User | undefined> {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toUser(data as Record<string, unknown>) : undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return data ? toUser(data as Record<string, unknown>) : undefined;
}

export async function createUser(user: User): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      password: user.password,
      role: user.role,
      disabled: user.disabled,
      created_at: user.createdAt,
      last_login_at: user.lastLoginAt ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return toUser(data as Record<string, unknown>);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.password !== undefined) dbUpdates.password = updates.password;
  if (updates.role !== undefined) dbUpdates.role = updates.role;
  if (updates.disabled !== undefined) dbUpdates.disabled = updates.disabled;
  if (updates.lastLoginAt !== undefined) dbUpdates.last_login_at = updates.lastLoginAt;

  const { data, error } = await supabase
    .from("users")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? toUser(data as Record<string, unknown>) : null;
}

export async function deleteUser(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("users")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

// ─── Reset Tokens ─────────────────────────────────────────────────────────────

export async function createResetToken(token: PasswordResetToken): Promise<void> {
  // Invalidate existing unused tokens for this user
  await supabase
    .from("reset_tokens")
    .update({ used: true })
    .eq("user_id", token.userId)
    .eq("used", false);

  const { error } = await supabase.from("reset_tokens").insert({
    id: token.id,
    user_id: token.userId,
    token: token.token,
    expires_at: token.expiresAt,
    used: token.used,
  });
  if (error) throw error;
}

export async function getResetToken(token: string): Promise<PasswordResetToken | undefined> {
  const { data, error } = await supabase
    .from("reset_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  return data ? toResetToken(data as Record<string, unknown>) : undefined;
}

export async function markResetTokenUsed(tokenId: string): Promise<void> {
  const { error } = await supabase
    .from("reset_tokens")
    .update({ used: true })
    .eq("id", tokenId);
  if (error) throw error;
}

// ─── Candidates ───────────────────────────────────────────────────────────────

export async function getCandidates(): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => toCandidate(r as Record<string, unknown>));
}

export async function getCandidateById(id: string): Promise<Candidate | undefined> {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toCandidate(data as Record<string, unknown>) : undefined;
}

export async function createCandidate(candidate: Candidate): Promise<Candidate> {
  const { data, error } = await supabase
    .from("candidates")
    .insert({
      id: candidate.id,
      status: candidate.status,
      partner: candidate.partner,
      client_name: candidate.clientName,
      candidate_name: candidate.candidateName,
      level_of_support: candidate.levelOfSupport,
      lead_coach: candidate.leadCoach,
      support: candidate.support,
      email: candidate.email,
      whatsapp: candidate.whatsapp,
      linkedin: candidate.linkedin,
      duration: candidate.duration,
      date_started: candidate.dateStarted,
      end_date: candidate.endDate,
      sessions_completed: candidate.sessionsCompleted,
      notes: candidate.notes,
      disc_style: candidate.discStyle,
      job_status: candidate.jobStatus,
      new_company: candidate.newCompany,
      new_placement: candidate.newPlacement,
      position: candidate.position,
      sector: candidate.sector,
      old_placement: candidate.oldPlacement,
      progress: candidate.progress,
      activities: candidate.activities,
      disc_done: candidate.discDone,
      invoice_status: candidate.invoiceStatus,
      costing_status: candidate.costingStatus,
      created_at: candidate.createdAt,
      updated_at: candidate.updatedAt,
      updated_by: candidate.updatedBy,
    })
    .select()
    .single();
  if (error) throw error;
  return toCandidate(data as Record<string, unknown>);
}

export async function updateCandidate(
  id: string,
  updates: Partial<Candidate>
): Promise<Candidate | null> {
  const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.partner !== undefined) dbUpdates.partner = updates.partner;
  if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
  if (updates.candidateName !== undefined) dbUpdates.candidate_name = updates.candidateName;
  if (updates.levelOfSupport !== undefined) dbUpdates.level_of_support = updates.levelOfSupport;
  if (updates.leadCoach !== undefined) dbUpdates.lead_coach = updates.leadCoach;
  if (updates.support !== undefined) dbUpdates.support = updates.support;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.whatsapp !== undefined) dbUpdates.whatsapp = updates.whatsapp;
  if (updates.linkedin !== undefined) dbUpdates.linkedin = updates.linkedin;
  if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
  if (updates.dateStarted !== undefined) dbUpdates.date_started = updates.dateStarted;
  if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
  if (updates.sessionsCompleted !== undefined)
    dbUpdates.sessions_completed = updates.sessionsCompleted;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.discStyle !== undefined) dbUpdates.disc_style = updates.discStyle;
  if (updates.jobStatus !== undefined) dbUpdates.job_status = updates.jobStatus;
  if (updates.newCompany !== undefined) dbUpdates.new_company = updates.newCompany;
  if (updates.newPlacement !== undefined) dbUpdates.new_placement = updates.newPlacement;
  if (updates.position !== undefined) dbUpdates.position = updates.position;
  if (updates.sector !== undefined) dbUpdates.sector = updates.sector;
  if (updates.oldPlacement !== undefined) dbUpdates.old_placement = updates.oldPlacement;
  if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
  if (updates.activities !== undefined) dbUpdates.activities = updates.activities;
  if (updates.discDone !== undefined) dbUpdates.disc_done = updates.discDone;
  if (updates.invoiceStatus !== undefined) dbUpdates.invoice_status = updates.invoiceStatus;
  if (updates.costingStatus !== undefined) dbUpdates.costing_status = updates.costingStatus;
  if (updates.updatedBy !== undefined) dbUpdates.updated_by = updates.updatedBy;

  const { data, error } = await supabase
    .from("candidates")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? toCandidate(data as Record<string, unknown>) : null;
}

export async function deleteCandidate(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("candidates")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

// ─── Transitions ──────────────────────────────────────────────────────────────

export async function getTransitions(): Promise<Transition[]> {
  const { data, error } = await supabase
    .from("transitions")
    .select("*")
    .order("year", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => toTransition(r as Record<string, unknown>));
}

export async function createTransition(transition: Transition): Promise<Transition> {
  const { data, error } = await supabase
    .from("transitions")
    .insert({
      id: transition.id,
      year: transition.year,
      candidate_name: transition.candidateName,
      client_name: transition.clientName,
      lead_owner: transition.leadOwner,
      consultant_in_charge: transition.consultantInCharge,
      supports: transition.supports,
      old_job: transition.oldJob,
      new_placement: transition.newPlacement,
      new_job_title: transition.newJobTitle,
      email: transition.email,
      phone: transition.phone,
    })
    .select()
    .single();
  if (error) throw error;
  return toTransition(data as Record<string, unknown>);
}

export async function updateTransition(
  id: string,
  updates: Partial<Transition>
): Promise<Transition | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.year !== undefined) dbUpdates.year = updates.year;
  if (updates.candidateName !== undefined) dbUpdates.candidate_name = updates.candidateName;
  if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
  if (updates.leadOwner !== undefined) dbUpdates.lead_owner = updates.leadOwner;
  if (updates.consultantInCharge !== undefined)
    dbUpdates.consultant_in_charge = updates.consultantInCharge;
  if (updates.supports !== undefined) dbUpdates.supports = updates.supports;
  if (updates.oldJob !== undefined) dbUpdates.old_job = updates.oldJob;
  if (updates.newPlacement !== undefined) dbUpdates.new_placement = updates.newPlacement;
  if (updates.newJobTitle !== undefined) dbUpdates.new_job_title = updates.newJobTitle;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;

  const { data, error } = await supabase
    .from("transitions")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? toTransition(data as Record<string, unknown>) : null;
}

export async function deleteTransition(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("transitions")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

// ─── Companies ────────────────────────────────────────────────────────────────

export async function getCompanies(): Promise<Company[]> {
  const { data, error } = await supabase.from("companies").select("*").order("company_name");
  if (error) throw error;
  return (data ?? []).map((r) => toCompany(r as Record<string, unknown>));
}

export async function createCompany(company: Company): Promise<Company> {
  const { data, error } = await supabase
    .from("companies")
    .insert({
      id: company.id,
      company_name: company.companyName,
      industry: company.industry,
      website: company.website,
      point_of_contact: company.pointOfContact,
      poc_linkedin: company.pocLinkedin,
      poc_location: company.pocLocation,
      notes: company.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return toCompany(data as Record<string, unknown>);
}

export async function updateCompany(id: string, updates: Partial<Company>): Promise<Company | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName;
  if (updates.industry !== undefined) dbUpdates.industry = updates.industry;
  if (updates.website !== undefined) dbUpdates.website = updates.website;
  if (updates.pointOfContact !== undefined) dbUpdates.point_of_contact = updates.pointOfContact;
  if (updates.pocLinkedin !== undefined) dbUpdates.poc_linkedin = updates.pocLinkedin;
  if (updates.pocLocation !== undefined) dbUpdates.poc_location = updates.pocLocation;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  const { data, error } = await supabase
    .from("companies")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? toCompany(data as Record<string, unknown>) : null;
}

export async function deleteCompany(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("companies")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

// ─── Headhunters ──────────────────────────────────────────────────────────────

export async function getHeadhunters(): Promise<Headhunter[]> {
  const { data, error } = await supabase.from("headhunters").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map((r) => toHeadhunter(r as Record<string, unknown>));
}

export async function createHeadhunter(hh: Headhunter): Promise<Headhunter> {
  const { data, error } = await supabase
    .from("headhunters")
    .insert({
      id: hh.id,
      name: hh.name,
      type: hh.type,
      specialization: hh.specialization,
      linkedin: hh.linkedin,
      email: hh.email,
      location: hh.location,
      notes: hh.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return toHeadhunter(data as Record<string, unknown>);
}

export async function updateHeadhunter(
  id: string,
  updates: Partial<Headhunter>
): Promise<Headhunter | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.specialization !== undefined) dbUpdates.specialization = updates.specialization;
  if (updates.linkedin !== undefined) dbUpdates.linkedin = updates.linkedin;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.location !== undefined) dbUpdates.location = updates.location;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  const { data, error } = await supabase
    .from("headhunters")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? toHeadhunter(data as Record<string, unknown>) : null;
}

export async function deleteHeadhunter(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("headhunters")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => toNotification(r as Record<string, unknown>));
}

export async function createNotificationsForAllUsers(
  excludeUserId: string,
  message: string,
  link: string
): Promise<void> {
  // Fetch all non-excluded users
  const { data: users, error: userError } = await supabase
    .from("users")
    .select("id")
    .neq("id", excludeUserId);
  if (userError) throw userError;

  if (!users || users.length === 0) return;

  const now = new Date().toISOString();
  const notifs = users.map((u) => ({
    id: `notif_${Date.now()}_${u.id}`,
    user_id: u.id,
    message,
    link,
    read: false,
    created_at: now,
  }));

  const { error } = await supabase.from("notifications").insert(notifs);
  if (error) throw error;
}

export async function markNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
}

// ─── Lists (dropdown options) ─────────────────────────────────────────────────

export async function getLists(): Promise<Lists> {
  const { data, error } = await supabase.from("lists").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  if (!data) return { partners: [], clients: [], coaches: [], supports: [] };
  return {
    partners: (data.partners as string[]) ?? [],
    clients: (data.clients as string[]) ?? [],
    coaches: (data.coaches as string[]) ?? [],
    supports: (data.supports as string[]) ?? [],
  };
}

export async function addToList(key: keyof Lists, value: string): Promise<void> {
  const lists = await getLists();
  if (!lists[key].includes(value)) {
    lists[key] = [...lists[key], value];
    const { error } = await supabase
      .from("lists")
      .upsert({ id: 1, [key]: lists[key] }, { onConflict: "id" });
    if (error) throw error;
  }
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export async function getActivityLog(): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map((r) => toActivityLog(r as Record<string, unknown>));
}

export async function addActivityLog(entry: ActivityLog): Promise<void> {
  const { error } = await supabase.from("activity_log").insert({
    id: entry.id,
    user_id: entry.userId,
    user_name: entry.userName,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    entity_name: entry.entityName,
    created_at: entry.createdAt,
  });
  if (error) throw error;
}
