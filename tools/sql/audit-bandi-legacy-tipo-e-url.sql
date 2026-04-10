-- Audit candidati per revisione manuale in admin (Supabase SQL Editor o psql).
-- Policy link: aggregatori non devono essere url pubblico finale; tipo_ente Camere → preferire cciaa.

-- 1) Legacy tipo ente (filtrabile come CCIAA sul sito ma da normalizzare nel DB)
SELECT id, titolo, ente, regione, url, tipo_ente, fonte, attivo
FROM public.bandi
WHERE tipo_ente = 'camera_commercio'
ORDER BY id DESC;

-- 2) URL che puntano a aggregatore noto (estendere il LIKE se emergono altri host bloccati)
SELECT id, titolo, ente, regione, url, tipo_ente, fonte, attivo
FROM public.bandi
WHERE url ILIKE '%europainnovazione.com%'
ORDER BY id DESC;

-- 3) Conteggi rapidi
SELECT tipo_ente, COUNT(*) AS n
FROM public.bandi
WHERE attivo = true
GROUP BY tipo_ente
ORDER BY n DESC;
