# Global Management Consultants — Outplacement Management System

A full-stack outplacement management platform built for **Global Management Consultants**, hosted on Railway at `https://outplacement.global-dubai.com`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | NextAuth.js v4 (JWT, CredentialsProvider) |
| Database | Supabase (PostgreSQL) |
| Email | Resend (HTTP API) |
| Hosting | Railway |
| Icons | lucide-react |

---

## Getting Started

```bash
npm install
npm run dev        # runs on http://localhost:3001
```

---

## Environment Variables

Set these in Railway → Variables (and in `.env.local` for local dev):

| Variable | Description |
|---|---|
| `NEXTAUTH_SECRET` | Random secret string for JWT signing |
| `NEXTAUTH_URL` | Full URL of the app e.g. `https://outplacement.global-dubai.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `SMTP_FROM` | Sender address e.g. `team@global-dubai.com` |

---

## Supabase Database Setup

Run the following SQL in the **Supabase SQL Editor** to create all required tables:

```sql
-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '',
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'team_member',
  disabled BOOLEAN NOT NULL DEFAULT false,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false
);

-- Candidates
CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'referred',
  partner TEXT DEFAULT '',
  client_name TEXT DEFAULT '',
  candidate_name TEXT DEFAULT '',
  level_of_support TEXT DEFAULT 'Low',
  lead_coach TEXT DEFAULT '',
  support TEXT DEFAULT '',
  email TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  date_started DATE,
  end_date DATE,
  sessions_completed INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  disc_style TEXT DEFAULT '',
  job_status TEXT,
  new_company TEXT,
  new_placement TEXT,
  position TEXT,
  sector TEXT,
  old_placement TEXT,
  progress JSONB DEFAULT '{}',
  activities JSONB DEFAULT '[]',
  disc_done TEXT DEFAULT 'Not Done',
  invoice_status TEXT DEFAULT 'Not Raised',
  costing_status TEXT DEFAULT 'Not Done',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by TEXT
);

-- Transitions
CREATE TABLE IF NOT EXISTS transitions (
  id TEXT PRIMARY KEY,
  year TEXT DEFAULT '',
  candidate_name TEXT DEFAULT '',
  client_name TEXT DEFAULT '',
  lead_owner TEXT DEFAULT '',
  consultant_in_charge TEXT DEFAULT '',
  supports TEXT DEFAULT '',
  from_company TEXT DEFAULT '',
  from_position TEXT DEFAULT '',
  to_company TEXT DEFAULT '',
  to_position TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Headhunters
CREATE TABLE IF NOT EXISTS headhunters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  specialization TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activity log
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT DEFAULT '',
  action TEXT NOT NULL,
  entity_type TEXT DEFAULT '',
  entity_id TEXT DEFAULT '',
  entity_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lists (partners, clients, coaches, supports — single-row JSONB store)
CREATE TABLE IF NOT EXISTS lists (
  id INTEGER PRIMARY KEY DEFAULT 1,
  partners JSONB DEFAULT '[]',
  clients JSONB DEFAULT '[]',
  coaches JSONB DEFAULT '[]',
  supports JSONB DEFAULT '[]'
);
INSERT INTO lists (id) VALUES (1) ON CONFLICT DO NOTHING;
```

> If you already have tables and need to add the `must_change_password` column:
> ```sql
> ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;
> ```

---

## Project Structure

```
app/
├── (auth)/                     # Login, register, forgot/reset password, change-password
├── (dashboard)/
│   └── outplacement/
│       ├── page.tsx            # Dashboard home / overview
│       ├── candidates/         # Candidate list + detail pages
│       ├── completed/          # Completed placements
│       ├── transitions/        # Career transitions tracker
│       ├── companies/          # Company directory
│       ├── headhunters/        # Headhunter directory
│       ├── activity/           # Activity log
│       ├── my-dashboard/       # Personal dashboard
│       ├── wip/                # Work in progress
│       └── admin/
│           ├── users/          # User management (admin only)
│           └── candidate-management/
└── api/
    ├── auth/
    │   ├── [...nextauth]/      # NextAuth handler
    │   ├── forgot-password/    # Send reset email
    │   ├── reset-password/     # Consume reset token
    │   └── change-password/    # Forced first-login password change
    ├── candidates/             # CRUD + tracking
    ├── users/                  # CRUD + resend-invite
    ├── transitions/
    ├── companies/
    ├── headhunters/
    ├── notifications/
    ├── lists/
    └── activity/

lib/
├── supabase.ts     # Supabase client (service role, no RLS)
├── db.ts           # All database functions (async, snake_case ↔ camelCase)
├── auth.ts         # NextAuth config + JWT/session typing
├── email.ts        # Resend email helpers
└── types.ts        # Shared TypeScript types
```

---

## Key Features

### Authentication
- Email + password login via NextAuth.js (JWT strategy)
- Forgot password → reset email with 1-hour expiring link
- Forced password change on first login (for admin-invited users)

### User Management (Admin only)
- **Add Member** — admin fills name/email/role; a secure 10-character temp password is auto-generated and emailed to the new user
- **Invite status tracking** — users show as 🟡 Invite Pending until they log in and set their own password, then flip to 🟢 Active
- **Resend Invite** — generates a fresh temp password and re-sends the invite email
- **Disable / Re-enable** accounts
- **Promote / Revoke** admin role
- **Permanent Delete** — only available on disabled accounts; requires a confirm click

### Invite Flow (for new users)
1. Admin adds a member → invite email sent with temp password
2. New user logs in with temp password
3. System detects `mustChangePassword: true` → redirects to `/change-password`
4. User enters temp password + sets a new one
5. Session is refreshed; user lands on the main dashboard

### Email (via Resend HTTP API)
All emails sent to `team@global-dubai.com` domain (verified in Resend):

| Email | Trigger |
|---|---|
| Invite email with temp password | Admin adds a new member |
| Password reset link | User clicks "Forgot password" |
| Welcome email | Self-registration |

Email delivery is **non-blocking** — the API responds to the user immediately and sends the email in the background.

### Candidate Management
- Status tabs: Referred → Candidate Reached → Active → Completed → Declined
- Progress milestones (5 checkpoints per candidate)
- Session tracking, DISC profiling, activity log
- Back arrow from candidate detail returns to the exact tab the user came from
- Default landing tab is **Active**

---

## Deployment (Railway)

1. Connect the GitHub repo (`AshwinGlobal2613/Outplacement-Tracker`) to a Railway project
2. Set all environment variables in Railway → Variables
3. Railway auto-deploys on every push to `main`

**Custom domain:** `outplacement.global-dubai.com`
Add these DNS records at your domain registrar:

| Type | Name | Value |
|---|---|---|
| CNAME | `outplacement` | `ibro92g8.up.railway.app` |
| TXT | `_railway-verify` | *(value shown in Railway Settings)* |

---

## Roles

| Role | Permissions |
|---|---|
| `admin` | Full access — user management, all sections, delete candidates |
| `team_member` | Read/write candidates and all operational sections; no user management |

---

## Notes

- The Supabase client uses the **service role key** server-side to bypass Row Level Security (RLS). Never expose this key to the browser.
- `NEXTAUTH_URL` must include `https://` — omitting the protocol breaks login redirects.
- Email uses Resend's **HTTP API** (not SMTP) because Railway blocks outbound port 587. The Resend API key only needs **Sending Access**.
