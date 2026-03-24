-- ============================================================
-- prospect_call_sessions — historial de llamadas por prospecto
-- Una fila por transcripción/análisis. Permite múltiples llamadas
-- por prospecto y separa el historial de la fila principal en prospects.
-- ============================================================

create table if not exists public.prospect_call_sessions (
  id            uuid default gen_random_uuid() primary key,
  prospect_id   uuid references public.prospects(id) on delete cascade not null,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  session_number  integer not null default 1,
  session_label   text,
  call_transcript text,
  call_analysis   text,
  prior_context_summary text,
  call_date       timestamptz,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

alter table public.prospect_call_sessions enable row level security;

-- Shared-team RLS (same pattern as prospects)
create policy "Team can view call sessions"
  on public.prospect_call_sessions for select
  to authenticated
  using (true);

create policy "Users can create own call sessions"
  on public.prospect_call_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own call sessions"
  on public.prospect_call_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own call sessions"
  on public.prospect_call_sessions for delete
  using (auth.uid() = user_id);

create index if not exists idx_call_sessions_prospect_id
  on public.prospect_call_sessions(prospect_id);

create index if not exists idx_call_sessions_user_id
  on public.prospect_call_sessions(user_id);

-- Auto-update updated_at
create or replace trigger update_call_sessions_updated_at
  before update on public.prospect_call_sessions
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- MIGRACIÓN: mover transcripts existentes de prospects
-- a prospect_call_sessions como sesión 1.
-- Solo inserta si el prospecto todavía no tiene sesiones.
-- ============================================================

insert into public.prospect_call_sessions (
  prospect_id,
  user_id,
  session_number,
  session_label,
  call_transcript,
  call_analysis,
  call_date,
  created_at,
  updated_at
)
select
  p.id            as prospect_id,
  p.user_id,
  1               as session_number,
  'Llamada 1'     as session_label,
  p.call_transcript,
  p.call_analysis,
  coalesce(p.updated_at, p.created_at) as call_date,
  now()           as created_at,
  now()           as updated_at
from public.prospects p
where p.call_transcript is not null
  and trim(p.call_transcript) != ''
  and not exists (
    select 1
    from public.prospect_call_sessions pcs
    where pcs.prospect_id = p.id
  );
