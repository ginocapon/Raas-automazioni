-- Eseguire in Supabase → SQL Editor (NON nel terminale zsh).
-- Allinea tipo_ente al filtro "Camere di Commercio" su bandi.html.

UPDATE public.bandi
SET tipo_ente = 'cciaa'
WHERE tipo_ente = 'camera_commercio';
