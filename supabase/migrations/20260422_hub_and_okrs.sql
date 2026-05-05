-- =============================================================================
-- Verymuch.ai Hub + OKR Command Center
-- Migration: crea hub_applications, talent_profiles, talent_certifications,
-- legal_documents, okrs, key_results, okr_updates + funciones + triggers + RLS.
-- Idempotente: segura de correr más de una vez.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extender profiles con role (founder | admin | user)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists role text
  default 'user'
  check (role in ('user', 'admin', 'founder'));

create index if not exists idx_profiles_role on public.profiles(role);

-- Helper: ¿el usuario autenticado actual es founder?
create or replace function public.is_founder()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'founder'
  );
$$;

grant execute on function public.is_founder() to authenticated;

-- ============================================================
-- 1. HUB APPLICATIONS
-- ============================================================
create table if not exists public.hub_applications (
  id uuid default gen_random_uuid() primary key,

  -- Identidad
  full_name text not null,
  email text not null,
  linkedin_url text not null,
  country text not null,
  city text not null,

  -- Skills
  languages text[] not null default '{}',
  stack text[] not null default '{}',
  years_with_llms numeric,
  claude_experience text not null check (claude_experience in ('yes', 'no', 'learning')),
  portfolio_url text,

  -- Disponibilidad y económicas
  weekly_hours_min int,
  weekly_hours_max int,
  hourly_rate_min_usd numeric,
  hourly_rate_max_usd numeric,

  -- Contexto libre
  summary text not null,
  referral_source text not null,
  referral_details text,

  -- Evaluación automática
  score int check (score >= 0 and score <= 100),
  score_breakdown jsonb,
  recommendation text check (recommendation in ('auto_advance', 'human_review', 'polite_reject')),
  evaluated_at timestamptz,
  evaluated_by_model text,

  -- Workflow
  status text not null default 'pending_review' check (status in (
    'pending_review',
    'ready_for_interview',
    'human_review',
    'polite_rejected',
    'accepted_pending_setup',
    'active_in_certification',
    'certification_in_progress',
    'certified',
    'available_for_projects',
    'engaged_with_client',
    'inactive',
    'withdrawn'
  )),

  -- Meta
  admin_notes text,
  source_ip inet,
  user_agent text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_hub_applications_status on public.hub_applications(status);
create index if not exists idx_hub_applications_email on public.hub_applications(lower(email));
create index if not exists idx_hub_applications_created_at on public.hub_applications(created_at desc);
create index if not exists idx_hub_applications_score on public.hub_applications(score desc) where score is not null;

drop trigger if exists update_hub_applications_updated_at on public.hub_applications;
create trigger update_hub_applications_updated_at
  before update on public.hub_applications
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- 2. TALENT PROFILES (post-aceptación)
-- ============================================================
create table if not exists public.talent_profiles (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references public.hub_applications(id) on delete cascade not null unique,

  -- Email corporativo asignado
  assigned_email text unique,
  email_tier text check (email_tier in ('workspace', 'zoho_lite', 'external')),

  -- Flags de rol
  is_core_team boolean default false,
  is_strategic_partner boolean default false,

  -- Token de onboarding (self-service firmas)
  onboarding_token text unique,
  onboarding_token_expires_at timestamptz,
  onboarding_completed_at timestamptz,

  -- Examen CCA
  exam_scheduled_at timestamptz,
  exam_result text check (exam_result in ('pass', 'fail', 'not_taken')) default 'not_taken',
  exam_score int,
  exam_date date,
  credential_storage_path text,

  -- Asignaciones
  assigned_projects text[] default '{}',

  -- Notas internas
  internal_notes text,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_talent_profiles_application_id on public.talent_profiles(application_id);
create index if not exists idx_talent_profiles_assigned_email on public.talent_profiles(assigned_email) where assigned_email is not null;
create index if not exists idx_talent_profiles_onboarding_token on public.talent_profiles(onboarding_token) where onboarding_token is not null;

drop trigger if exists update_talent_profiles_updated_at on public.talent_profiles;
create trigger update_talent_profiles_updated_at
  before update on public.talent_profiles
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- 3. TALENT CERTIFICATIONS (progreso curso a curso)
-- ============================================================
create table if not exists public.talent_certifications (
  id uuid default gen_random_uuid() primary key,
  talent_profile_id uuid references public.talent_profiles(id) on delete cascade not null,
  course_slug text not null,
  course_name text not null,
  completed boolean default false not null,
  completed_at timestamptz,
  certificate_url text,
  notes text,
  created_at timestamptz default now() not null,
  unique (talent_profile_id, course_slug)
);

create index if not exists idx_talent_certs_profile on public.talent_certifications(talent_profile_id);
create index if not exists idx_talent_certs_completed on public.talent_certifications(completed);

-- ============================================================
-- 4. LEGAL DOCUMENTS (Acuerdos + NDA firmados)
-- ============================================================
create table if not exists public.legal_documents (
  id uuid default gen_random_uuid() primary key,
  talent_profile_id uuid references public.talent_profiles(id) on delete cascade not null,
  document_type text not null check (document_type in ('talent_agreement', 'nda', 'amendment')),
  version text not null,
  effective_date date not null,
  storage_path text not null,              -- e.g. legal-docs/{talent_id}/talent_agreement-v1-signed.pdf
  checksum text not null,                   -- sha256 hex del PDF firmado
  signed_at timestamptz not null,
  signed_name text not null,                -- firma tipada
  signed_ip inet not null,
  signed_user_agent text,
  created_at timestamptz default now() not null
);

create index if not exists idx_legal_docs_profile on public.legal_documents(talent_profile_id);
create index if not exists idx_legal_docs_type on public.legal_documents(document_type);

-- ============================================================
-- 5. OKRs + KEY RESULTS + UPDATES
-- ============================================================
create table if not exists public.okrs (
  id uuid default gen_random_uuid() primary key,
  quarter text not null,                    -- 'Q2-2026'
  objective text not null,
  owner text not null,                      -- 'edwin' | 'jorge' | 'shared'
  category text not null check (category in ('revenue', 'partnership', 'pipeline', 'content', 'seo', 'other')),
  status text not null default 'on_track' check (status in ('on_track', 'at_risk', 'behind', 'achieved')),
  weight int not null default 1 check (weight between 1 and 5),
  sort_order int default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_okrs_quarter on public.okrs(quarter);
create index if not exists idx_okrs_status on public.okrs(status);

drop trigger if exists update_okrs_updated_at on public.okrs;
create trigger update_okrs_updated_at
  before update on public.okrs
  for each row execute procedure public.update_updated_at();

create table if not exists public.key_results (
  id uuid default gen_random_uuid() primary key,
  okr_id uuid references public.okrs(id) on delete cascade not null,
  description text not null,
  metric_type text not null check (metric_type in ('count', 'currency', 'percentage', 'boolean')),
  target_value numeric not null,
  current_value numeric not null default 0,
  unit text not null default '',
  data_source text not null default 'manual' check (data_source in ('manual', 'auto_hub', 'auto_stripe', 'auto_supabase_query')),
  auto_query text,
  last_updated_at timestamptz default now() not null,
  updated_by uuid references public.profiles(id) on delete set null,
  sort_order int default 0,
  created_at timestamptz default now() not null,
  unique (okr_id, sort_order)
);

create index if not exists idx_key_results_okr_id on public.key_results(okr_id);
create index if not exists idx_key_results_data_source on public.key_results(data_source);

create table if not exists public.okr_updates (
  id uuid default gen_random_uuid() primary key,
  key_result_id uuid references public.key_results(id) on delete cascade not null,
  previous_value numeric not null,
  new_value numeric not null,
  note text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null
);

create index if not exists idx_okr_updates_kr on public.okr_updates(key_result_id, created_at desc);

-- ============================================================
-- 6. FUNCIONES HELPER
-- ============================================================

-- Métricas agregadas del Hub (para cards del dashboard y auto-trackers)
create or replace function public.get_hub_metrics()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'total', count(*),
    'pending_review', count(*) filter (where status = 'pending_review'),
    'ready_for_interview', count(*) filter (where status = 'ready_for_interview'),
    'human_review', count(*) filter (where status = 'human_review'),
    'accepted_pending_setup', count(*) filter (where status = 'accepted_pending_setup'),
    'active_in_certification', count(*) filter (where status = 'active_in_certification'),
    'certification_in_progress', count(*) filter (where status = 'certification_in_progress'),
    'certified', count(*) filter (where status in ('certified', 'available_for_projects', 'engaged_with_client')),
    'available', count(*) filter (where status = 'available_for_projects'),
    'engaged', count(*) filter (where status = 'engaged_with_client')
  )
  from public.hub_applications;
$$;

grant execute on function public.get_hub_metrics() to authenticated;

-- Progreso ponderado agregado por quarter
create or replace function public.get_okr_progress(p_quarter text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  with kr_pct as (
    select
      o.id as okr_id,
      o.weight,
      o.status,
      coalesce(
        avg(
          case
            when kr.metric_type = 'boolean' then case when kr.current_value >= 1 then 1.0 else 0.0 end
            when kr.target_value = 0 then 0.0
            else least(kr.current_value / kr.target_value, 1.0)
          end
        ),
        0
      ) as progress
    from public.okrs o
    left join public.key_results kr on kr.okr_id = o.id
    where o.quarter = p_quarter
    group by o.id, o.weight, o.status
  )
  select jsonb_build_object(
    'quarter', p_quarter,
    'total_okrs', count(*),
    'achieved', count(*) filter (where status = 'achieved'),
    'on_track', count(*) filter (where status = 'on_track'),
    'at_risk', count(*) filter (where status = 'at_risk'),
    'behind', count(*) filter (where status = 'behind'),
    'weighted_progress',
      case when coalesce(sum(weight), 0) = 0 then 0
      else round((sum(progress * weight) / sum(weight))::numeric, 4)
      end
  )
  from kr_pct;
$$;

grant execute on function public.get_okr_progress(text) to authenticated;

-- ============================================================
-- 7. TRIGGERS: logging + status auto-recalc
-- ============================================================

-- Cada cambio de current_value en key_results se loggea en okr_updates
create or replace function public.log_kr_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.current_value is distinct from new.current_value then
    insert into public.okr_updates (key_result_id, previous_value, new_value, updated_by)
    values (new.id, old.current_value, new.current_value, auth.uid());
    new.last_updated_at = now();
    new.updated_by = coalesce(new.updated_by, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists key_results_log_update on public.key_results;
create trigger key_results_log_update
  before update on public.key_results
  for each row execute procedure public.log_kr_update();

-- Recalcula status del OKR cuando sus KRs cambian
-- Lógica: si todos los KRs están en target → achieved
--         si progreso ponderado < 0.6 → behind
--         si progreso < 0.85 → at_risk
--         si no → on_track
create or replace function public.recalculate_okr_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_okr_id uuid;
  v_progress numeric;
  v_achieved int;
  v_total int;
  v_new_status text;
begin
  v_okr_id := coalesce(new.okr_id, old.okr_id);

  select
    coalesce(avg(
      case
        when metric_type = 'boolean' then case when current_value >= 1 then 1.0 else 0.0 end
        when target_value = 0 then 0.0
        else least(current_value / target_value, 1.0)
      end
    ), 0),
    count(*) filter (where current_value >= target_value),
    count(*)
  into v_progress, v_achieved, v_total
  from public.key_results
  where okr_id = v_okr_id;

  v_new_status := case
    when v_total > 0 and v_achieved = v_total then 'achieved'
    when v_progress < 0.6 then 'behind'
    when v_progress < 0.85 then 'at_risk'
    else 'on_track'
  end;

  update public.okrs
  set status = v_new_status, updated_at = now()
  where id = v_okr_id and status is distinct from v_new_status;

  return coalesce(new, old);
end;
$$;

drop trigger if exists key_results_recalc_status on public.key_results;
create trigger key_results_recalc_status
  after insert or update or delete on public.key_results
  for each row execute procedure public.recalculate_okr_status();

-- ============================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================

-- hub_applications: INSERT público (el form), solo founders leen/mutan
alter table public.hub_applications enable row level security;

drop policy if exists "hub_apps_insert_public" on public.hub_applications;
create policy "hub_apps_insert_public"
  on public.hub_applications for insert
  to anon, authenticated
  with check (true);

drop policy if exists "hub_apps_select_founder" on public.hub_applications;
create policy "hub_apps_select_founder"
  on public.hub_applications for select
  to authenticated
  using (public.is_founder());

drop policy if exists "hub_apps_update_founder" on public.hub_applications;
create policy "hub_apps_update_founder"
  on public.hub_applications for update
  to authenticated
  using (public.is_founder())
  with check (public.is_founder());

drop policy if exists "hub_apps_delete_founder" on public.hub_applications;
create policy "hub_apps_delete_founder"
  on public.hub_applications for delete
  to authenticated
  using (public.is_founder());

-- talent_profiles: founder-only (el onboarding self-service usa service role en el backend)
alter table public.talent_profiles enable row level security;
drop policy if exists "talent_profiles_founder_all" on public.talent_profiles;
create policy "talent_profiles_founder_all"
  on public.talent_profiles for all
  to authenticated
  using (public.is_founder())
  with check (public.is_founder());

-- talent_certifications + legal_documents: founder-only
alter table public.talent_certifications enable row level security;
drop policy if exists "talent_certs_founder_all" on public.talent_certifications;
create policy "talent_certs_founder_all"
  on public.talent_certifications for all
  to authenticated
  using (public.is_founder())
  with check (public.is_founder());

alter table public.legal_documents enable row level security;
drop policy if exists "legal_docs_founder_all" on public.legal_documents;
create policy "legal_docs_founder_all"
  on public.legal_documents for all
  to authenticated
  using (public.is_founder())
  with check (public.is_founder());

-- OKRs + KRs + updates: founder-only
alter table public.okrs enable row level security;
drop policy if exists "okrs_founder_all" on public.okrs;
create policy "okrs_founder_all"
  on public.okrs for all
  to authenticated
  using (public.is_founder())
  with check (public.is_founder());

alter table public.key_results enable row level security;
drop policy if exists "kr_founder_all" on public.key_results;
create policy "kr_founder_all"
  on public.key_results for all
  to authenticated
  using (public.is_founder())
  with check (public.is_founder());

alter table public.okr_updates enable row level security;
drop policy if exists "okr_updates_founder_select" on public.okr_updates;
create policy "okr_updates_founder_select"
  on public.okr_updates for select
  to authenticated
  using (public.is_founder());

drop policy if exists "okr_updates_founder_insert" on public.okr_updates;
create policy "okr_updates_founder_insert"
  on public.okr_updates for insert
  to authenticated
  with check (public.is_founder());

-- ============================================================
-- 9. STORAGE BUCKET: legal-docs (privado, acceso vía signed URLs)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('legal-docs', 'legal-docs', false)
on conflict (id) do nothing;

-- Policies sobre storage.objects para el bucket
drop policy if exists "legal_docs_founder_select" on storage.objects;
create policy "legal_docs_founder_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'legal-docs' and public.is_founder());

drop policy if exists "legal_docs_founder_insert" on storage.objects;
create policy "legal_docs_founder_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'legal-docs' and public.is_founder());

drop policy if exists "legal_docs_founder_delete" on storage.objects;
create policy "legal_docs_founder_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'legal-docs' and public.is_founder());

-- ============================================================
-- 10. SEED DATA — OKRs Q2-2026
-- (solo se insertan si aún no existe ese quarter)
-- ============================================================
do $seed$
declare
  v_okr_revenue uuid := '11111111-1111-1111-1111-111111111111';
  v_okr_partner uuid := '22222222-2222-2222-2222-222222222222';
  v_okr_pipe    uuid := '33333333-3333-3333-3333-333333333333';
  v_okr_content uuid := '44444444-4444-4444-4444-444444444444';
  v_okr_seo     uuid := '55555555-5555-5555-5555-555555555555';
begin
  if not exists (select 1 from public.okrs where quarter = 'Q2-2026') then
    insert into public.okrs (id, quarter, objective, owner, category, weight, sort_order) values
      (v_okr_revenue, 'Q2-2026', 'Cerrar 5+ clientes recurrentes y llegar a $10K MRR', 'shared', 'revenue', 5, 1),
      (v_okr_partner, 'Q2-2026', 'Convertir Verymuch.ai en Claude Partner certificado', 'edwin', 'partnership', 5, 2),
      (v_okr_pipe,    'Q2-2026', 'Construir pipeline cualificado de 15+ deals activos', 'jorge', 'pipeline', 4, 3),
      (v_okr_content, 'Q2-2026', 'Establecer Edwin y Jorge como voces de referencia en IA B2B hispana', 'shared', 'content', 3, 4),
      (v_okr_seo,     'Q2-2026', 'Aparecer en respuestas de Perplexity, ChatGPT y Google AI Overviews', 'edwin', 'seo', 3, 5);

    insert into public.key_results (okr_id, description, metric_type, target_value, unit, data_source, sort_order) values
      -- Revenue
      (v_okr_revenue, '$10,000 MRR',                                       'currency', 10000, '$',         'auto_stripe', 1),
      (v_okr_revenue, '5 clientes activos pagando',                        'count',    5,     'clientes',  'auto_stripe', 2),
      (v_okr_revenue, 'Konfío firmado',                                    'boolean',  1,     '',          'manual',      3),
      (v_okr_revenue, 'Pablo Garrido firmado',                             'boolean',  1,     '',          'manual',      4),

      -- Partnership
      (v_okr_partner, 'Aplicación al Claude Partner Network aprobada',     'boolean',  1,     '',          'manual',      1),
      (v_okr_partner, '10 personas con CCA bajo verymuch.ai',              'count',    10,    'personas',  'auto_hub',    2),
      (v_okr_partner, 'Listing en directorio oficial de Anthropic',        'boolean',  1,     '',          'manual',      3),

      -- Pipeline
      (v_okr_pipe,    '15 deals en stages discovery+',                     'count',    15,    'deals',     'manual',      1),
      (v_okr_pipe,    '$50K en pipeline weighted',                         'currency', 50000, '$',         'manual',      2),
      (v_okr_pipe,    '3 industrias con +2 deals cada una',                'count',    3,     'industrias','manual',      3),

      -- Content
      (v_okr_content, '24 publicaciones LinkedIn',                         'count',    24,    'posts',     'manual',      1),
      (v_okr_content, '3 artículos Excélsior publicados',                  'count',    3,     'artículos', 'manual',      2),
      (v_okr_content, '5,000 seguidores combinados',                       'count',    5000,  'seguidores','manual',      3),

      -- SEO/GEO
      (v_okr_seo,     'Score Otterly.AI ≥65',                              'count',    65,    'score',     'manual',      1),
      (v_okr_seo,     '5 menciones citadas en motores generativos',        'count',    5,     'menciones', 'manual',      2),
      (v_okr_seo,     '20 backlinks de DA≥40',                             'count',    20,    'backlinks', 'manual',      3);
  end if;
end
$seed$;

-- ============================================================
-- 11. NOTAS POST-MIGRATION (manual)
-- ============================================================
-- Después de correr esta migración:
--   1. Marcar a Edwin y Jorge como founders:
--      update public.profiles set role = 'founder'
--      where email in ('edwin@verymuch.ai', 'jorge@verymuch.ai', 'info@verymuch.ai');
--
--   2. Confirmar bucket legal-docs en Supabase Dashboard → Storage.
--
--   3. Variables de entorno necesarias (ver .env.example):
--      RESEND_API_KEY, STRIPE_SECRET_KEY, JWT_SIGNING_SECRET, CRON_SECRET,
--      SLACK_WEBHOOK_HUB, HUB_ADMIN_EMAILS, NEXT_PUBLIC_HUB_URL.
