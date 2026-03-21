-- =============================================================================
-- Datos compartidos entre el equipo (usuarios autenticados / whitelisted)
-- Ejecutar en Supabase SQL Editor (una vez).
-- =============================================================================
-- SELECT / INSERT / UPDATE: cualquier usuario autenticado (INSERT exige user_id = auth.uid() como creador)
-- DELETE: solo el creador del registro (user_id = auth.uid())
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PROFILES: permitir leer perfiles del equipo para mostrar "Creado por …"
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- (Las policies de insert/update own profile se mantienen como en schema original)
-- Si no existían con otro nombre, asegúrate de tener insert/update solo propio.

-- ---------------------------------------------------------------------------
-- LEADS
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;

CREATE POLICY "leads_select_team"
  ON public.leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "leads_insert_creator"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "leads_update_team"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "leads_delete_creator_only"
  ON public.leads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- LEAD_ACTIVITIES
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own lead activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Users can create own lead activities" ON public.lead_activities;

CREATE POLICY "lead_activities_select_team"
  ON public.lead_activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "lead_activities_insert_creator"
  ON public.lead_activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lead_activities_update_team"
  ON public.lead_activities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "lead_activities_delete_creator_only"
  ON public.lead_activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- PROSPECTS
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can create own prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can update own prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can delete own prospects" ON public.prospects;

CREATE POLICY "prospects_select_team"
  ON public.prospects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "prospects_insert_creator"
  ON public.prospects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prospects_update_team"
  ON public.prospects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "prospects_delete_creator_only"
  ON public.prospects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- AGENT_RESULTS
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own agent results" ON public.agent_results;
DROP POLICY IF EXISTS "Users can create own agent results" ON public.agent_results;

CREATE POLICY "agent_results_select_team"
  ON public.agent_results FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "agent_results_insert_creator"
  ON public.agent_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agent_results_update_team"
  ON public.agent_results FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "agent_results_delete_creator_only"
  ON public.agent_results FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
