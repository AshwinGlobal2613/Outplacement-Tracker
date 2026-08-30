export type UserRole = "admin" | "team_member" | "client" | "candidate";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  clientCompany?: string;      // only for role === "client"
  candidateId?: string;        // only for role === "candidate"
  additionalEmails?: string[]; // extra addresses to CC on session invites
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
  notes?: string;
}

export interface CandidateProgress {
  introductorySession: boolean;
  cvSessions: boolean;
  linkedinProfile: boolean;
  profiling: boolean;
  networkingPersonalBranding: boolean;
  custom?: CustomMilestone[];
  milestoneNotes?: Record<string, string>;
  milestoneOrder?: string[]; // ordered IDs (standard keys + custom IDs); drives display order and removal
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
  source?: "team" | "candidate"; // who uploaded it
}

export interface WeeklyGoal {
  id: string;
  title: string;
  description?: string;
  targetCount: number;
  currentCount: number;
  weekLabel: string;   // e.g. "Week of 26 May 2026"
  dueDate?: string;    // YYYY-MM-DD
  completed: boolean;
  createdAt: string;
  createdBy: string;
}

export interface CVExperience {
  id: string;
  company: string;
  role: string;
  from: string;
  to: string;
  current: boolean;
  description: string;
  bullets?: string[];       // bullet points replacing description for display
}

export interface CVEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  from: string;
  to: string;
  description?: string;
}

export interface CVLanguage {
  id: string;
  name: string;
  proficiency: "Native" | "Fluent" | "Advanced" | "Intermediate" | "Basic";
}

export interface CVCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface CVContact {
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
}

export interface CVProject {
  id: string;
  title: string;
  description: string;
  link?: string;
  from?: string;
  to?: string;
}

export interface CVCourse {
  id: string;
  name: string;
  provider: string;
  date?: string;
  link?: string;
}

export interface CVAward {
  id: string;
  title: string;
  issuer: string;
  date?: string;
  description?: string;
}

export interface CVOrganisation {
  id: string;
  name: string;
  role: string;
  from?: string;
  to?: string;
  description?: string;
}

export interface CVPublication {
  id: string;
  title: string;
  publisher: string;
  date?: string;
  link?: string;
  description?: string;
}

export interface CVReference {
  id: string;
  name: string;
  jobTitle?: string;
  company?: string;
  email?: string;
  phone?: string;
}

export interface CVCustomEntry {
  id: string;
  title?: string;
  subtitle?: string;
  from?: string;
  to?: string;
  description?: string;
}

export interface CVCustomSection {
  id: string;
  sectionTitle: string;
  entries: CVCustomEntry[];
}

export interface CVStyle {
  accentColor: string;                          // hex e.g. "#e11d48"
  fontFamily: string;                           // css font-family string
  fontSize: "sm" | "md" | "lg";
  spacing: "compact" | "normal" | "relaxed";
}

export interface CVProfile {
  headline: string;
  summary: string;
  linkedinAbout: string;
  skills: string[];
  languages?: CVLanguage[];
  certifications?: CVCertification[];
  experience: CVExperience[];
  education: CVEducation[];
  interests?: string[];
  projects?: CVProject[];
  courses?: CVCourse[];
  awards?: CVAward[];
  organisations?: CVOrganisation[];
  publications?: CVPublication[];
  references?: CVReference[];
  declaration?: string;
  customSections?: CVCustomSection[];
  sectionOrder?: string[];                      // ordered section IDs
  style?: CVStyle;
  contact?: CVContact;
  updatedAt?: string;
}

export interface CVNamedProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  profile: CVProfile;
}

export interface CandidateResource {
  id: string;
  title: string;
  description: string;
  type: "link" | "file";
  url: string;          // for links: URL; for files: storage path
  fileName?: string;    // display name for files
  addedBy: string;      // user id
  addedByName: string;  // user display name
  addedAt: string;
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
  googleCalendarId?: string;
  inviteEmails?: string[];
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
  candidateResources?: CandidateResource[];
  goals?: WeeklyGoal[];
  cvProfile?: CVProfile;
  cvProfiles?: CVNamedProfile[];
  discDone: DiscDoneStatus;
  invoiceStatus: InvoiceStatus;
  costingStatus: CostingStatus;
  budget?: number | null;
  budgetCurrency?: string | null;
  adminNotes?: string;
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

export type ResourceCategory = "Email Templates" | "Reading Materials" | "Guides" | "Other";

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  content: string;       // For templates: the template body. For links: the URL.
  type: "template" | "document" | "link";
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
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
