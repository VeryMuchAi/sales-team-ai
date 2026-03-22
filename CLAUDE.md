# CLAUDE.md — Sales Team AI

## Project Overview

**Sales Team AI** is Verymuch.ai's internal sales intelligence tool. It uses a pipeline of 4 Claude AI agents to analyze prospects, score them, generate personalized outreach in Spanish, and create action plans. Built for the Verymuch.ai sales team.

**Live URL:** Deployed on Vercel (VeryMuchAi org)
**Repo:** `Morenazzo/sales-team-ai` (GitHub → auto-deploys to Vercel)

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **AI:** Anthropic Claude API (`@anthropic-ai/sdk` v0.74)
- **Database & Auth:** Supabase (Auth + PostgreSQL with RLS)
- **Web Scraping:** Cheerio for prospect website analysis
- **CSV Export:** PapaParse
- **Hosting:** Vercel (VeryMuchAi org)
- **UI Components:** shadcn/ui, Radix UI, Lucide React icons

## Project Structure

```
sales-team-ai/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          # Login/landing
│   ├── api/
│   │   ├── agents/
│   │   │   ├── research/route.ts         # Agent 1: The Researcher
│   │   │   ├── analysis/route.ts         # Agent 2: The Analyst
│   │   │   ├── outreach/route.ts         # Agent 3: The Writer (Spanish)
│   │   │   └── coordinator/route.ts      # Agent 4: The Coordinator
│   │   ├── prospects/
│   │   │   └── analyze/route.ts          # Main orchestrator endpoint
│   │   ├── leads/
│   │   │   ├── score/route.ts            # AI lead scoring
│   │   │   └── export/route.ts           # CSV export
│   │   └── assessment/
│   │       └── route.ts                  # ARRI integration
│   └── dashboard/
│       └── prospectos/
│           ├── page.tsx                  # Prospect analysis form + results
│           └── historial/
│               ├── page.tsx              # Prospect history list
│               └── [id]/page.tsx         # Individual prospect detail
├── lib/
│   ├── ai/
│   │   ├── anthropic.ts                  # Claude API client + model config
│   │   ├── openai.ts                     # OpenAI client (legacy features)
│   │   └── lead-scorer.ts               # Batch lead scoring logic
│   ├── supabase/
│   │   ├── client.ts                     # Browser Supabase client
│   │   └── server.ts                     # Server Supabase client
│   ├── utils/
│   │   └── web-fetcher.ts               # Website scraping with Cheerio
│   └── types.ts                          # Shared TypeScript types
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx                   # Dashboard navigation
│   └── ui/                               # shadcn/ui components
├── supabase/
│   └── schema.sql                        # Complete database schema
└── middleware.ts                          # Auth route protection
```

## The 4-Agent Pipeline

The core feature: when analyzing a prospect, 4 AI agents run sequentially:

### Agent 1: The Researcher (`/api/agents/research`)
- Fetches and analyzes prospect website with Cheerio
- Builds company profile: product/service, value prop, decision makers
- Identifies tech stack, funding signals, pain points
- Output: Structured intelligence brief

### Agent 2: The Analyst (`/api/agents/analysis`)
- Takes research output as input
- Scores ICP Fit (1-10) and Timing (1-10)
- Determines strategic outreach angle
- Anticipates objections
- Labels priority: HOT / WARM / COLD

### Agent 3: The Writer (`/api/agents/outreach`)
- Generates 3 hyper-personalized messages **in Spanish**:
  1. LinkedIn connection request (<200 chars)
  2. Cold email with clear CTA
  3. Follow-up email with different angle
- Based on research + analysis — never generic templates

### Agent 4: The Coordinator (`/api/agents/coordinator`)
- Compiles executive summary
- Recommends outreach sequence and channel priority
- Suggests timeline with dates
- Provides key talking points if prospect responds

### Orchestrator (`/api/prospects/analyze`)
- Runs all 4 agents sequentially
- Saves results to Supabase after each step
- Returns combined results to frontend

## Database Schema (Supabase)

```
Tables:
  profiles            — extends auth.users (id, email, full_name, company_name)
  whitelisted_emails  — controls who can register
  icps                — Ideal Customer Profiles (industry, size, revenue, tech, etc.)
  leads               — prospect records with AI scores and status tracking
  lead_activities     — activity log per lead
  prospects           — analyzed prospects (from 4-agent pipeline)
  agent_results       — outputs from each of the 4 agents per prospect

Enums:
  lead_status: new | contacted | qualified | unqualified | converted
  lead_source: ai_generated | manual | imported

All tables have Row Level Security (RLS) enabled — users can only access their own data.
```

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
OPENAI_API_KEY=sk-proj-...  # Optional, for legacy lead scoring
```

## Design System

- **Theme:** Dark mode by default
- **Primary color:** Purple `#7C3AED`
- **UI Components:** shadcn/ui with Tailwind
- **Language:** All UI in Spanish
- **Responsive:** Mobile-friendly
- **Notifications:** Sonner toast library

## AI Model Configuration

- **Model:** `claude-opus-4-20250514` (configured in `lib/ai/anthropic.ts`)
- **Cost per analysis:** ~$0.40 USD (10K input + 3.4K output tokens across 4 agents)
- **Projections:** 50/month ≈ $20, 200/month ≈ $80, 500/month ≈ $200

## Coding Conventions

- All UI copy in **Spanish**
- TypeScript strict mode — no `any` types
- Use `createClient()` from `lib/supabase/server.ts` for server-side operations
- Always check `auth.uid()` before database operations
- API routes use `NextRequest`/`NextResponse` with proper error handling
- Agent prompts are inline in their respective route files
- Components use shadcn/ui patterns (CVA, clsx, tailwind-merge)

## Authentication Flow

1. User visits login page
2. Enters email → checked against `whitelisted_emails` table
3. If whitelisted → can register/login via Supabase Auth
4. `middleware.ts` protects all `/dashboard/*` routes
5. Auto-creates profile via database trigger on signup

## Common Tasks

- **Add a new agent:** Create route in `app/api/agents/[name]/route.ts`, update orchestrator in `app/api/prospects/analyze/route.ts`
- **Whitelist a new user:** `INSERT INTO whitelisted_emails (email) VALUES ('user@company.com');`
- **Change AI model:** Update `MODEL` constant in `lib/ai/anthropic.ts`
- **Add dashboard page:** Create under `app/dashboard/`, will auto-inherit auth protection from middleware

## Pending Tasks / Roadmap

- Redesign 4 agents using Verymuch.ai knowledge base as context (make them Verymuch-specific)
- Add pre-call research feature
- Add post-call transcription processing
- Personalized proposal generation using company knowledge base
- Rate limiting implementation
- Agent prompt optimization with real prospect feedback

## Company Context (for AI Agents)

Verymuch.ai is a B2B AI agents and automation company. When agents generate outreach or analysis, they should understand:

- **What we sell:** AI agents and automation systems for mid-market sales & marketing teams
- **Positioning:** "AI that works in production, not pilots"
- **Model:** AaaS (Agent as a Service) — retainer subscriptions + setup fees
- **Markets:** Spain, Mexico, Colombia, US Hispanic
- **Differentiators:** We use our own tools internally, consulting + implementation, milestone-based payments, client guarantor
- **Tone:** Direct, no buzzwords, practical, warm. "Emprendedores que construyen, no vendedores que prometen."

## Do NOT

- Do NOT expose API keys in client-side code
- Do NOT bypass RLS — always use authenticated Supabase clients
- Do NOT hardcode email addresses — use whitelisted_emails table
- Do NOT use generic outreach templates — every message must reference specific prospect data
- Do NOT use English in user-facing UI — keep everything in Spanish
- Do NOT change the Supabase schema without updating `supabase/schema.sql`
