# YourBizz — Forms, Bookings & CRM SaaS

A modern, multi-tenant SaaS platform for building forms, accepting bookings, and managing customer relationships. Built with Next.js 16, TypeScript, Tailwind 4, shadcn/ui, and Prisma. Designed to scale to **10 billion rows** of submissions with partitioned tables and strict row-level security.

> **Note:** This repo contains the **Forms module** (Phase 1 of the YourBizz platform). Bookings and CRM modules will be added in subsequent phases.

---

## 🚀 Quick Start (Local Dev)

```bash
# 1. Install dependencies
bun install

# 2. Copy env file and fill in values
cp .env.example .env.local
# Edit .env.local — at minimum set NEXTAUTH_SECRET and DATABASE_URL

# 3. Push the database schema (uses SQLite locally)
bun run db:push

# 4. Start the dev server
bun run dev
# Open http://localhost:3000
```

The default database is SQLite (`db/custom.db`). All Prisma models mirror the production Postgres schema in `supabase/migrations/0001_initial.sql`.

---

## 🧱 Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR + RSC + edge-ready |
| Language | TypeScript 5 (strict) | Type safety end-to-end |
| Styling | Tailwind CSS 4 + shadcn/ui | Modern, accessible, themeable |
| Database | Prisma + SQLite (dev) / Postgres (prod via Supabase) | Single schema, two runtimes |
| Auth | NextAuth.js v4 (Credentials + Google OAuth) | Flexible, battle-tested |
| Email | Resend | Transactional email for signup + notifications |
| Drag-drop | @dnd-kit | Accessible form builder canvas |
| Forms (client) | React Hook Form + Zod | Schema-validated submissions |
| Charts | Recharts | Submission analytics |
| Icons | lucide-react | Consistent icon set |
| State | Zustand + TanStack Query | Lightweight, scalable |

---

## 📁 Project Structure

```
yourbizz/
├── prisma/
│   └── schema.prisma              # Multi-tenant Prisma schema (15+ models)
├── supabase/
│   └── migrations/
│       └── 0001_initial.sql       # Production Postgres schema + RLS policies
├── src/
│   ├── app/
│   │   ├── page.tsx               # Marketing landing page
│   │   ├── layout.tsx             # Root layout (ThemeProvider, fonts)
│   │   ├── globals.css            # Brand theme (violet + emerald + amber)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx     # Email + password login
│   │   │   └── signup/page.tsx    # Signup with workspace creation
│   │   ├── (app)/
│   │   │   ├── dashboard/page.tsx          # Forms list + stats
│   │   │   └── forms/[id]/
│   │   │       ├── edit/page.tsx           # Drag-drop form builder
│   │   │       └── submissions/page.tsx    # Submissions table + CSV export
│   │   ├── f/[slug]/page.tsx      # Public form renderer
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts # NextAuth handler
│   │       ├── auth/signup/route.ts        # Signup endpoint
│   │       ├── forms/route.ts              # GET/POST forms
│   │       ├── forms/[id]/route.ts         # GET/PATCH/DELETE form
│   │       ├── forms/[id]/publish/route.ts # Toggle publish status
│   │       ├── forms/[id]/submissions/route.ts # List submissions
│   │       ├── public/forms/[token]/route.ts   # Public form fetch
│   │       └── public/submit/route.ts      # Public form submission
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (50+ pre-installed)
│   │   ├── landing/               # Marketing page sections
│   │   ├── app/                   # App shell (sidebar, etc.)
│   │   ├── theme-provider.tsx     # next-themes wrapper
│   │   └── ...
│   ├── lib/
│   │   ├── auth.ts                # NextAuth config
│   │   ├── auth-server.ts         # Server-side auth helpers
│   │   ├── db.ts                  # Prisma client
│   │   ├── email.ts               # Resend integration (with stub)
│   │   ├── constants.ts           # App constants + field type registry
│   │   ├── form-schema.ts         # Form schema types + defaults
│   │   └── utils.ts               # cn() utility
│   ├── middleware.ts              # Protects /app/* and /api/forms/*
│   └── types/next-auth.d.ts       # NextAuth type extensions
├── public/
│   ├── favicon.svg
│   └── logo.svg
├── .env.example                   # All environment variables documented
├── package.json
└── README.md (this file)
```

---

## ✨ Features

### Form Builder (Phase 3 — ✅ Shipped)
- **25+ field types**: short text, long text, email, phone, number, currency, decimal, date, time, datetime, dropdown, radio, checkbox, multi-select, rating, scale, slider, file upload, image, signature, calculator, matrix, section break, page break, rich text, divider, captcha, address, country, URL
- **Drag-drop canvas** (powered by @dnd-kit)
- **Field palette** grouped by category (Basic / Choice / Rating / Date / Files / Special / Layout)
- **Properties panel** with field-level settings (label, placeholder, help text, required, hidden, validation, options, min/max, accepted file types, currency, rating max, etc.)
- **Theme panel** — primary color, background (color/gradient/image), text color, button style
- **Settings panel** — submit button text, success message, redirect URL, captcha, honeypot, one-response-per-user, save & resume, email notifications, response limits
- **Auto-save** (1.5s debounce)
- **Version history** (every schema change creates a FormVersion)

### Public Form Renderer (Phase 4 — ✅ Shipped)
- Responsive, mobile-first rendering
- Multi-page forms with progress bar
- Conditional logic (show/hide fields based on other field values)
- Honeypot spam protection
- Captcha (stub — wire hCaptcha in production)
- Custom success message + optional redirect URL
- Themed (uses form's primary color, background, button style)

### Submissions Management (Phase 5 — ✅ Shipped)
- Paginated table view
- Field-level detail drawer (Sheet component)
- CSV export (all fields, all submissions on current page)
- Search (basic — extend with full-text search in Postgres prod)
- Pagination (20 per page)

### Auth (Phase 2 — ✅ Shipped)
- Email + password (bcrypt-hashed)
- Auto workspace creation on signup
- JWT session strategy (30-day expiry)
- Middleware-protected `/app/*` and `/api/forms/*`
- Google OAuth scaffolded (set env vars to enable)

### Marketing Landing Page (Phase 1 — ✅ Shipped)
- Hero with gradient mesh + interactive form-builder mockup
- Stats bar (8.4M+ forms, 1.2B+ submissions, 99.99% uptime, 12,000+ teams)
- 12-feature grid (multi-color icon palette)
- 6 use cases with tabs (Lead Gen / Events / Surveys / Orders / Applications / Internal)
- 3-step "How it works"
- 8 template cards
- 6 testimonials
- 4-tier pricing (Free / Pro / Business / Enterprise) with monthly/yearly toggle
- 8-question FAQ accordion
- Final CTA + multi-column footer
- Dark mode (next-themes)
- Sticky responsive header with mobile menu

---

## 🔐 Security Architecture

### Multi-Tenancy
- Every tenant-scoped table has `workspace_id`
- Every API route calls `getAuthContext()` which:
  1. Verifies the JWT session
  2. Looks up the user's primary workspace
  3. Returns the role (owner/admin/builder/reviewer/viewer)
- All Prisma queries filter by `workspaceId` from the auth context

### Row-Level Security (Production / Supabase)
The `supabase/migrations/0001_initial.sql` file contains the complete RLS setup:

- **Every table** has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- **Read policies**: workspace members can SELECT
- **Write policies**: only owners/admins/builders can INSERT/UPDATE; only owners/admins can DELETE
- **Helper functions**: `is_workspace_member()`, `is_workspace_writer()`, `is_workspace_admin()`
- **Public submissions bypass RLS** via a `SECURITY DEFINER` function `submit_form(p_public_token, p_data)` that:
  - Validates the public token exists
  - Checks form is published + not closed/expired
  - Validates honeypot (silently succeeds if filled)
  - Enforces response limit
  - Enforces schedule window
  - Inserts submission + analytics event atomically

### Scaling to 10B Rows
- `submissions` table is **partitioned by month** (Postgres native partitioning)
- `analytics_events` table is also partitioned by month
- Initial 17 monthly partitions created (Dec 2025 → Apr 2027)
- pg_cron job (configured in Supabase Dashboard) creates future partitions monthly
- Indexes on `(form_id, submitted_at DESC)` per partition for fast queries
- Read replicas (via Supabase pool) for analytics queries

### Audit Trail
Every significant action (form.create, form.update, form.delete, form.publish, form.unpublish) is recorded in `audit_logs` with actor ID, target, and metadata.

---

## 🚢 Deployment: Vercel + Supabase + Resend

### Step 1 — Create the GitHub Repo

```bash
# On your local machine, in the project root:
git init
git add .
git commit -m "Initial commit: YourBizz Forms module"
git branch -M main
git remote add origin https://github.com/sricharanmaniwork-create/yourbizz.git
git push -u origin main
```

### Step 2 — Create Supabase Project

1. Go to https://supabase.com/dashboard → New Project
2. Pick a name (e.g. `yourbizz-prod`), strong DB password, region closest to your users
3. Once created, go to **SQL Editor** → New Query
4. Paste the entire contents of `supabase/migrations/0001_initial.sql`
5. Click **Run** — this creates all tables, RLS policies, and helper functions
6. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)
7. Go to **Project Settings → Database → Connection string → URI** and copy:
   - This becomes your production `DATABASE_URL`
   - Format: `postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres?schema=public`

### Step 3 — Configure Prisma for Postgres

In `prisma/schema.prisma`, change:
```prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
}
```

Then regenerate:
```bash
bun run db:generate
bun run db:push   # applies schema (idempotent — matches migration SQL)
```

### Step 4 — Configure Resend

1. Sign up at https://resend.com
2. Go to **Domains → Add Domain** → enter `yourbizz.app` (or your domain)
3. Add the DNS records Resend shows you (SPF, DKIM, etc.)
4. Wait for verification (usually <5 minutes)
5. Go to **API Keys → Create API Key** → copy `re_xxxxxxxx`

### Step 5 — Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repo: `sricharanmaniwork-create/yourbizz`
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: `./` (default)
5. Build command: `bun run build` (auto-detected)
6. **Environment Variables** — add ALL of these (Production + Preview + Development):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Supabase Postgres connection string |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` (your Vercel URL) |
| `NEXT_PUBLIC_APP_URL` | Same as NEXTAUTH_URL |
| `NEXT_PUBLIC_APP_NAME` | `YourBizz` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `support@yourbizz.app` |
| `RESEND_API_KEY` | `re_xxxxxxxx` |
| `RESEND_FROM_EMAIL` | `noreply@yourbizz.app` |
| `RESEND_REPLY_TO` | `support@yourbizz.app` |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | (optional, for captcha) |
| `HCAPTCHA_SECRET` | (optional) |
| `GOOGLE_OAUTH_CLIENT_ID` | (optional) |
| `GOOGLE_OAUTH_CLIENT_SECRET` | (optional) |
| `STRIPE_SECRET_KEY` | (Phase 10 — defer) |
| `STRIPE_WEBHOOK_SECRET` | (Phase 10 — defer) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | (Phase 10 — defer) |

7. Click **Deploy**. First build takes ~2 minutes.
8. Once deployed, visit your Vercel URL → you should see the landing page.

### Step 6 — Set up Google OAuth (Optional)

1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized redirect URIs:
   - `https://YOUR-VERCEL-DOMAIN/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for dev)
4. Copy Client ID + Secret to Vercel env vars
5. Also add Google provider in Supabase Dashboard → Authentication → Providers → Google (if you switch to Supabase Auth later)

### Step 7 — Custom Domain (Optional)

1. In Vercel → Project → Settings → Domains → Add your domain
2. Add the CNAME/A records Vercel shows you at your DNS provider
3. Wait for TLS provisioning (~5 minutes)
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` in Vercel env vars to your custom domain

### Step 8 — Configure pg_cron (Production DB Maintenance)

In Supabase Dashboard → SQL Editor, run:

```sql
-- Monthly partition creation for submissions (25th of each month)
SELECT cron.schedule(
  'create_submissions_partitions',
  '0 0 25 * *',
  $$
  do $$
  declare
    m timestamptz := date_trunc('month', now()) + interval '2 months';
  begin
    execute format(
      'create table if not exists public.submissions_%s partition of public.submissions for values from (%L) to (%L)',
      to_char(m, 'YYYY_MM'), m, m + interval '1 month'
    );
    execute format(
      'create index if not exists submissions_%s_form_id_submitted_at_idx on public.submissions_%s(form_id, submitted_at desc)',
      to_char(m, 'YYYY_MM'), to_char(m, 'YYYY_MM')
    );
  end $$;
  $$
);

-- Same for analytics_events
SELECT cron.schedule(
  'create_analytics_partitions',
  '0 5 25 * *',
  $$
  do $$
  declare
    m timestamptz := date_trunc('month', now()) + interval '2 months';
  begin
    execute format(
      'create table if not exists public.analytics_events_%s partition of public.analytics_events for values from (%L) to (%L)',
      to_char(m, 'YYYY_MM'), m, m + interval '1 month'
    );
    execute format(
      'create index if not exists analytics_events_%s_form_id_created_at_idx on public.analytics_events_%s(form_id, created_at desc)',
      to_char(m, 'YYYY_MM'), to_char(m, 'YYYY_MM')
    );
  end $$;
  $$
);
```

---

## 🔧 Available Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start dev server on port 3000 |
| `bun run build` | Production build (standalone) |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push schema to DB (idempotent) |
| `bun run db:generate` | Regenerate Prisma Client |
| `bun run db:migrate` | Create a migration (Postgres only) |
| `bun run db:reset` | Drop and recreate DB (DESTRUCTIVE) |

---

## 🗺 Roadmap

### ✅ Phase 1–5 (this release)
- Landing page, auth, form builder, public renderer, submissions

### 🔜 Phase 6 — Analytics & Insights
- Conversion funnels, drop-off analysis, geo/device charts, custom date ranges

### 🔜 Phase 7 — Workflows & Notifications
- Visual workflow builder (trigger → condition → action)
- Multi-step approval routing
- Slack / Discord / Teams webhooks
- Auto-responder templates with merge fields

### 🔜 Phase 8 — Integrations
- Google Sheets (2-way sync), Notion, Airtable, HubSpot, Mailchimp, Zapier/Make
- REST API + JS SDK + signed webhooks

### 🔜 Phase 9 — Team & Workspace
- Multiple workspaces, switcher
- Email invitations with magic-link accept
- Per-form permissions
- 90-day audit log search (3-year on Enterprise)

### 🔜 Phase 10 — Billing (Stripe)
- Free / Pro / Business / Enterprise tiers
- Stripe Checkout + Customer Portal
- Usage metering + overage alerts
- Proration on plan change

### 🔜 Phase 11+ — Bookings & CRM
- Calendar-based booking pages (Calendly-equivalent)
- Contact / company / deal records (HubSpot-equivalent)
- Pipeline kanban
- Email + activity timeline
- Forms → CRM auto-pipeline-creation rules

---

## 📜 License

Proprietary — © YourBizz, Inc. All rights reserved.
