# Content Management Dashboard — Project Reference

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.5 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^3.4 |
| UI Components | shadcn/ui (Radix primitives) | Latest |
| Icons | lucide-react | ^0.408 |
| Utility | clsx + tailwind-merge (via `cn()`) | Latest |

---

## Folder Structure

```
/
├── app/
│   ├── globals.css          # Global styles + CSS custom properties (dark theme variables)
│   ├── layout.tsx           # Root layout — sets dark class on <html>, loads Inter font
│   ├── page.tsx             # Root route — redirects to /instagram
│   └── (dashboard)/         # Route group — shared sidebar layout, no URL segment
│       ├── layout.tsx       # Dashboard shell: Sidebar + <main> scroll area
│       ├── instagram/       # Instagram Manager section
│       ├── analytics/       # Analytics section
│       ├── calendar/        # Content Calendar section
│       ├── competitor-tracker/ # Competitor Tracker section
│       └── news/            # News Consolidator section
│
├── components/
│   ├── sidebar.tsx          # Primary navigation sidebar (client component)
│   ├── page-header.tsx      # Reusable page title/description bar with optional actions slot
│   ├── stat-card.tsx        # KPI card with icon, value, change indicator
│   └── ui/                  # shadcn/ui component files (manually scaffolded)
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── separator.tsx
│       └── scroll-area.tsx
│
├── lib/
│   └── utils.ts             # cn() helper (clsx + tailwind-merge)
│
├── components.json          # shadcn/ui CLI config (baseColor: zinc, cssVariables: true)
├── tailwind.config.ts       # Tailwind config with shadcn CSS variable mappings
├── tsconfig.json            # Path alias: @/* → ./*
├── next.config.js
└── package.json
```

---

## Dashboard Sections

| Section | Route | Description |
|---|---|---|
| Instagram Manager | `/instagram` | Post management, engagement stats, scheduling |
| Analytics | `/analytics` | Cross-platform reach, engagement, top content |
| Content Calendar | `/calendar` | Visual calendar grid, post queue by platform |
| Competitor Tracker | `/competitor-tracker` | Competitor metrics table, insights, alerts |
| News Consolidator | `/news` | Aggregated industry news with category filters |

The root `/` route redirects to `/instagram` as the default landing page.

---

## Dark Theme

- Dark mode is **forced globally** by applying `class="dark"` on the `<html>` element in `app/layout.tsx`.
- There is no light/dark toggle — the app is dark-only by design.
- All color tokens are defined as CSS custom properties in `app/globals.css` under `.dark {}`.
- The sidebar uses a separate set of variables (`--sidebar-background`, `--sidebar-border`, etc.) to allow independent theming from the main content area.

---

## Component Conventions

### shadcn/ui Components
- Stored in `components/ui/`. These are owned files — edit directly, do not re-run the shadcn CLI unless adding a new component.
- All use `forwardRef` and accept a `className` prop merged via `cn()`.

### Shared Components
- `PageHeader` — server component, accepts `title`, `description`, and an optional `children` slot for action buttons.
- `StatCard` — server component, accepts `title`, `value`, `change`, `positive` (boolean), `icon`, and optional `iconColor`.
- `Sidebar` — **client component** (uses `usePathname` for active state). Active nav item is highlighted with `bg-primary/20 text-primary`.

### Naming Conventions
- Page files: `app/(dashboard)/[section]/page.tsx`
- Shared components: `components/[component-name].tsx` (kebab-case)
- UI primitives: `components/ui/[component-name].tsx`

### Utility: `cn()`
Always use `cn()` from `@/lib/utils` for conditional class merging instead of template literals or direct string concatenation.

---

## Key Architectural Decisions

1. **App Router route group `(dashboard)`** — wraps all section pages in a shared layout with the sidebar without adding a URL prefix. This keeps URLs clean (`/instagram`, not `/dashboard/instagram`).

2. **Forced dark mode** — applied at the HTML element level so there is no flash of light content. Using the `class` strategy (not `media`) allows future manual toggle support if needed.

3. **shadcn/ui manually scaffolded** — components were written directly rather than generated via CLI, since the CLI requires an npm install step. When adding new components, prefer `npx shadcn@latest add [component]` after `npm install`.

4. **CSS variable–based color system** — all Tailwind color tokens (`bg-background`, `text-foreground`, `border-border`, etc.) map to HSL CSS variables. This makes future re-theming a CSS-only change.

5. **Placeholder data** — all pages use hardcoded mock data. Replace with API calls / data-fetching as integrations are built out.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to the Instagram Manager.

---

## Next Steps (Suggested)

- [ ] Install Recharts or Chart.js for analytics charts
- [ ] Connect Instagram Graph API for live data
- [ ] Add authentication (NextAuth.js or Clerk)
- [ ] Build post creation/editing flow with image upload
- [ ] Integrate RSS feeds into the News Consolidator
- [ ] Add real-time competitor data via third-party social analytics APIs
