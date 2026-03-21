-- Sales Team AI - Database Schema
-- Run this in the Supabase SQL Editor to set up your database

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  company_name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. ICPS (Ideal Customer Profiles)
-- ============================================================

create table if not exists public.icps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  industry text[] default '{}',
  company_size_min integer,
  company_size_max integer,
  revenue_min numeric,
  revenue_max numeric,
  job_titles text[] default '{}',
  locations text[] default '{}',
  technologies text[] default '{}',
  keywords text[] default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.icps enable row level security;

create policy "Users can view own ICPs"
  on public.icps for select
  using (auth.uid() = user_id);

create policy "Users can create own ICPs"
  on public.icps for insert
  with check (auth.uid() = user_id);

create policy "Users can update own ICPs"
  on public.icps for update
  using (auth.uid() = user_id);

create policy "Users can delete own ICPs"
  on public.icps for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3. LEADS
-- ============================================================

create type public.lead_status as enum ('new', 'contacted', 'qualified', 'unqualified', 'converted');
create type public.lead_source as enum ('ai_generated', 'manual', 'imported');

create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  icp_id uuid references public.icps(id) on delete set null,
  company_name text not null,
  company_website text,
  company_industry text,
  company_size text,
  company_revenue text,
  company_location text,
  company_description text,
  contact_name text,
  contact_title text,
  contact_email text,
  contact_phone text,
  contact_linkedin text,
  prospect_id uuid references public.prospects(id) on delete set null,
  ai_score integer check (ai_score >= 0 and ai_score <= 100),
  ai_score_reasons jsonb,
  status public.lead_status default 'new' not null,
  source public.lead_source default 'manual' not null,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.leads enable row level security;

create policy "Users can view own leads"
  on public.leads for select
  using (auth.uid() = user_id);

create policy "Users can create own leads"
  on public.leads for insert
  with check (auth.uid() = user_id);

create policy "Users can update own leads"
  on public.leads for update
  using (auth.uid() = user_id);

create policy "Users can delete own leads"
  on public.leads for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index if not exists idx_leads_user_id on public.leads(user_id);
create index if not exists idx_leads_icp_id on public.leads(icp_id);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_ai_score on public.leads(ai_score desc);

-- ============================================================
-- 4. LEAD ACTIVITIES
-- ============================================================

create table if not exists public.lead_activities (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references public.leads(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action text not null,
  details jsonb,
  created_at timestamptz default now() not null
);

alter table public.lead_activities enable row level security;

create policy "Users can view own lead activities"
  on public.lead_activities for select
  using (auth.uid() = user_id);

create policy "Users can create own lead activities"
  on public.lead_activities for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- 5. AUTO-UPDATE updated_at TRIGGER
-- ============================================================

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger update_icps_updated_at
  before update on public.icps
  for each row execute procedure public.update_updated_at();

create trigger update_leads_updated_at
  before update on public.leads
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- 6. WHITELISTED EMAILS (for team access control)
-- ============================================================

create table if not exists public.whitelisted_emails (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now() not null
);

alter table public.whitelisted_emails enable row level security;

-- Only allow reading whitelisted emails (during signup check)
create policy "Anyone can read whitelisted emails"
  on public.whitelisted_emails for select
  to authenticated
  using (true);

-- ============================================================
-- 7. PROSPECTS (for AI agent analysis pipeline)
-- ============================================================

create table if not exists public.prospects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  company_name text not null,
  prospect_name text,
  website_url text,
  website_text text,
  contact_email text,
  contact_name text,
  contact_title text,
  linkedin_url text,
  linkedin_text text,
  notes text,
  stage text default 'research',
  prospect_intel jsonb,
  pre_call_brief text,
  call_transcript text,
  call_analysis text,
  proposal text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.prospects enable row level security;

create policy "Users can view own prospects"
  on public.prospects for select
  using (auth.uid() = user_id);

create policy "Users can create own prospects"
  on public.prospects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own prospects"
  on public.prospects for update
  using (auth.uid() = user_id);

create policy "Users can delete own prospects"
  on public.prospects for delete
  using (auth.uid() = user_id);

create index if not exists idx_prospects_user_id on public.prospects(user_id);

create trigger update_prospects_updated_at
  before update on public.prospects
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- 8. AGENT RESULTS (AI pipeline outputs)
-- ============================================================

create type public.prospect_priority as enum ('HOT', 'WARM', 'COLD');

create table if not exists public.agent_results (
  id uuid default gen_random_uuid() primary key,
  prospect_id uuid references public.prospects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  research_output text,
  analysis_output text,
  outreach_output text,
  coordinator_output text,
  icp_score integer check (icp_score >= 1 and icp_score <= 10),
  timing_score integer check (timing_score >= 1 and timing_score <= 10),
  priority public.prospect_priority,
  created_at timestamptz default now() not null
);

alter table public.agent_results enable row level security;

create policy "Users can view own agent results"
  on public.agent_results for select
  using (auth.uid() = user_id);

create policy "Users can create own agent results"
  on public.agent_results for insert
  with check (auth.uid() = user_id);

create index if not exists idx_agent_results_prospect_id on public.agent_results(prospect_id);
create index if not exists idx_agent_results_user_id on public.agent_results(user_id);
create index if not exists idx_agent_results_priority on public.agent_results(priority);

-- ============================================================
-- 9. MIGRATION: extend prospects (Verymuch sales agents v2)
-- Run once on existing databases that already had prospects table.
-- ============================================================

alter table public.prospects add column if not exists prospect_name text;
alter table public.prospects add column if not exists website_text text;
alter table public.prospects add column if not exists linkedin_text text;
alter table public.prospects add column if not exists stage text default 'research';
alter table public.prospects add column if not exists prospect_intel jsonb;
alter table public.prospects add column if not exists pre_call_brief text;
alter table public.prospects add column if not exists call_analysis text;
alter table public.prospects add column if not exists proposal text;
alter table public.prospects add column if not exists call_transcript text;

alter table public.leads add column if not exists prospect_id uuid references public.prospects(id) on delete set null;
create index if not exists idx_leads_prospect_id on public.leads(prospect_id);

-- ============================================================
-- 10. WHITELIST RPC + additional_context (Pasada 3)
-- Ejecutar en Supabase SQL Editor si aún no existen.
-- ============================================================

alter table public.prospects add column if not exists additional_context text;

-- Comprueba si el email está en whitelisted_emails (usa SECURITY DEFINER para no exponer la tabla vía RLS)
create or replace function public.is_email_whitelisted(check_email text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.whitelisted_emails
    where lower(trim(email)) = lower(trim(check_email))
  );
$$;

grant execute on function public.is_email_whitelisted(text) to anon, authenticated;

-- Emails del equipo (ajusta según tu lista). Ejemplo:
-- insert into public.whitelisted_emails (email) values ('jorge@verymuch.ai'), ('info@verymuch.ai')
-- on conflict (email) do nothing;
