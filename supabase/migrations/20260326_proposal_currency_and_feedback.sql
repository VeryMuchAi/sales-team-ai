-- Migration: Proposal currency selector + feedback learning
-- Run once in Supabase SQL Editor

-- ============================================================
-- 1. Add proposal_currency to prospects
-- ============================================================

alter table public.prospects
  add column if not exists proposal_currency text default 'USD';

-- ============================================================
-- 2. proposal_feedback — stores user improvements per prospect
--    so the agent can learn from them in future regenerations
-- ============================================================

create table if not exists public.proposal_feedback (
  id             uuid default gen_random_uuid() primary key,
  prospect_id    uuid references public.prospects(id) on delete cascade not null,
  user_id        uuid references public.profiles(id)  on delete cascade not null,
  feedback       text not null,
  improved_proposal text,
  currency       text default 'USD',
  created_at     timestamptz default now() not null
);

alter table public.proposal_feedback enable row level security;

create policy "Users can view own proposal feedback"
  on public.proposal_feedback for select
  using (auth.uid() = user_id);

create policy "Users can create own proposal feedback"
  on public.proposal_feedback for insert
  with check (auth.uid() = user_id);

create index if not exists idx_proposal_feedback_prospect_id on public.proposal_feedback(prospect_id);
create index if not exists idx_proposal_feedback_user_id     on public.proposal_feedback(user_id);
