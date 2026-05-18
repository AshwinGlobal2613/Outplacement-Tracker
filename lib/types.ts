export type UserRole = "admin" | "team_member";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  disabled: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  used: boolean;
}

export type SupportLevel = "Low" | "Low-Mid" | "Mid" | "Mid-High" | "High";
export type CandidateStatus = "referred" | "active" | "candidate_reached" | "completed" | "declined";

export interface CustomMilestone {
  id: string;
  label: string;
  done: boolean;
}

export interface CandidateProgress {
  introductorySession: boolean;
  cvSessions: boolean;
  linkedinProfile: boolean;
  profiling: boolean;
  networkingPersonalBranding: boolean;
  custom?: CustomMilestone[];
}

export type DiscDoneStatus = "Done" | "Not Done";
export type InvoiceStatus = "Not Raised" | "Raised" | "Cleared";
export type CostingStatus = "Not Done" | "To be reviewed" | "Done";

export type ActivityType = "job" | "event" | "network";

export interface CandidateActivity {
  id: string;
  type: ActivityType;
  title: string;
  link: string;
  notes: string;
  createdAt: string;
  createdBy: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
}

export interface CandidateDocument {
  id: string;
  name: string;
  folderId: string | null;
  size: number;
  mimeType: string;
  storagePath: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Session {
  id: string;
  type: string;
  title: string;
  date: string;       // "YYYY-MM-DD"
  time: string;       // "HH:MM"
  duration: number;   // minutes
  location: string;
  meetingLink: string;
  notes: string;
  createdAt: string;
  createdBy: string;
  googleEventId?: string;
}

export interface Candidate {
  id: string;
  status: CandidateStatus;
  partner: string;
  clientName: string;
  candidateName: string;
  levelOfSupport: SupportLevel;
  leadCoach: string;
  support: string;
  email: string;
  whatsapp: string;
  linkedin: string;
  duration: string;
  dateStarted: string | null;
  endDate: string | null;
  sessionsCompleted: number;
  notes: string;
  discStyle: string;
  jobStatus: string | null;
  newCompany: string | null;
  newPlacement: string | null;
  position: string | null;
  sector: string | null;
  oldPlacement: string | null;
  progress: CandidateProgress;
  activities: CandidateActivity[];
  sessions?: Session[];
  folders?: DocumentFolder[];
  documents?: CandidateDocument[];
  discDone: DiscDoneStatus;
  invoiceStatus: InvoiceStatus;
  costingStatus: CostingStatus;
  budget?: number | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface Lists {
  partners: string[];
  clients: string[];
  coaches: string[];
  supports: string[];
}

export interface Transition {
  id: string;
  year: string;
  candidateName: string;
  clientName: string;
  leadOwner: string;
  consultantInCharge: string;
  supports: string;
  oldJob: string;
  newPlacement: string;
  newJobTitle: string;
  email: string;
  phone: string;
}

export interface Company {
  id: string;
  companyName: string;
  industry: string;
  website: string;
  pointOfContact: string;
  pocLinkedin: string;
  pocLocation: string;
  notes: string;
}

export interface Headhunter {
  id: string;
  name: string;
  type: "Recruiter" | "Headhunter" | "Specialist";
  specialization: string;
  linkedin: string;
  email: string;
  location: string;
  notes: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  createdAt: string;
}

export interface Database {
  users: User[];
  candidates: Candidate[];
  transitions: Transition[];
  companies: Company[];
  headhunters: Headhunter[];
  notifications: Notification[];
  activityLog: ActivityLog[];
  lists: Lists;
  resetTokens: PasswordResetToken[];
}
