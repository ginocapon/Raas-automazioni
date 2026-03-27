# SKILL-CONTEXT — RaaS Automazioni
## Architettura, Business, Struttura File

> **Quando caricare:** Modifiche strutturali, admin, bandi, prezzi/business, nuove landing, audit completo
> **Non serve per:** Fix CSS, articoli blog standalone, checklist rapide SEO
> **Fonte:** SKILL.md §2, §8 (TODO incompleti), §10

---

## 1. INFORMAZIONI GENERALI PROGETTO

| Campo | Valore |
|---|---|
| **Dominio** | raasautomazioni.it / www.raasautomazioni.it |
| **Hosting** | GitHub Pages (deploy automatico da `main`) |
| **Tech Stack** | HTML statico + CSS custom + JS vanilla |
| **Framework** | Nessuno — zero dipendenze esterne |
| **Database** | Supabase (PostgreSQL esterno) |
| **Lingue** | Italiano (principale), Inglese (/en/) |
| **Target** | PMI, professionisti, startup — B2B |
| **Mercato** | Italia + UK/USA/Global (bilingue) |
| **Analytics** | Google Analytics 4 (G-4T83494XDB) |
| **Repository** | ginocapon/Raas-automazioni |

---

## 2. MODELLO DI BUSINESS — RaaS (Revenue as a Service)

**Il sito è la porta d'ingresso. Il vero valore è portare clienti.**

| Pacchetto | Prezzo/Anno | Incluso |
|---|---|---|
| **Base** | 399€ + IVA | Sito vetrina/aziendale, hosting, SSL, PageSpeed 90+, SEO base, chatbot AI |
| **E-commerce** | 599€ + IVA | Tutto Base + catalogo prodotti, carrello, pagamenti, gestione ordini |
| **Abbonamento Bandi** | 50€/anno (61€ IVA incl.) | Accesso illimitato 12 mesi, filtri avanzati, newsletter settimanale |

**Commissione performance (3%):**
- Calcolata sul fatturato totale generato da nuovi contatti/lead portati tramite il sito e campagne RaaS
- Tracking via UTM, form dedicati, numeri tracciati, CRM integrato
- Riconciliazione trimestrale con dati verificabili
- Dashboard cliente con accesso in tempo reale a tutte le metriche
- Diritto di audit contrattuale per entrambe le parti

**Riferimenti mercato verificati:**
- Wunderkind (USA): $204.7M fatturato 2024 — pioniere "Revenue as a Service"
- Il 3% è aggressivamente competitivo (mercato: 5-15%)
- Fee d'ingresso 399-599€ molto bassa (mercato: $2.500-$10.000+)

**Clausole contrattuali obbligatorie:**
- Doppia sottoscrizione per clausola lock-in (Art. 1341 c.c.)
- Penale di recesso proporzionale e decrescente (Art. 1384 c.c.)
- Definizione chiara attribuzione lead + meccanismo audit
- Data portability garantita (Art. 9, L.192/1998)
- Durata massima consigliata: 24 mesi

---

## 3. MESSAGING CORE

**Messaggio primario (IT):** "Ti portiamo clienti. Guadagniamo solo se guadagni tu."
**Messaggio primario (EN):** "We bring you clients. We only earn when you earn."

**Gerarchia messaggi:**
1. Performance-based: portiamo clienti, paghi solo sui risultati
2. Trasparenza: dashboard verificabile, tutto nero su bianco
3. Tecnologia: codice puro, AI, SEO/GEO, PageSpeed 90+
4. Prezzo accessibile: 399-599€ + IVA/anno per il sito

**Claim verificati (con fonte interna):**
- 150+ progetti completati
- 98% soddisfazione clienti
- 3.2M€ valore generato nel portfolio
- ROI medio 300% entro 6 mesi (automazioni)

---

## 4. SERVIZI CORE

- Realizzazione siti web in codice puro (no WordPress)
- **Lead generation e acquisizione clienti** (servizio primario)
- Dashboard performance trasparente per ogni cliente
- Garanzia PageSpeed 90+
- Prezzo sito bloccato per sempre (anti-rincaro)
- SEO + GEO (Generative Engine Optimization)
- Aggregatore bandi: monitoraggio 55+ fonti dirette ufficiali
- Automazioni business
- Sito bilingue IT/EN

---

## 5. STRUTTURA FILE PRINCIPALE

```
/
├── CLAUDE.md                   # Istruzioni automatiche per Claude
├── skill-essentials.md         # Regole operative (SEMPRE)
├── skill-context.md            # Questo file
├── skill-seo.md                # SEO, performance, GEO (per pagine/audit)
├── skill-content.md            # Blog, contenuti (per articoli)
├── context-map.json            # Mappa task → skill da caricare
├── SKILL.md                    # File master originale (fonte di verita')
│
├── index.html                  # Homepage (hero, servizi, prezzi, FAQ, stats)
├── blog.html                   # Pagina blog principale
├── bandi.html                  # Aggregatore bandi (55+ fonti)
├── landing.html                # Landing page bandi
├── website-as-a-service.html   # WaaS
├── confronto-prezzi-web-agency-2026.html
├── chi-siamo.html              # E-E-A-T, Person schema
├── case-study.html             # Case study
├── postapremium.html           # Posta premium
├── brobot.html                 # Chatbot/assistente
├── admin.html                  # Pannello admin
├── privacy.html / cookie.html  # GDPR
├── sitemap.xml                 # URL indicizzate
├── robots.txt                  # Whitelist AI bots (11 bot)
│
├── en/                         # Versione inglese
│   ├── index.html
│   ├── about-us.html           # (hreflang ↔ chi-siamo.html)
│   ├── case-studies.html       # (hreflang ↔ case-study.html)
│   ├── website-as-a-service.html
│   ├── web-agency-pricing-comparison-2026.html
│   └── blog/articoli/          # 9 articoli EN
│
├── blog/articoli/              # 15 articoli IT
└── landing-*.html              # Landing pages (8 file)
```

---

## 6. PANNELLO ADMIN (admin.html)

| Sezione | Funzione |
|---|---|
| **Dashboard** | KPI: bandi attivi, iscritti, abbonati premium, scadenze |
| **Analytics** | Crescita iscritti, tasso conversione free→premium |
| **Bandi** | CRUD bandi con ricerca, filtri, paginazione |
| **Iscritti** | Lista con filtri free/paid, ricerca, esportazione |
| **Email** | Invio email singole/batch con template |
| **Newsletter** | Gestione newsletter bandi settimanale |
| **Manutenzione** | Pulizia dati, statistiche sistema |

**Auth:** Login overlay con Supabase
**Branding admin:** "RaaS Automazioni — Admin Panel" (MAI "BandiItalia")
**Colori admin:** `#d4a843` (oro) per sidebar e badge premium

---

## 7. SISTEMA BANDI

| Componente | Dettaglio |
|---|---|
| **Scraper** | `tools/scrape-bandi.js` |
| **Edge Function** | `supabase/functions/manutenzione-bandi/index.ts` — 55+ fonti, anti-plagio |
| **Verificatore** | `tools/verify-links-perplexity.js` — Claude + Perplexity sonar-pro |
| **Sync** | `tools/sync-bandi.js` — sincronizzazione con Supabase |
| **Cron** | GitHub Actions ogni lunedi 08:00 UTC |
| **API Keys** | `ANTHROPIC_API_KEY` + `PERPLEXITY_API_KEY` (GitHub Secrets) |
| **Anti-plagio** | Titoli riformattati "Ente — Descrizione", descrizioni con sinonimi |

---

## 8. TODO — AZIONI ANCORA DA COMPLETARE

### Contenuti
- [ ] Nuovi articoli blog IT (target: 2/mese)
- [ ] Landing page dedicata per ogni servizio
- [ ] Video testimonial clienti
- [ ] A/B test CTA copy

### SEO / DA
- [ ] Profilo Trustpilot (recensioni esterne)
- [ ] Backlink building: Sortlist, Clutch, DesignRush, guest posting
- [ ] Serie blog "Bandi [Regione] 2026" — 3/18 fatti (Lombardia, Emilia-Romagna, guida nazionale) — 15 da fare

### Analytics
- [ ] Creare dashboard Google Data Studio/Looker Studio per KPI

---

## 9. KPI E CALENDARIO

### KPI Obiettivi

| Metrica | 3 mesi | 6 mesi | 12 mesi |
|---|---|---|---|
| Articoli blog IT | 13 (6 nuovi) | 19 | 31 |
| Articoli blog EN | 8 (4 nuovi) | 12 | 20 |
| Pagine indicizzate | 50 | 70 | 100+ |
| Iscritti bandi premium | 50 | 150 | 500 |
| Lead mensili | 10-20 | 30-50 | 60-100 |
| Domain Authority | 10 | 15 | 20+ |

### Calendario Editoriale
| Mese | Contenuto | Target |
|---|---|---|
| Marzo 2026 | Fix coerenza sito | Completato |
| Aprile 2026 | 2 nuovi articoli IT + schema | SEO on-page |
| Maggio 2026 | Landing servizi + video | Lead generation |
| Giugno 2026 | Audit trimestrale + dati | Freshness |

### Routine Monitoraggio
- **Settimanale:** GA4 + check citazioni AI
- **Mensile:** Audit metriche SEO + Core Web Vitals
- **Trimestrale:** Audit completo contenuti + competitor
- **Ad ogni Google Update:** Verificare impatto

---

## 10. CRONOLOG — Audit Automatico Settimanale

> **Stato:** ATTIVO — Autorizzazione permanente
> **Frequenza:** Ogni venerdì ore 07:00 CET
> **Automazione:** GitHub Actions `.github/workflows/weekly-audit.yml`
> **Pagine monitorate:** 55+ (auto-discovery IT/EN)

**19 controlli automatizzati:**
1. `og:image` su tutte le pagine
2. `width`+`height` su tutte le `<img>`
3. Skip navigation link
4. `*:focus-visible` styles
5. `<link rel="preconnect">` per domini esterni
6. Font-Awesome/CSS in defer (media swap)
7. Zero `filter: blur()` su animazioni
8. Zero `will-change` permanente
9. No `loading="lazy"` above-fold
10. `<meta name="description">`
11. `<link rel="canonical">`
12. `<meta name="theme-color">`
13. Prezzi coerenti (399€/599€/3%)
14. Branding "RaaS Automazioni" (mai "BandiItalia")
15. sitemap.xml aggiornata
16. Schema.org JSON-LD valido
17. Immagini locali in WebP
18. Script non critici con `defer`/`async`
19. Copyright anno corretto (non 2025)

**Regole operative cronolog:**
- Violazioni critiche (prezzi, branding, sicurezza): segnalazione → NO fix automatico
- Rapporto come GitHub Issue con label `audit-settimanale`
- Attivo fino a revoca esplicita del proprietario
