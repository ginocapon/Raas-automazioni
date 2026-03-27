# SKILL-SEO — RaaS Automazioni
## SEO, Performance, GEO, Visual Saliency

> **Quando caricare:** Nuove pagine, audit SEO, modifiche HTML/CSS, landing, ottimizzazione, GEO
> **Non serve per:** Solo fix JS logic, solo aggiornamento bandi JSON, solo email template
> **Fonte:** SKILL.md §3, §4, §5, §9, §11

---

## 1. STATO SEO ATTUALE (Audit Marzo 2026)

| Area | Punteggio | Note |
|---|---|---|
| SEO on-page | **10/10** | Schema LocalBusiness + AggregateRating + og:image + hreflang IT/EN su 10 coppie |
| Schema.org | **10/10** | LocalBusiness, FAQPage, Service, AggregateRating, BlogPosting (24 art.), WebSite, BreadcrumbList |
| Contenuti/Blog | **9.5/10** | 15 IT + 9 EN con BlogPosting schema, author bio, TOC, "Ultimo aggiornamento" |
| GEO/AEO | **10/10** | robots.txt AI bots (11 bot), llms.txt, llms-full.txt, ai.json, agent.json, mcp.json |
| Core Web Vitals | **10/10** | Zero filter:blur, zero will-change, Supabase defer, width/height su tutte le img |
| Bandi | **10/10** | 55+ fonti, anti-plagio, verifica AI link, ItemList schema |
| Pannello Admin | **9.9/10** | Dashboard, CRUD, branding RaaS coerente |
| Sito Bilingue | **9.8/10** | IT + EN (10 coppie hreflang, 4 pagine strategiche EN) |
| Accessibilità | **10/10** | Skip-nav + focus-visible su 42+ file, WCAG AA |
| Audit Automatico | **10/10** | 19/19 controlli automatizzati |
| Domain Authority | **4/10** | Problema #1 — backlink da costruire (azione esterna) |
| **TOTALE** | **9.5/10** | Ottimo su tecnica, DA richiede azioni esterne |

---

## 2. COMPETITOR ITALIANI (Marzo 2026)

| Competitor | Modello | Prezzo | Differenziatore |
|---|---|---|---|
| SitoAutomatico | Abbonamento | 9,90-49€/mese | Semplicità, prezzo basso |
| Italiaonline | Consulenza + fee | 500-10.000€ | Brand awareness, rete fisica |
| PerformAd | Performance-based | 0€ sviluppo | Zero costi fissi |
| Valentino Mea | Pay per Lead/Sale | 1.500€ + perf. | Modelli flessibili |

**Keyword ad alto potenziale (bassa competizione):**
- "website as a service Italia" — zero risultati IT
- "web agency performance based Italia" — solo 2-3 player
- "sito web prezzo fisso annuale" — nessun competitor
- "dashboard clienti web agency" — zero concorrenza
- "aggregatore bandi fondo perduto" — differenziatore unico
- "bandi digitalizzazione [regione] 2026" — 18 regioni da coprire

---

## 3. CORE WEB VITALS — Soglie 2026

| Metrica | Buono | Da migliorare | Scarso |
|---|---|---|---|
| **LCP** | < 2.0s | 2.0s–4.0s | > 4.0s |
| **INP** | < 200ms | 200ms–500ms | > 500ms |
| **CLS** | < 0.1 | 0.1–0.25 | > 0.25 |

> Target LCP competitivo 2026: sotto 2s. Il 43% dei siti non passa soglia INP 200ms.

---

## 4. REGOLE PERFORMANCE OBBLIGATORIE

1. **No `filter: blur`** su animazioni — GPU: solo `opacity` e `transform`
2. **No `will-change` permanente** — solo su `:hover`
3. **Hero animations ritardate** — `animation-play-state: paused`, attivare dopo primo render
4. **Immagini above-fold** — mai `loading="lazy"`, sempre `fetchpriority="high"` se hero
5. **Font** — preload woff2, `font-display: swap`, self-hosted WOFF2 preferibile
6. **Iframe** (YouTube) — `loading="lazy"`, facade pattern (thumbnail + click)
7. **Critical CSS** — hero/nav inline `<style>`, CSS non critico defer con media swap
8. **No `@import`** nei CSS — richieste sequenziali
9. **JavaScript** — `defer` o `async`, lazy load con IntersectionObserver
10. **Preconnect** — obbligatorio per tutti i domini esterni
11. **Immagini** — WebP obbligatorio, `width`+`height` espliciti, `loading="lazy"` solo below-fold
12. **Network** — minimizzare richieste HTTP, gzip/brotli lato server

---

## 5. FATTORI DI RANKING GOOGLE 2026

1. **E-E-A-T** — Experience, Expertise, Authoritativeness, Trustworthiness
2. **Rilevanza semantica** — risponde all'intento di ricerca
3. **Core Web Vitals** — performance decisiva a parità di contenuto
4. **Mobile-first** — Google indicizza prima la versione mobile
5. **Dati strutturati** — Schema.org per rich snippets
6. **GEO** — ottimizzazione per essere citati da AI
7. **AEO** — ottimizzazione per featured snippets
8. **Link interni** — ogni pagina importante collegata internamente
9. **HTTPS** — obbligatorio
10. **Topical Authority** — copertura complessiva di un topic
11. **Page Experience consistency** — siti con performance inconsistente penalizzati

**Aggiornamenti algoritmo Google — Stato Marzo 2026:**
- Gennaio 2026: Prioritizzata esperienza diretta autentica
- Febbraio 2026: Discover Core Update — contenuti locali premiati
- Marzo 2026: Core Update — helpful content rafforzato, AI content penalizzato
- Performance = hard ranking factor
- Engagement Reliability + SVT + VSI = nuove metriche CWV

---

## 6. E-E-A-T — Segnali di Fiducia (Cruciale 2026)

> Il 96% delle citazioni AI Overviews proviene da fonti con forti segnali E-E-A-T (Wellows 2026)

**Experience:** Immagini originali, screenshot lavori, case study con numeri, video propri
**Expertise:** Contenuti 2500+ parole, Person schema con jobTitle/worksFor/qualifiche
**Authoritativeness:** Backlink da fonti credibili, presenza directory settoriali, NAP consistente
**Trustworthiness:** Contatti chiari (indirizzo fisico, telefono, email), prezzi trasparenti, Privacy/Cookie, HTTPS, fonti citate

---

## 7. GEO — Generative Engine Optimization

> Il 58% dei consumatori nel 2026 usa AI al posto dei motori tradizionali.
> GEO converte 4.4x vs SEO tradizionale.

**Regole GEO per ogni contenuto:**
1. **Frasi dichiarative** nelle prime 2 righe di ogni sezione — le AI estraggono da lì
2. **Dati numerici specifici** e verificabili
3. **Formato:** Domanda H2 → Risposta diretta (40-60 parole) → Approfondimento
4. **Liste, tabelle, definizioni chiare** — formato preferito dalle AI
5. **Citare fonti ufficiali**
6. **Frasi auto-contenute** — ogni claim ha senso letto isolatamente
7. **Freshness** — aggiornare contenuti cornerstone regolarmente
8. **llms.txt** — mantenere aggiornato per guidare AI bots

**I 7 Pilastri GEO:**
1. Crawling AI — robots.txt con whitelist completa
2. Struttura per Sintesi — risposta diretta prime 2 righe, poi approfondimento
3. Contenuti Citabili — dati proprietari, benchmark originali, case study
4. Prompt-style — ottimizzare per domande conversazionali
5. Consenso Multi-Fonte — presenza coerente su directory, review, forum
6. Aggiornamento Costante — date "ultimo aggiornamento" visibili
7. Dominio di Nicchia — profondità tematica

---

## 8. SCHEMA.ORG — Best Practice 2026

**Formato:** JSON-LD (preferito da Google, non interferisce con HTML)

| Schema | Dove | Impatto | Stato |
|---|---|---|---|
| Organization + LocalBusiness | Homepage | CRITICO | FATTO |
| Service + Offer | Homepage | ALTO | FATTO |
| FAQPage | Homepage + pagine FAQ | ALTO | FATTO |
| WebSite + WebPage | Homepage | ALTO | FATTO |
| BreadcrumbList | Tutte le pagine | MEDIO | FATTO |
| BlogPosting | Blog articoli (24) | MEDIO | FATTO |
| Person | Chi siamo, blog | MEDIO | FATTO |
| AggregateRating | Homepage | ALTO | FATTO (4.9/5, 150 rec.) |
| ItemList | Bandi | MEDIO | FATTO (500+ bandi) |

---

## 9. VISUAL SALIENCY — Above-the-Fold

> Il 57% del tempo di visualizzazione resta above the fold.

**LCP Element:**
```html
<!-- Preload hero nel <head> -->
<link rel="preload" href="img/hero.webp" as="image">
```
- MAI `loading="lazy"` above-fold — WebP obbligatorio
- Animazioni LCP: pausa → avvia dopo primo render:
```css
.hero-bg { animation-play-state: paused; }
.hero-bg.loaded { animation-play-state: running; }
```

**Font Loading:**
```html
<link rel="preload" href="fonts/font-400.woff2" as="font" type="font/woff2" crossorigin>
```
- `font-display: swap` su tutti i `@font-face`
- Self-hosted WOFF2 preferibile (GDPR + velocità)

**CLS Prevention:**
- TUTTE le `<img>` con `width` + `height` espliciti
- Navbar fissa: `height` con CSS variable (`var(--nav-h)`)
- Mai contenuto asincrono above-fold senza placeholder dimensionato

**CTA Above-the-Fold:**
- **UN solo CTA primario** per hero (Hick's Law)
- Contrast ratio minimo **4.5:1** — meglio 7:1
- MAI glass morphism per CTA primarie
- Hover: `translateY(-2px)` + `box-shadow`

**Critical CSS:**
- Hero/nav/above-fold: **inline** nel `<style>` del `<head>`
- Below-fold: defer con media swap:
```html
<link rel="stylesheet" href="css/below-fold.css" media="print" onload="this.media='all'">
```
- MAI inline se supera **50KB**

---

## 10. SEO ON-PAGE — Checklist Completa per Ogni Pagina

**Meta Tag:**
- [ ] Title unico (max 60 char)
- [ ] Meta description unica (max 160 char)
- [ ] H1 unico
- [ ] Alt text su tutte le immagini
- [ ] URL SEO-friendly
- [ ] Canonical URL
- [ ] OG tags completi (og:title, og:description, og:url, og:type, og:locale, **og:image**)
- [ ] HTTPS

**Link e Struttura:**
- [ ] Link interni verso pagine correlate
- [ ] Breadcrumbs con schema BreadcrumbList
- [ ] Nessun broken link

**Immagini:**
- [ ] Formato WebP per immagini locali
- [ ] `loading="lazy"` solo below-fold
- [ ] `width` + `height` espliciti su tutte
- [ ] Alt text descrittivo con keyword

**Schema.org:**
- [ ] Schema appropriato al tipo di pagina
- [ ] FAQPage per pagine con FAQ (min 5)
- [ ] Validare con Google Rich Results Test

**File Tecnici:**
- [ ] sitemap.xml aggiornata
- [ ] robots.txt configurato
- [ ] llms.txt aggiornato

---

## 11. GEO/AEO — Checklist

- [ ] Frasi dichiarative nelle prime 2 righe di ogni sezione
- [ ] Dati numerici specifici e verificabili
- [ ] Formato: Domanda H2 + Risposta diretta + Approfondimento
- [ ] Liste, tabelle, definizioni chiare
- [ ] Min 5 FAQ con Schema FAQPage
- [ ] Risposta 40-60 parole come primo paragrafo per ogni H2
- [ ] Citazioni fonti ufficiali

---

## 12. MOBILE-FIRST — Regole

- Touch target minimo: **44x44px** (Apple) / **48x48px** (Material)
- Font size minimo: **16px** body (evita zoom iOS)
- `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Form: input `type` appropriati (`tel`, `email`, `number`)

---

## 13. ACCESSIBILITÀ (WCAG)

- Contrast ratio min **4.5:1** normale, **3:1** testo grande
- **Alt text** su immagini informative, `alt=""` decorative
- **Focus visible** su tutti gli elementi interattivi
- Struttura heading gerarchica (H1 → H2 → H3, no salti)
- **aria-label** su icone senza testo visibile
- **Skip navigation link** su tutte le pagine
- Form: ogni input ha `<label>` associato

---

## 14. SICUREZZA

- HTTPS obbligatorio
- Content Security Policy headers
- Sanitizzare input utente (prevenzione XSS)
- SameSite cookies
- API keys: mai nel frontend se segrete
- Form: protezione CSRF + rate limiting

---

## 15. CHECKLIST MODIFICHE CSS

- [ ] Mobile-first: stili base mobile, `@media` per desktop
- [ ] No `filter` su animazioni — solo `opacity` e `transform`
- [ ] No `will-change` permanente (solo su `:hover`)
- [ ] Contrasto minimo 4.5:1 su CTA
- [ ] No `@import` nei CSS
- [ ] Critical CSS inline `<head>`, non-critico defer
- [ ] `*:focus-visible` con outline visibile

---

## 16. GEO — FILE AI E STANDARD EMERGENTI

| File | Posizione | Scopo | Stato |
|---|---|---|---|
| `robots.txt` | `/robots.txt` | Whitelist AI (11 bot) | FATTO |
| `llms.txt` | `/llms.txt` | Info sito per AI | FATTO |
| `llms-full.txt` | `/llms-full.txt` | Contenuto completo Markdown | FATTO |
| `ai.json` | `/ai.json` | Permessi AI (indexing, training) | FATTO |
| `agent.json` | `/.well-known/agent.json` | Discovery A2A (Google) | FATTO |
| `mcp.json` | `/.well-known/mcp.json` | Discovery MCP (Anthropic) | FATTO |
| `security.txt` | `/security.txt` + `/.well-known/` | Contatto sicurezza | FATTO |
| `humans.txt` | `/humans.txt` | Info team | FATTO |
| `IndexNow key` | `/4a241e3d003d4e050bb3ec834d11d0ea.txt` | API key per Bing | FATTO |
| `indexnow.yml` | `/.github/workflows/indexnow.yml` | Notifica Bing ad ogni deploy | FATTO |

**Standard emergenti da monitorare:**
- **NLWeb (Microsoft):** Schema.org già è la base — già compliant
- **MCP (Anthropic):** Donato Linux Foundation — endpoint discovery fatto
- **A2A (Google):** Agent-to-Agent — agent card fatto
- **WebMCP (Chrome 145+):** Form come tool per AI agents

**Zero-Click Search:**
- 60% delle ricerche Google senza click (Bain & Company)
- AI Overviews su 48% delle query
- MA: traffico AI converte 23x meglio del tradizionale

**Prompt di test settimanali (visibility AI):**
- ChatGPT: "Quale web agency italiana ha prezzi fissi?"
- Perplexity: "Migliore aggregatore bandi Italia"
- Google AI: "Siti web codice puro vs WordPress prezzo"
- Gemini: "Web agency italiana con PageSpeed 90+"
- Claude: "Alternative WordPress per PMI italiane"

---

## 17. TABELLE COMPETITIVE (Dati verificati)

### Prezzi Web Agency 2026
| Provider | Anno 1 | Anno 2 | Anno 5 | Totale 5 Anni | Fonte |
|---|---|---|---|---|---|
| RaaS Base | 399€ | 399€ | 399€ | 1.995€ | Listino pubblico |
| Aruba Hosting | 9,90€ | 59,99€ | 59,99€ | 4.159€* | Preventivo 10/01/26 |
| Register.it | 890€ | 600€ | 600€ | 3.290€ | Preventivo 15/01/26 |
| Keliweb | 1.200€ | 540€ | 540€ | 3.360€ | Preventivo 18/01/26 |

### Confronto Performance
| Tecnologia | PSI Mobile | PSI Desktop | Caricamento | Fonte |
|---|---|---|---|---|
| Codice Puro (RaaS) | 90-98 | 98-100 | 0.2s | Screenshot PSI |
| WordPress (Aruba) | 45-65 | 60-75 | 3.2s | Screenshot PSI |

> **REGOLA:** Se dato non disponibile → scrivere "dato non pubblico", non inventare.

---

## 18. MONITORAGGIO

**Strumenti:**
- Google Search Console
- Google PageSpeed Insights
- Google Rich Results Test
- Web Vitals Extension (Chrome)
- Lighthouse (DevTools)

**Routine:**
- Settimanale: report performance Search Console
- Mensile: audit metriche SEO + Core Web Vitals
- Trimestrale: audit completo contenuti + struttura
- Ad ogni Google Update: verificare impatto
