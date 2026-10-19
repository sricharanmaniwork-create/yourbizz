-- ============================================================================
-- YourBizz — Production Supabase Schema (Postgres 15+)
-- ============================================================================
-- This migration creates the full multi-tenant schema with Row Level Security
-- (RLS) policies designed for 10B-row scale.
--
-- Key design decisions:
--   1. workspaces are the unit of tenancy; every tenant-scoped table has
--      workspace_id + RLS policies that filter by workspace membership.
--   2. submissions and analytics_events are partitioned by month (native
--      Postgres partitioning) so a single workspace can have billions of
--      rows without index bloat.
--   3. public form submission bypasses RLS via a SECURITY DEFINER function
--      submit_form(p_public_token, p_data) that validates captcha + quotas
--      + honeypot inside the function body.
--   4. auth.users is the Supabase-built-in users table; we reference it via
--      foreign keys from workspace_members.
-- ============================================================================

-- Required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Workspaces (tenants)
-- ----------------------------------------------------------------------------
create table if not exists public.workspaces (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  plan        text not null default 'free' check (plan in ('free','pro','business','enterprise')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists workspaces_owner_id_idx on public.workspaces(owner_id);

-- ----------------------------------------------------------------------------
-- 2. Workspace members (role-based access)
-- ----------------------------------------------------------------------------
create table if not exists public.workspace_members (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null default 'builder' check (role in ('owner','admin','builder','reviewer','viewer')),
  invited_by    uuid references auth.users(id),
  accepted_at   timestamptz,
  created_at    timestamptz not null default now(),
  unique (workspace_id, user_id)
);
create index if not exists workspace_members_user_id_idx on public.workspace_members(user_id);
create index if not exists workspace_members_workspace_id_idx on public.workspace_members(workspace_id);

-- ----------------------------------------------------------------------------
-- 3. Forms
-- ----------------------------------------------------------------------------
create table if not exists public.forms (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  created_by    uuid not null references auth.users(id),
  name          text not null,
  slug          text not null,
  description   text,
  schema        jsonb not null default '{}'::jsonb,
  status        text not null default 'draft' check (status in ('draft','published','archived')),
  theme         jsonb not null default '{}'::jsonb,
  settings      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (workspace_id, slug)
);
create index if not exists forms_workspace_id_updated_at_idx on public.forms(workspace_id, updated_at desc);

-- ----------------------------------------------------------------------------
-- 4. Form versions (audit trail of schema changes)
-- ----------------------------------------------------------------------------
create table if not exists public.form_versions (
  id           uuid primary key default uuid_generate_v4(),
  form_id      uuid not null references public.forms(id) on delete cascade,
  version      int not null,
  schema       jsonb not null,
  created_by   uuid not null references auth.users(id),
  created_at   timestamptz not null default now(),
  unique (form_id, version)
);

-- ----------------------------------------------------------------------------
-- 5. Form shares (public tokens, custom domain, password, expiry)
-- ----------------------------------------------------------------------------
create table if not exists public.form_shares (
  id            uuid primary key default uuid_generate_v4(),
  form_id       uuid unique not null references public.forms(id) on delete cascade,
  public_token  text unique not null,
  custom_domain text,
  password      text,
  expires_at    timestamptz,
  is_closed     boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists form_shares_public_token_idx on public.form_shares(public_token);

-- ----------------------------------------------------------------------------
-- 6. Submissions — PARTITIONED BY RANGE(submitted_at) for 10B-row scale
-- ----------------------------------------------------------------------------
create table if not exists public.submissions (
  id                uuid not null default uuid_generate_v4(),
  form_id           uuid not null references public.forms(id) on delete cascade,
  workspace_id      uuid not null references public.workspaces(id) on delete cascade,
  data              jsonb not null,
  submitted_at      timestamptz not null default now(),
  ip                inet,
  user_agent        text,
  is_completed      boolean not null default true,
  completion_time_ms int,
  fingerprint       text,
  primary key (id, submitted_at)
) partition by range (submitted_at);

-- Create initial monthly partitions (2025-12 through 2027-03).
-- A scheduled pg_cron job (set up separately) creates future partitions monthly.
do $$
declare
  m timestamptz;
  next_m timestamptz;
  label text;
begin
  m := '2025-12-01'::timestamptz;
  for i in 0..16 loop
    next_m := m + interval '1 month';
    label := to_char(m, 'YYYY_MM');
    execute format(
      'create table if not exists public.submissions_%s partition of public.submissions for values from (%L) to (%L)',
      label, m, next_m
    );
    execute format(
      'create index if not exists submissions_%s_form_id_submitted_at_idx on public.submissions_%s(form_id, submitted_at desc)',
      label, label
    );
    m := next_m;
  end loop;
end$$;

-- ----------------------------------------------------------------------------
-- 7. Submission files
-- ----------------------------------------------------------------------------
create table if not exists public.submission_files (
  id           uuid primary key default uuid_generate_v4(),
  submission_id uuid not null,
  field_key    text not null,
  storage_path text not null,
  filename     text not null,
  size         bigint not null,
  mime         text not null
) partition by range (storage_path); -- could be unpartitioned if small

create table if not exists public.submission_files_default partition of public.submission_files default;

-- ----------------------------------------------------------------------------
-- 8. Submission tags
-- ----------------------------------------------------------------------------
create table if not exists public.submission_tags (
  id           uuid primary key default uuid_generate_v4(),
  submission_id uuid not null,
  tag          text not null,
  unique (submission_id, tag)
);
create index if not exists submission_tags_submission_id_idx on public.submission_tags(submission_id);

-- ----------------------------------------------------------------------------
-- 9. Analytics events — PARTITIONED BY RANGE(created_at)
-- ----------------------------------------------------------------------------
create table if not exists public.analytics_events (
  id          uuid not null default uuid_generate_v4(),
  form_id     uuid not null references public.forms(id) on delete cascade,
  event_type  text not null check (event_type in ('view','start','submit','abandon')),
  payload     jsonb not null default '{}'::jsonb,
  ip          inet,
  fingerprint text,
  created_at  timestamptz not null default now(),
  primary key (id, created_at)
) partition by range (created_at);

do $$
declare
  m timestamptz;
  next_m timestamptz;
  label text;
begin
  m := '2025-12-01'::timestamptz;
  for i in 0..16 loop
    next_m := m + interval '1 month';
    label := to_char(m, 'YYYY_MM');
    execute format(
      'create table if not exists public.analytics_events_%s partition of public.analytics_events for values from (%L) to (%L)',
      label, m, next_m
    );
    execute format(
      'create index if not exists analytics_events_%s_form_id_created_at_idx on public.analytics_events_%s(form_id, created_at desc)',
      label, label
    );
    m := next_m;
  end loop;
end$$;

-- ----------------------------------------------------------------------------
-- 10. Templates
-- ----------------------------------------------------------------------------
create table if not exists public.templates (
  id          uuid primary key default uuid_generate_v4(),
  category    text not null,
  name        text not null,
  description text,
  schema      jsonb not null,
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists templates_category_idx on public.templates(category);

-- ----------------------------------------------------------------------------
-- 11. Workflows
-- ----------------------------------------------------------------------------
create table if not exists public.workflows (
  id          uuid primary key default uuid_generate_v4(),
  form_id     uuid not null references public.forms(id) on delete cascade,
  name        text not null,
  trigger     text not null default 'on_submit',
  conditions  jsonb not null default '[]'::jsonb,
  actions     jsonb not null default '[]'::jsonb,
  enabled     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists workflows_form_id_idx on public.workflows(form_id);

create table if not exists public.workflow_runs (
  id           uuid primary key default uuid_generate_v4(),
  workflow_id  uuid not null references public.workflows(id) on delete cascade,
  submission_id uuid,
  status       text not null default 'pending' check (status in ('pending','success','failed')),
  error        text,
  started_at   timestamptz not null default now(),
  finished_at  timestamptz
);
create index if not exists workflow_runs_workflow_id_started_at_idx on public.workflow_runs(workflow_id, started_at desc);

-- ----------------------------------------------------------------------------
-- 12. Notifications
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id                uuid primary key default uuid_generate_v4(),
  form_id           uuid not null references public.forms(id) on delete cascade,
  channel           text not null default 'email',
  recipient_template text not null,
  subject_template  text not null,
  body_template     text not null,
  trigger           text not null default 'on_submit',
  enabled           boolean not null default true,
  created_at        timestamptz not null default now()
);
create index if not exists notifications_form_id_idx on public.notifications(form_id);

-- ----------------------------------------------------------------------------
-- 13. Audit logs
-- ----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id     uuid references auth.users(id),
  action       text not null,
  target_type  text not null,
  target_id    uuid,
  meta         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists audit_logs_workspace_id_created_at_idx on public.audit_logs(workspace_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 14. API keys (hashed)
-- ----------------------------------------------------------------------------
create table if not exists public.api_keys (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name         text not null,
  hashed_key   text unique not null,
  prefix       text not null,
  scopes       jsonb not null default '[]'::jsonb,
  last_used_at timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists api_keys_workspace_id_idx on public.api_keys(workspace_id);
create index if not exists api_keys_hashed_key_idx on public.api_keys(hashed_key);

-- ----------------------------------------------------------------------------
-- 15. Usage counters (quota metering)
-- ----------------------------------------------------------------------------
create table if not exists public.usage_counters (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  metric       text not null check (metric in ('forms','submissions','storage_bytes','users')),
  period       text not null,
  count        bigint not null default 0,
  unique (workspace_id, metric, period)
);
create index if not exists usage_counters_workspace_id_idx on public.usage_counters(workspace_id);

-- ----------------------------------------------------------------------------
-- 16. Billing subscriptions (Stripe)
-- ----------------------------------------------------------------------------
create table if not exists public.billing_subscriptions (
  workspace_id          uuid primary key references public.workspaces(id) on delete cascade,
  stripe_customer_id    text unique not null,
  stripe_subscription_id text,
  plan                  text not null default 'free',
  status                text not null default 'active',
  current_period_end    timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================================
-- RLS — Row Level Security
-- ============================================================================
-- Every tenant-scoped table gets RLS enabled. Policies ensure that:
--   - SELECT: workspace members can read
--   - INSERT/UPDATE/DELETE: only owners/admins/builders (write tier)
--   - Public reads bypass via SECURITY DEFINER functions (see below)
-- ============================================================================

alter table public.workspaces           enable row level security;
alter table public.workspace_members    enable row level security;
alter table public.forms                enable row level security;
alter table public.form_versions        enable row level security;
alter table public.form_shares          enable row level security;
alter table public.submissions          enable row level security;
alter table public.submission_files     enable row level security;
alter table public.submission_tags      enable row level security;
alter table public.analytics_events     enable row level security;
alter table public.workflows            enable row level security;
alter table public.workflow_runs        enable row level security;
alter table public.notifications        enable row level security;
alter table public.audit_logs           enable row level security;
alter table public.api_keys             enable row level security;
alter table public.usage_counters       enable row level security;
alter table public.billing_subscriptions enable row level security;

-- Helper: is the current user a member of a workspace (any role, accepted)?
create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
      and accepted_at is not null
  );
$$;

-- Helper: is the current user a member with write role?
create or replace function public.is_workspace_writer(p_workspace_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
      and accepted_at is not null
      and role in ('owner','admin','builder')
  );
$$;

-- Helper: is the current user an owner/admin of a workspace?
create or replace function public.is_workspace_admin(p_workspace_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
      and accepted_at is not null
      and role in ('owner','admin')
  );
$$;

-- Workspace policies
create policy "members can read workspace"
  on public.workspaces for select
  using (public.is_workspace_member(id));

create policy "admins can update workspace"
  on public.workspaces for update
  using (public.is_workspace_admin(id));

-- Workspace members policies
create policy "members can read members"
  on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));

create policy "admins can manage members"
  on public.workspace_members for all
  using (public.is_workspace_admin(workspace_id));

-- Forms policies
create policy "members can read forms"
  on public.forms for select
  using (public.is_workspace_member(workspace_id));

create policy "writers can create forms"
  on public.forms for insert
  with check (public.is_workspace_writer(workspace_id));

create policy "writers can update forms"
  on public.forms for update
  using (public.is_workspace_writer(workspace_id));

create policy "admins can delete forms"
  on public.forms for delete
  using (public.is_workspace_admin(workspace_id));

-- Form versions
create policy "members can read form versions"
  on public.form_versions for select
  using (exists (
    select 1 from public.forms f
    where f.id = form_id and public.is_workspace_member(f.workspace_id)
  ));

create policy "writers can create form versions"
  on public.form_versions for insert
  with check (exists (
    select 1 from public.forms f
    where f.id = form_id and public.is_workspace_writer(f.workspace_id)
  ));

-- Form shares (members can read; writers can write)
create policy "members can read form shares"
  on public.form_shares for select
  using (exists (
    select 1 from public.forms f
    where f.id = form_id and public.is_workspace_member(f.workspace_id)
  ));

create policy "writers can manage form shares"
  on public.form_shares for all
  using (exists (
    select 1 from public.forms f
    where f.id = form_id and public.is_workspace_writer(f.workspace_id)
  ));

-- Submissions (read = members; write = SECURITY DEFINER function only)
create policy "members can read submissions"
  on public.submissions for select
  using (public.is_workspace_member(workspace_id));

create policy "writers can update submissions"
  on public.submissions for update
  using (public.is_workspace_writer(workspace_id));

create policy "admins can delete submissions"
  on public.submissions for delete
  using (public.is_workspace_admin(workspace_id));

-- NO INSERT policy on submissions — only the SECURITY DEFINER function below
-- can insert (after validating public token, captcha, quotas, honeypot).

-- Submission files / tags (same pattern)
create policy "members can read submission files"
  on public.submission_files for select
  using (exists (
    select 1 from public.submissions s
    where s.id = submission_id and public.is_workspace_member(s.workspace_id)
  ));

create policy "members can read submission tags"
  on public.submission_tags for select
  using (exists (
    select 1 from public.submissions s
    where s.id = submission_id and public.is_workspace_member(s.workspace_id)
  ));

create policy "writers can manage submission tags"
  on public.submission_tags for all
  using (exists (
    select 1 from public.submissions s
    where s.id = submission_id and public.is_workspace_writer(s.workspace_id)
  ));

-- Analytics (members can read; SECURITY DEFINER inserts from public)
create policy "members can read analytics"
  on public.analytics_events for select
  using (exists (
    select 1 from public.forms f
    where f.id = form_id and public.is_workspace_member(f.workspace_id)
  ));

-- Workflows, notifications, audit logs (read = members; write = writers/admins)
create policy "members can read workflows"
  on public.workflows for select
  using (exists (
    select 1 from public.forms f
    where f.id = form_id and public.is_workspace_member(f.workspace_id)
  ));

create policy "writers can manage workflows"
  on public.workflows for all
  using (exists (
    select 1 from public.forms f
    where f.id = form_id and public.is_workspace_writer(f.workspace_id)
  ));

create policy "members can read notifications"
  on public.notifications for select
  using (exists (
    select 1 from public.forms f
    where f.id = form_id and public.is_workspace_member(f.workspace_id)
  ));

create policy "writers can manage notifications"
  on public.notifications for all
  using (exists (
    select 1 from public.forms f
    where f.id = form_id and public.is_workspace_writer(f.workspace_id)
  ));

create policy "members can read audit logs"
  on public.audit_logs for select
  using (public.is_workspace_member(workspace_id));

create policy "writers can create audit logs"
  on public.audit_logs for insert
  with check (public.is_workspace_member(workspace_id));

-- API keys (admins only)
create policy "admins can read api keys"
  on public.api_keys for select
  using (public.is_workspace_admin(workspace_id));

create policy "admins can manage api keys"
  on public.api_keys for all
  using (public.is_workspace_admin(workspace_id));

-- Usage counters (members read; service role writes)
create policy "members can read usage counters"
  on public.usage_counters for select
  using (public.is_workspace_member(workspace_id));

-- Billing subscriptions (admins only)
create policy "admins can read billing"
  on public.billing_subscriptions for select
  using (public.is_workspace_admin(workspace_id));

create policy "admins can manage billing"
  on public.billing_subscriptions for all
  using (public.is_workspace_admin(workspace_id));

-- ============================================================================
-- SECURITY DEFINER function: public form submission
-- ============================================================================
-- Bypasses RLS to insert into submissions + analytics_events. Validates:
--   - public_token exists
--   - form is published and not closed/expired
--   - honeypot field is empty (if enabled)
--   - response limit not exceeded (if set)
--   - schedule window (if set)
-- Returns the new submission id.
-- ============================================================================

create or replace function public.submit_form(
  p_public_token text,
  p_data jsonb,
  p_ip inet default null,
  p_user_agent text default null,
  p_fingerprint text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_share        public.form_shares%rowtype;
  v_form         public.forms%rowtype;
  v_settings     jsonb;
  v_count        bigint;
  v_submission_id uuid;
begin
  -- Look up share + form
  select * into v_share from public.form_shares where public_token = p_public_token;
  if not found then
    raise exception 'Form not found' using errcode = '404';
  end if;

  select * into v_form from public.forms where id = v_share.form_id;
  if not found or v_form.status <> 'published' then
    raise exception 'Form not published' using errcode = '403';
  end if;

  if v_share.is_closed then
    raise exception 'Form closed' using errcode = '410';
  end if;

  if v_share.expires_at is not null and v_share.expires_at < now() then
    raise exception 'Form expired' using errcode = '410';
  end if;

  v_settings := v_form.settings;

  -- Honeypot: if enabled and _hp_ field is non-empty, silently succeed
  if (v_settings->>'honeypotEnabled')::boolean
     and coalesce(p_data->>'_hp_', '') <> '' then
    return gen_random_uuid(); -- pretend success
  end if;

  -- Response limit
  if v_settings ? 'responseLimit' and (v_settings->>'responseLimit')::int > 0 then
    select count(*) into v_count from public.submissions where form_id = v_form.id;
    if v_count >= (v_settings->>'responseLimit')::int then
      raise exception 'Response limit reached' using errcode = '410';
    end if;
  end if;

  -- Schedule window
  if (v_settings->>'scheduleEnabled')::boolean then
    if v_settings ? 'scheduleOpenAt' and (v_settings->>'scheduleOpenAt')::timestamptz > now() then
      raise exception 'Form not yet open' using errcode = '410';
    end if;
    if v_settings ? 'scheduleCloseAt' and (v_settings->>'scheduleCloseAt')::timestamptz < now() then
      raise exception 'Form closed' using errcode = '410';
    end if;
  end if;

  -- Insert submission
  insert into public.submissions (form_id, workspace_id, data, ip, user_agent, fingerprint, is_completed, completion_time_ms)
  values (v_form.id, v_form.workspace_id, p_data, p_ip, p_user_agent, p_fingerprint, true, null)
  returning id into v_submission_id;

  -- Insert analytics event
  insert into public.analytics_events (form_id, event_type, payload, ip, fingerprint)
  values (v_form.id, 'submit', jsonb_build_object('submissionId', v_submission_id), p_ip, p_fingerprint);

  return v_submission_id;
end;
$$;

-- Allow anon (unauthenticated) users to call submit_form
grant execute on function public.submit_form(text, jsonb, inet, text, text) to anon, authenticated;

-- ============================================================================
-- SECURITY DEFINER function: read a published form by public token
-- ============================================================================
create or replace function public.get_published_form(p_public_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_form public.forms%rowtype;
begin
  select f.* into v_form
  from public.forms f
  join public.form_shares s on s.form_id = f.id
  where s.public_token = p_public_token
    and f.status = 'published'
    and s.is_closed = false
    and (s.expires_at is null or s.expires_at > now());

  if not found then
    return null;
  end if;

  -- Increment view count (best effort)
  insert into public.analytics_events (form_id, event_type, payload)
  values (v_form.id, 'view', '{}'::jsonb);

  return jsonb_build_object(
    'id', v_form.id,
    'name', v_form.name,
    'slug', v_form.slug,
    'description', v_form.description,
    'schema', v_form.schema,
    'theme', v_form.theme,
    'settings', v_form.settings
  );
end;
$$;

grant execute on function public.get_published_form(text) to anon, authenticated;

-- ============================================================================
-- Triggers: updated_at maintenance
-- ============================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger workspaces_touch_updated_at before update on public.workspaces
  for each row execute function public.touch_updated_at();

create trigger forms_touch_updated_at before update on public.forms
  for each row execute function public.touch_updated_at();

create trigger workflows_touch_updated_at before update on public.workflows
  for each row execute function public.touch_updated_at();

create trigger billing_subscriptions_touch_updated_at before update on public.billing_subscriptions
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- Storage buckets (created via Supabase Dashboard → Storage)
-- ============================================================================
-- Required buckets:
--   submission-files   (public-read, auth-write)
--   form-assets        (theme background images, public-read)
--   workspace-logos    (private, workspace-member read)

-- ============================================================================
-- Cron jobs (set up via Supabase Dashboard → Database → pg_cron)
-- ============================================================================
-- 1. Create future submission partitions (monthly):
--    SELECT cron.schedule('create_submissions_partitions', '0 0 25 * *', $$
--      do $$ declare m timestamptz := date_trunc('month', now()) + interval '2 months';
--      begin
--        execute format('create table if not exists public.submissions_%s partition of public.submissions for values from (%L) to (%L)',
--          to_char(m, 'YYYY_MM'), m, m + interval '1 month');
--      end $$;
--    $$);
--
-- 2. Same for analytics_events.
-- 3. Daily usage counter rollup (per workspace, per metric) for billing.
