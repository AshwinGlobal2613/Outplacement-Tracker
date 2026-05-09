import fs from "fs";
import path from "path";
import { Database, Candidate, User, Transition, Company, Headhunter, Notification, ActivityLog } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function readDb(): Database {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDb(db: Database): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

// Users
export function getUsers(): User[] {
  return readDb().users;
}

export function getUserById(id: string): User | undefined {
  return readDb().users.find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return readDb().users.find((u) => u.email === email);
}

export function createUser(user: User): User {
  const db = readDb();
  db.users.push(user);
  writeDb(db);
  return user;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const db = readDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  db.users[idx] = { ...db.users[idx], ...updates };
  writeDb(db);
  return db.users[idx];
}

export function deleteUser(id: string): boolean {
  const db = readDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  db.users.splice(idx, 1);
  writeDb(db);
  return true;
}

// Reset tokens
export function createResetToken(token: import("./types").PasswordResetToken): void {
  const db = readDb();
  if (!db.resetTokens) db.resetTokens = [];
  // Invalidate any existing unused tokens for this user
  db.resetTokens = db.resetTokens.map((t) =>
    t.userId === token.userId ? { ...t, used: true } : t
  );
  db.resetTokens.push(token);
  writeDb(db);
}

export function getResetToken(token: string): import("./types").PasswordResetToken | undefined {
  const db = readDb();
  return (db.resetTokens ?? []).find((t) => t.token === token);
}

export function markResetTokenUsed(tokenId: string): void {
  const db = readDb();
  db.resetTokens = (db.resetTokens ?? []).map((t) =>
    t.id === tokenId ? { ...t, used: true } : t
  );
  writeDb(db);
}

// Candidates
export function getCandidates(): Candidate[] {
  return readDb().candidates;
}

export function getCandidateById(id: string): Candidate | undefined {
  return readDb().candidates.find((c) => c.id === id);
}

export function createCandidate(candidate: Candidate): Candidate {
  const db = readDb();
  db.candidates.push(candidate);
  writeDb(db);
  return candidate;
}

export function updateCandidate(id: string, updates: Partial<Candidate>): Candidate | null {
  const db = readDb();
  const idx = db.candidates.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  db.candidates[idx] = { ...db.candidates[idx], ...updates, updatedAt: new Date().toISOString() };
  writeDb(db);
  return db.candidates[idx];
}

export function deleteCandidate(id: string): boolean {
  const db = readDb();
  const idx = db.candidates.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  db.candidates.splice(idx, 1);
  writeDb(db);
  return true;
}

// Transitions
export function getTransitions(): Transition[] {
  return readDb().transitions;
}

export function createTransition(transition: Transition): Transition {
  const db = readDb();
  db.transitions.push(transition);
  writeDb(db);
  return transition;
}

export function updateTransition(id: string, updates: Partial<Transition>): Transition | null {
  const db = readDb();
  const idx = db.transitions.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  db.transitions[idx] = { ...db.transitions[idx], ...updates };
  writeDb(db);
  return db.transitions[idx];
}

export function deleteTransition(id: string): boolean {
  const db = readDb();
  const idx = db.transitions.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  db.transitions.splice(idx, 1);
  writeDb(db);
  return true;
}

// Companies
export function getCompanies(): Company[] {
  return readDb().companies;
}

export function createCompany(company: Company): Company {
  const db = readDb();
  db.companies.push(company);
  writeDb(db);
  return company;
}

export function updateCompany(id: string, updates: Partial<Company>): Company | null {
  const db = readDb();
  const idx = db.companies.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  db.companies[idx] = { ...db.companies[idx], ...updates };
  writeDb(db);
  return db.companies[idx];
}

export function deleteCompany(id: string): boolean {
  const db = readDb();
  const idx = db.companies.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  db.companies.splice(idx, 1);
  writeDb(db);
  return true;
}

// Headhunters
export function getHeadhunters(): Headhunter[] {
  return readDb().headhunters;
}

export function createHeadhunter(hh: Headhunter): Headhunter {
  const db = readDb();
  db.headhunters.push(hh);
  writeDb(db);
  return hh;
}

export function updateHeadhunter(id: string, updates: Partial<Headhunter>): Headhunter | null {
  const db = readDb();
  const idx = db.headhunters.findIndex((h) => h.id === id);
  if (idx === -1) return null;
  db.headhunters[idx] = { ...db.headhunters[idx], ...updates };
  writeDb(db);
  return db.headhunters[idx];
}

export function deleteHeadhunter(id: string): boolean {
  const db = readDb();
  const idx = db.headhunters.findIndex((h) => h.id === id);
  if (idx === -1) return false;
  db.headhunters.splice(idx, 1);
  writeDb(db);
  return true;
}

// Notifications
export function getNotificationsForUser(userId: string): Notification[] {
  return readDb().notifications.filter((n) => n.userId === userId);
}

export function createNotificationsForAllUsers(
  excludeUserId: string,
  message: string,
  link: string
): void {
  const db = readDb();
  const now = new Date().toISOString();
  const newNotifs: Notification[] = db.users
    .filter((u) => u.id !== excludeUserId)
    .map((u) => ({
      id: `notif_${Date.now()}_${u.id}`,
      userId: u.id,
      message,
      link,
      read: false,
      createdAt: now,
    }));
  db.notifications.push(...newNotifs);
  writeDb(db);
}

export function markNotificationsRead(userId: string): void {
  const db = readDb();
  db.notifications = db.notifications.map((n) =>
    n.userId === userId ? { ...n, read: true } : n
  );
  writeDb(db);
}

// Lists (dropdown options)
export function getLists() {
  const db = readDb();
  return db.lists ?? { partners: [], clients: [], coaches: [], supports: [] };
}

export function addToList(key: keyof import("./types").Lists, value: string): void {
  const db = readDb();
  if (!db.lists) db.lists = { partners: [], clients: [], coaches: [], supports: [] };
  if (!db.lists[key].includes(value)) {
    db.lists[key].push(value);
    writeDb(db);
  }
}

// Activity Log
export function getActivityLog(): ActivityLog[] {
  const db = readDb();
  return [...db.activityLog].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addActivityLog(entry: ActivityLog): void {
  const db = readDb();
  db.activityLog.unshift(entry);
  if (db.activityLog.length > 200) db.activityLog = db.activityLog.slice(0, 200);
  writeDb(db);
}
