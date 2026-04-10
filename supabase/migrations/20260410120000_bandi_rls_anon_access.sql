-- RLS su public.bandi: consente al ruolo anon (chiave usata da bandi.html, app.html, admin.html)
-- di leggere e modificare le righe come quando RLS era disattivato.
-- Il ruolo service_role continua a bypassare RLS (Edge Functions, script con service key).
--
-- Applicare su Supabase: SQL Editor → incolla ed esegui, oppure `supabase db push`
-- dopo link del progetto.

ALTER TABLE public.bandi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bandi_anon_all" ON public.bandi;
CREATE POLICY "bandi_anon_all"
ON public.bandi
AS PERMISSIVE
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Utenti autenticati (eventuale login Supabase Auth in futuro)
DROP POLICY IF EXISTS "bandi_authenticated_all" ON public.bandi;
CREATE POLICY "bandi_authenticated_all"
ON public.bandi
AS PERMISSIVE
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

COMMENT ON POLICY "bandi_anon_all" ON public.bandi IS
  'Compatibilità admin.html e sito pubblico con chiave anon. Hardening: migrare scritture a service role o auth.';
