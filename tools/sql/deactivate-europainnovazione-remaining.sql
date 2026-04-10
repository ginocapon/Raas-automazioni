-- Disattiva e azzera URL per tutte le righe che puntano ancora a europainnovazione.com
-- dopo aver eseguito tools/resolve-europainnovazione-urls.js (sostituisce dove possibile).
-- Eseguire in SQL Editor solo se restano record con URL aggregatore.

UPDATE public.bandi
SET attivo = false,
    url = NULL
WHERE url IS NOT NULL
  AND url ILIKE '%europainnovazione%';
