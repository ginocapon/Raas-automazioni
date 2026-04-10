---
name: bandi-nuove-fonti
description: >-
  Estende e verifica le fonti bandi (array FONTI, ingest Supabase, conteggi hero), ciclo settimanale,
  audit legacy/aggregatori, metodo discovery→link istituzionale. Usa per nuove fonti, auto-aggiornamento,
  keyword, cron/CI, ottimizzazione FONTI, deploy manutenzione-bandi.
---

# Skill — Nuove fonti bandi e conteggio

## Il numero sul sito è corretto?

- **Fonti nel dataset** = valori **distinti** della colonna `fonte` su `public.bandi` con `attivo = true`. È scritto in `data/bandi-live-stats.json` (`fonti_distinte`) e rigenerato a ogni deploy da `tools/write-bandi-live-stats.js`.
- **Endpoint configurati** = lunghezza dell’array `FONTI` in `supabase/functions/manutenzione-bandi/index.ts` (verificare con il comando sotto). In condizioni normali **DB distinti ≈ endpoint** (ogni riga ingest usa `fonte: fonte.id`).
- Verifica rapida in repo:
  - `grep -c '{ id:' supabase/functions/manutenzione-bandi/index.ts` (blocco `FONTI`)
  - `npm run write-bandi-live-stats` poi leggere `data/bandi-live-stats.json`.

Se `fonti_distinte` < numero di voci in `FONTI`, alcuni endpoint non producono bandi o usano `fonte` diversa da `fonte.id` (anomalia da correggere nel parser).

## Schema di lavoro (come discusso: keyword → ricerca → dedup)

1. **Corpus** — Da DB o da `data/bandi.json`: estrarre termini ricorrenti (titolo, descrizione, keywords, settore). Script: `npm run build-bandi-keywords` → `data/bandi-keyword-stats.json` (`by_regione`, `by_tipo_ente`, `global`).
2. **Discovery** — Per ogni regione/ente sotto-rappresentato, cercare **nuovi portali ufficiali** (.gov.it, regione.*, camcom.it, incentivi.gov.it) che pubblicano avvisi. **Non** inventare URL: solo fonti verificabili.
3. **Implementazione** — Aggiungere una voce in `FONTI` con `id`, `nome`, `url`, `tipo` (`json`|`html`|`csv`|`rss`), `regione`, `ente`, `tipo_ente`. **`tipo_ente` deve coincidere con i valori del filtro su `bandi.html`** (`ministero`, `ente_nazionale`, `regione`, `cciaa`, `ue`, `altro`). Per Camere di commercio usare sempre **`cciaa`** sui nuovi record (evitare il legacy `camera_commercio`, ancora presente in vecchi import). Dettaglio campi e macro “Sud Italia”: `tools/BANDI-RICERCA-FONTI-KEYWORDS.md` (sotto “Verifica delle fonti”, allineamento filtri). Seguire i parser in `index.ts` (`parseHtml`, `parseIncentiviGov`, …).
4. **Deduplica** — Stesso URL normalizzato o stesso titolo+scadenza → logica già in manutenzione admin; dopo ingest verificare duplicati in dashboard.
5. **Deploy** — `supabase functions deploy manutenzione-bandi` (o pipeline del team). Poi eseguire manutenzione da admin o cron.
6. **Aggiorna conteggi statici** — `npm run write-bandi-live-stats` e commit se si aggiorna il file per il sito; il deploy CI lo rigenera comunque.

## “10 loop” e autorigenerazione

L’agente **non** può eseguire da solo 10 cicli continui di crawling sul web senza che tu (o la CI) lanciate comandi o sessioni. Per automatizzare:

| Obiettivo | Cosa serve |
|-----------|------------|
| Ripetere ingest | Pulsante **Manutenzione** in `admin.html` o chiamata HTTP alla Edge Function con auth di progetto |
| Batch verifica link | `bash tools/run-validate-bandi-supabase-batches.sh` |
| Batch coerenza titoli | `bash tools/run-audit-coherence-bandi-supabase-batches.sh` |
| Loop shell (es. 10 giri) | `for i in $(seq 1 10); do node tools/…; sleep 60; done` (solo dove ha senso, rispettando rate limit) |
| Aggiornare solo i contatori | `npm run write-bandi-live-stats` |
| Keyword per suggerimenti UI | `npm run build-bandi-keywords` |

Chiedi all’agente: *“Applica la skill bandi-nuove-fonti: aggiungi FONTI per [regione X] con URL verificati”* — un turno = una o più voci + review, non dieci crawl notturni autonomi.

## Ciclo auto-aggiornante e ottimizzazione (metodo RaaS, senza stack Python obbligatorio)

Obiettivo allineato al prompt “AI auto-alimentante”: **stesso risultato atteso** (fonti istituzionali, classificazione, schedulazione, miglioramento continuo), ma usando **ciò che il repo già implementa**. Non introdurre Scrapy / BeautifulSoup / spaCy / schedule Python come prerequisito: l’ingest è **TypeScript** sulla Edge Function `manutenzione-bandi`; gli script di supporto sono **Node**.

### Cosa è già coperto nel progetto

| Obiettivo (prompt generico) | Implementazione RaaS |
|----------------------------|----------------------|
| Scansione fonti UE / ministeri / regioni / CCIAA | Array `FONTI` + fetch in `supabase/functions/manutenzione-bandi/index.ts` (JSON/HTML/CSV/RSS) |
| Classifica per settore / località / scadenza | Campi `regione`, `tipo_ente`, `tipo_contributo`, `settore`, `stato`, `scadenza` su `public.bandi`; filtri in `bandi.html` |
| Aggiornamento settimanale | **Manutenzione** da `admin.html` o chiamata autenticata alla Edge Function; **audit** automatico venerdì in `.github/workflows/weekly-audit.yml` (validazione link JSON + report Issue) |
| Keyword dinamiche | `npm run build-bandi-keywords` → `data/bandi-keyword-stats.json` (per datalist e priorità discovery) |
| “NLP” / rilevanza | Nessun modello obbligatorio: rilevanza = **match titolo/keyword**, policy link, audit coerenza titolo–URL (`tools/audit-bandi-coherence-supabase.js` + batch shell) |

### Pulizia europainnovazione.com (link non autorizzati)

Record con `url` verso **europainnovazione.com** (o altri aggregatori in `tools/bandi-link-policy.js`) **non** devono restare pubblici con quel link: rischio reputazionale e uso di sito concorrente.

1. **Risoluzione automatica (batch da 100)** — `tools/resolve-europainnovazione-urls.js`:
   - Scarica la pagina aggregatore (solo per estrarre href/testo con URL PA/UE/CCIAA).
   - Se trova un URL che passa i criteri istituzionali → `PATCH` con nuovo `url`.
   - Altrimenti → `attivo=false` e `url` azzerato (titolo resta in DB per ricerche future da fonti autorizzate).
   - Comandi: `npm run resolve-europainnovazione -- --dry-run --limit=20` poi con chiave service role  
     `export SUPABASE_SERVICE_ROLE_KEY=…` e  
     `bash tools/run-resolve-europainnovazione.sh` oppure  
     `node tools/resolve-europainnovazione-urls.js --apply --all`.
   - Opzionale costi API: `--perplexity` + `PERPLEXITY_API_KEY` quando dalla pagina non esce alcun link istituzionale.
2. **Residui** — Se dopo lo script restano URL aggregatore: `tools/sql/deactivate-europainnovazione-remaining.sql` in SQL Editor.
3. **Candidati** — `npm run list-bandi-audit-candidates` per conteggi e campione.

### Regola vincolante: solo link istituzionali in pubblicazione

- **Fonti in `FONTI`**: preferire **URL istituzionali** (`.gov.it`, `europa.eu`, camere, regioni, incentivi.gov API, ecc.).
- **Aggregatori / siti non istituzionali**: ammessi solo come **discovery** (titoli o indici), mai come `url` finale pubblico se non si risale a una **scheda ufficiale**. La Edge Function applica già logica di arricchimento/abbinamento verso incentivi.gov e URL `.gov` dove possibile (`enrichAggregatorBandi`, `looksOfficialUrl` in `index.ts`).
- Se un aggregatore fornisce solo il titolo: **cercare** la pagina dell’ente erogatore o la scheda su incentivi.gov prima di inserire.

### Loop di auto-ottimizzazione (operativo, senza ML)

1. **Misurare** — Dopo ogni ingest: `fonti_distinte`, conteggi per `tipo_ente`/`regione` (query SQL o `build-bandi-keywords`).
2. **Qualità** — `bash tools/run-validate-bandi-supabase-batches.sh` e `bash tools/run-audit-coherence-bandi-supabase-batches.sh`; leggere Issue settimanale audit.
3. **Pulizia candidati** — `npm run list-bandi-audit-candidates` (campione + totali) e `tools/sql/audit-bandi-legacy-tipo-e-url.sql` in SQL Editor: legacy `camera_commercio`, URL `europainnovazione.com` / altri host in `tools/bandi-link-policy.js`.
4. **Aggiustare FONTI** — Rimuovere o sostituire endpoint che non producono record utili; aggiungere portali ufficiali dalla guida `tools/BANDI-RICERCA-FONTI-KEYWORDS.md`.
5. **Ripetere** — Deploy function → manutenzione → aggiornare stats statiche se serve.

### Output attesi (equivalenti al prompt “AI auto-alimentante”)

- **Nuovi bandi** — Righe in `public.bandi` dopo manutenzione; UI `bandi.html` / app dopo refresh cache.
- **Report di qualità** — Issue GitHub da `.github/workflows/weekly-audit.yml`; esiti batch in `data/bandi-validate-batches/` e script coherence se eseguiti.
- **Suggerimenti** — Nuove keyword da `npm run build-bandi-keywords`; nuove fonti da `tools/BANDI-RICERCA-FONTI-KEYWORDS.md` e revisione endpoint in `FONTI`; candidati problematici da `npm run list-bandi-audit-candidates`.

### Schedulazione (cron)

- **GitHub Actions**: già presente audit settimanale; per ingest automatico servirebbe workflow separato con secret **service role** e chiamata HTTPS alla function (valutare rate limit e costi; spesso si preferisce manutenzione manuale o pianificata dal team).
- Esempio generico `cron` su server: non è nel repo; se si aggiunge, usare **stessi comandi** (`node tools/…`, curl alla function), non uno script Python separato salvo scelta esplicita del team.

### Notifiche

- Non integrate nel core open source: possibili hook futuri (email/Telegram) su “nuovi id inseriti” tramite Supabase Database Webhooks o Action dedicata; non promettere al cliente senza implementazione.

## Comandi di riferimento (copiabili)

```bash
# Conteggi DB → JSON per il sito (stesso dominio)
npm run write-bandi-live-stats

# Keyword da corpus (Supabase o JSON locale)
npm run build-bandi-keywords

# Lettura anon pubblica
npm run verify-bandi-public-read

# Quante fonti in codice
grep -c '{ id:' supabase/functions/manutenzione-bandi/index.ts

# Audit legacy tipo ente + URL aggregatore (campione REST)
npm run list-bandi-audit-candidates

# Bonifica URL europainnovazione (dry-run / poi --apply con SUPABASE_SERVICE_ROLE_KEY)
npm run resolve-europainnovazione -- --dry-run --limit=20
# bash tools/run-resolve-europainnovazione.sh   # --apply --all
```

## Ricerca fonti, keyword e verifica (lettura consigliata)

- **`tools/BANDI-RICERCA-FONTI-KEYWORDS.md`** — verifica ufficialità, template keyword per Regione/Provincia/Comune/nazionale, strategie, monitoraggio, checklist UE/IT, link a incentivi.gov.it / MIMIT / Funding & Tenders.

## File chiave

- `supabase/functions/manutenzione-bandi/index.ts` — array `FONTI`, parser, dedup.
- `tools/write-bandi-live-stats.js` — `attivi_count`, `fonti_distinte`.
- `tools/build-bandi-keyword-stats.js` — statistiche per suggerimenti / priorità discovery.
- `tools/PROMPT-AGENT-BANDI-SUPABASE.txt` — prompt operativo completo.
- `tools/list-bandi-audit-candidates.js` — elenco candidati revisione (REST anon).
- `tools/sql/audit-bandi-legacy-tipo-e-url.sql` — stesse query in SQL Editor.
- `tools/resolve-europainnovazione-urls.js` — sostituzione URL o disattivazione batch.
- `tools/sql/deactivate-europainnovazione-remaining.sql` — disattiva residui aggregatore.
- `.cursor/rules/bandi-supabase.mdc` — schema URL, RLS, audit.

## Etica

Nessun URL o ente inventato. Se non verificabile: segnare **NON VERIFICABILE** e non inserire in `FONTI`.
