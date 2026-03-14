# REPORT: Strategia GEO, AI Agents & Visibilita' Digitale 2026

> **Versione:** 1.0 — 14 Marzo 2026
> **Applicabile a:** Qualsiasi sito web statico (HTML/CSS/JS) che vuole scalare visibilita' in Italia
> **Fonti:** Search Engine Land, Gartner, Google, Yext, llmstxt.org, First Page Sage, Stackmatix

---

## PARTE 1 — IL CONTESTO: PERCHE' SERVE UNA NUOVA STRATEGIA

### 1.1 I Numeri del Cambiamento
- Le sessioni riferite da AI sono cresciute del **527% anno su anno** (fonte: Averi, 2025)
- La sovrapposizione tra link top di Google e fonti citate da AI e' scesa dal **70% al 20%** (fonte: Profound)
- Il **96% delle citazioni in AI Overviews** proviene da fonti con forti segnali E-E-A-T (fonte: Wellows)
- Pagine con **15+ entita' riconosciute** hanno **4.8x piu' probabilita'** di essere selezionate per AI Overviews (fonte: ClickRank)
- Siti con segnali di esperienza ed expertise hanno visto **+23% dopo il Core Update di dicembre 2025** (fonte: BKND)

### 1.2 Come le AI Scelgono Chi Citare
Le AI (ChatGPT, Perplexity, Gemini, Claude) selezionano fonti in 3 fasi:

1. **Crawl & Index** — Il bot visita il sito (se robots.txt lo permette)
2. **Valutazione** — Autorita', accuratezza, rilevanza, dati strutturati
3. **Sintesi & Citazione** — L'AI decide se citare la fonte nella risposta

**Differenze per piattaforma:**
| Piattaforma | Fonti citate | Preferenze |
|-------------|-------------|------------|
| ChatGPT | 3-5 fonti | Wikipedia, fonti autorevoli |
| Perplexity | 5-8 fonti | Reddit, forum, fonti dirette |
| Google AI Overviews | 2-4 fonti | Distribuite, schema.org |
| Claude | 3-6 fonti | Documentazione, fonti tecniche |

---

## PARTE 2 — GEO: GENERATIVE ENGINE OPTIMIZATION

### 2.1 Definizione
GEO e' l'ottimizzazione dei contenuti affinche' le piattaforme AI (ChatGPT, Perplexity, Gemini, Google AI Overviews, Claude) citino e raccomandino il tuo brand nelle risposte agli utenti.

### 2.2 I 7 Pilastri GEO (Azioni Concrete)

**PILASTRO 1 — Permettere il Crawling AI**
```
# robots.txt — Sezione AI Bots
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: GoogleOther
Allow: /
```
> ATTENZIONE: Cloudflare blocca i bot AI di default. Se usi Cloudflare, whitelist esplicita.

**PILASTRO 2 — Struttura Contenuti per Sintesi AI**
- Gerarchia chiara: H1 > H2 > H3, un argomento per sezione
- **Prima la risposta diretta** (40-60 parole), poi l'approfondimento
- Elenchi puntati e numerati per dati chiave
- Tabelle comparative con fonti citate
- Frasi dichiarative nelle prime 2 righe di ogni sezione

**PILASTRO 3 — Contenuti Citabili (Unici e Originali)**
- Dati proprietari: benchmark, case study con numeri reali
- Commenti esperti con nome e qualifica
- Ricerche originali che nessun altro ha
- Confronti con fonti verificate (preventivi, screenshot)

**PILASTRO 4 — Pensare in Prompt, Non in Keyword**
Invece di ottimizzare per "web agency prezzi", ottimizzare per:
- "Quale web agency italiana offre prezzi fissi senza rincari?"
- "Quanto costa un sito web professionale in Italia nel 2026?"
- "Quale alternativa a WordPress ha PageSpeed 95+?"

**PILASTRO 5 — Consenso Multi-Fonte**
Le AI cercano accordo tra fonti indipendenti:
- Presenza su directory settoriali
- Menzioni su Reddit, forum di settore
- Recensioni su Google Business, Trustpilot
- Articoli su pubblicazioni di settore
- Profili social coerenti e attivi

**PILASTRO 6 — Contenuti Sempre Aggiornati**
- Date "Ultimo aggiornamento" visibili su ogni articolo
- Refresh trimestrale dei contenuti cornerstone
- Prezzi e dati sempre allineati tra sito e fonti esterne

**PILASTRO 7 — Dominare una Nicchia**
Le AI premiano la profondita' tematica:
- Meglio dominare "automazione WhatsApp per ristoranti Italia" che competere su "web agency"
- Creare cluster di contenuti interconnessi sullo stesso tema
- Ogni sotto-argomento ha la sua pagina dedicata

---

## PARTE 3 — FILE SPECIALI PER AI AGENTS

### 3.1 llms.txt (PRIORITA' ALTA)
File a `/llms.txt` che fornisce informazioni leggibili da AI sul sito. Standard proposto da Jeremy Howard (FastAI) nel 2024. **600+ siti lo usano** tra cui Anthropic, Stripe, Cloudflare, Zapier.

**Formato:**
```markdown
# Nome Azienda

> Descrizione in una riga di cosa fa l'azienda.

Paragrafo descrittivo opzionale.

## Servizi

- [Pagina Servizio](https://sito.it/servizio): Descrizione breve
- [Pricing](https://sito.it/prezzi): Descrizione breve

## Blog

- [Titolo Articolo](https://sito.it/blog/articolo): Descrizione
```

**Due varianti:**
- `/llms.txt` — Link e riassunti delle pagine chiave
- `/llms-full.txt` — Contenuto completo delle pagine in Markdown (per siti con rendering JS)

### 3.2 humans.txt
File a `/humans.txt` con crediti del team (trasparenza).

### 3.3 .well-known/security.txt
Standard per segnalare policy di sicurezza e contatti.

### 3.4 manifest.json
Per supporto PWA base (icona home screen, theme color).

---

## PARTE 4 — SCHEMA.ORG CRITICO PER AI

### 4.1 Schema Prioritari (JSON-LD)

I contenuti con schema markup hanno **2.5x piu' probabilita'** di apparire nelle risposte AI (fonte: Stackmatix).

| Schema | Dove | Impatto AI |
|--------|------|-----------|
| **LocalBusiness** | Homepage | CRITICO — AI lo usa per "migliore X vicino a me" |
| **ProfessionalService** | Homepage | ALTO — specifica il tipo di servizio |
| **FAQPage** | Tutte le pagine con FAQ | ALTO — le AI estraggono risposte dirette |
| **Service + Offer** | Pagine servizi/prezzi | ALTO — AI cita prezzi e servizi |
| **AggregateRating** | Homepage (testimonial) | ALTO — social proof strutturato |
| **Review** | Homepage (testimonial) | ALTO — singole recensioni |
| **Article/BlogPosting** | Blog | MEDIO — contesto e autore |
| **Person** | Blog, Chi Siamo | MEDIO — E-E-A-T autore |
| **BreadcrumbList** | Tutte le pagine | MEDIO — gerarchia del sito |
| **HowTo** | Guide/tutorial | MEDIO — passi strutturati |
| **VideoObject** | Pagine con video | MEDIO — contenuto multimediale |
| **ItemList** | Aggregatori (bandi) | MEDIO — elenchi strutturati |
| **Dataset** | Aggregatori dati | BASSO-MEDIO — per data aggregator |
| **WebPage + speakable** | Pagine chiave | BASSO — per assistenti vocali |

### 4.2 Regola d'Oro Schema
> "I dati nello schema DEVONO corrispondere esattamente a cio' che c'e' sulla pagina e su Google Business Profile. Incoerenze riducono la fiducia AI su TUTTE le pagine del sito."

---

## PARTE 5 — E-E-A-T: I SEGNALI CHE CONTANO

### 5.1 Experience (Esperienza Diretta)
- [ ] Immagini originali (screenshot lavori, dashboard, foto eventi) — NO stock photo
- [ ] Case study con numeri specifici e risultati misurabili
- [ ] Dettagli che solo un insider conosce
- [ ] Video propri che mostrano il lavoro in azione
- [ ] Aneddoti personali e lezioni apprese

### 5.2 Expertise (Competenza Tecnica)
- [ ] Contenuti approfonditi 2500+ parole su argomenti core
- [ ] Uso corretto di terminologia tecnica con definizioni
- [ ] Spiegare il "perche'" oltre al "cosa"
- [ ] Guide step-by-step dettagliate
- [ ] Risposte a domande specifiche di nicchia

### 5.3 Authoritativeness (Autorita' nel Settore)
- [ ] Backlink da fonti credibili del settore
- [ ] Presenza su directory di settore
- [ ] Recensioni su piattaforme terze (Google, Trustpilot)
- [ ] NAP consistente (Nome, Indirizzo, Telefono) su tutto il web
- [ ] Menzioni su pubblicazioni indipendenti

### 5.4 Trustworthiness (Affidabilita' — IL PIU' IMPORTANTE)
- [ ] Informazioni contatto chiare: indirizzo fisico, telefono, email
- [ ] Team con nomi reali, foto, bio, qualifiche
- [ ] Prezzi trasparenti e verificabili
- [ ] Privacy policy e cookie policy presenti
- [ ] HTTPS ovunque
- [ ] Recensioni clienti con attribuzione (nome, azienda)
- [ ] Fonti esterne citate per ogni dato numerico
- [ ] Data "ultimo aggiornamento" visibile

---

## PARTE 6 — VIDEO: L'ARMA SEGRETA

### 6.1 Perche' il Video Cambia Tutto
- Video embedded prova "Experience" (la prima E di E-E-A-T) a Google
- Aumenta il tempo sulla pagina → segnale di qualita'
- YouTube e' il secondo motore di ricerca al mondo
- Le AI ora analizzano anche contenuti video per le risposte

### 6.2 Checklist Video per Sito Statico
- [ ] Embed video YouTube su pagine chiave (servizi, chi siamo, case study)
- [ ] Usare `youtube-nocookie.com` per GDPR
- [ ] Attributo `loading="lazy"` sugli iframe video
- [ ] Schema `VideoObject` per ogni video embeddato
- [ ] Titoli e descrizioni video ottimizzati in italiano
- [ ] Trascrizione testuale sotto il video (doppio contenuto per AI)
- [ ] Thumbnail personalizzata per ogni video
- [ ] Cross-link: video YouTube → sito, sito → canale YouTube

### 6.3 Idee Video ad Alto Impatto
1. **"Ecco come costruiamo un sito in codice puro"** — 3-5 min, screencast reale
2. **"PageSpeed: il nostro sito vs WordPress"** — confronto live con dati
3. **"Testimonianza cliente"** — intervista breve con risultati
4. **"Come trovare bandi per la tua azienda"** — tutorial aggregatore
5. **"Perche' prezzo bloccato?"** — spiegazione trasparente business model

---

## PARTE 7 — GAP ANALYSIS TEMPLATE

### 7.1 Checklist Infrastruttura AI-Ready
- [ ] `robots.txt` con whitelist AI bots (GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, GoogleOther)
- [ ] `/llms.txt` creato e aggiornato
- [ ] `/llms-full.txt` opzionale per contenuto completo
- [ ] `/humans.txt` con crediti team
- [ ] `/.well-known/security.txt`
- [ ] `manifest.json` per PWA base
- [ ] `sitemap.xml` aggiornato con tutti gli URL
- [ ] Schema.org JSON-LD su ogni pagina

### 7.2 Checklist Contenuti AI-Ottimizzati
- [ ] Risposta diretta nelle prime 2 righe di ogni sezione H2
- [ ] Dati numerici con fonte citata
- [ ] Tabelle comparative con fonti
- [ ] FAQ strutturate (FAQPage schema)
- [ ] Date "Ultimo aggiornamento" visibili
- [ ] Author bio con Person schema
- [ ] Table of Contents con anchor link
- [ ] Pulsanti condivisione social
- [ ] Contenuti 2500+ parole su argomenti core
- [ ] Immagini originali (no stock)
- [ ] Video embedded con VideoObject schema

### 7.3 Checklist Schema.org Completa
- [ ] Organization (homepage)
- [ ] LocalBusiness (homepage)
- [ ] ProfessionalService (homepage)
- [ ] BreadcrumbList (tutte le pagine)
- [ ] FAQPage (pagine con FAQ)
- [ ] Service + Offer (pagine servizi)
- [ ] AggregateRating (testimonial)
- [ ] Review (singole recensioni)
- [ ] Article/BlogPosting (blog)
- [ ] Person (autore/team)
- [ ] VideoObject (pagine con video)
- [ ] ItemList (pagine con elenchi)
- [ ] HowTo (guide/tutorial)

### 7.4 Checklist Pagine Fondamentali
Per ogni pagina chiave del sito verificare:
- [ ] Title tag unico (max 60 char)
- [ ] Meta description unica (max 160 char)
- [ ] H1 unico con keyword conversazionale
- [ ] Schema.org JSON-LD appropriato
- [ ] Open Graph tags completi (title, description, url, image, type, locale)
- [ ] `<meta name="theme-color">`
- [ ] `<link rel="canonical">`
- [ ] Breadcrumb visibile + BreadcrumbList schema
- [ ] CTA con contrasto >= 4.5:1 (WCAG AA)
- [ ] Registrata in sitemap.xml
- [ ] Link coerenti con navbar/footer
- [ ] GA4 attivo
- [ ] Contenuto risponde a domande conversazionali (prompt-style)

---

## PARTE 8 — PIANO IMPLEMENTAZIONE PRIORITIZZATO

### Priorita' CRITICA (Impatto alto, sforzo basso)
| # | Azione | Tempo stimato |
|---|--------|--------------|
| 1 | Creare `/llms.txt` | 30 min |
| 2 | Aggiungere AI bots mancanti in `robots.txt` | 5 min |
| 3 | AggregateRating schema su testimonial | 1 ora |
| 4 | LocalBusiness schema su homepage | 1 ora |
| 5 | BreadcrumbList su tutte le pagine | 2 ore |
| 6 | ItemList schema per bandi.html | 1 ora |

### Priorita' ALTA (Impatto alto, sforzo medio)
| # | Azione | Tempo stimato |
|---|--------|--------------|
| 7 | Person schema per fondatore + team | 2 ore |
| 8 | Author bio su articoli blog | 3 ore |
| 9 | Table of Contents su articoli | 2 ore |
| 10 | Date "Ultimo aggiornamento" visibili | 1 ora |
| 11 | BlogPosting invece di Article su blog | 1 ora |
| 12 | Video embed su pagine chiave | 3 ore |

### Priorita' MEDIA (Impatto medio, sforzo variabile)
| # | Azione | Tempo stimato |
|---|--------|--------------|
| 13 | manifest.json PWA base | 1 ora |
| 14 | humans.txt | 15 min |
| 15 | .well-known/security.txt | 15 min |
| 16 | Pulsanti share social su blog | 2 ore |
| 17 | VideoObject schema | 1 ora |
| 18 | Immagini originali al posto di stock | Ongoing |

### Priorita' STRATEGICA (Ongoing)
| # | Azione | Frequenza |
|---|--------|-----------|
| 19 | Presenza su directory settoriali | Mensile |
| 20 | Recensioni Google Business | Continua |
| 21 | Contenuti originali con dati proprietari | Settimanale |
| 22 | Monitoring citazioni AI (ChatGPT/Perplexity) | Settimanale |
| 23 | Refresh contenuti cornerstone | Trimestrale |

---

## PARTE 9 — FONTI VERIFICATE

### GEO
- Search Engine Land: "Mastering GEO in 2026" — searchengineland.com
- Firebrand: "GEO Best Practices 2026" — firebrand.marketing
- First Page Sage: "GEO Best Practices" — firstpagesage.com
- Averi: "ChatGPT vs Perplexity vs Google AI Mode Citations 2026" — averi.ai

### Schema.org & AI
- Stackmatix: "Structured Data for AI Search" — stackmatix.com
- Digidop: "Structured Data: Secret Weapon for SEO and GEO" — digidop.com
- Yext: "How Brands Win with AI Agents 2026" — yext.com
- 12AM Agency: "Why Schema Markup is Critical 2026" — 12amagency.com

### llms.txt
- Specifica ufficiale: llmstxt.org
- Google Cloud Community: "Give Your AI Agents Deep Understanding With LLMS.txt"
- FlowHunt: "LLMs.txt Complete Guide" — flowhunt.io
- Bluehost: "What is llms.txt? 2026 Guide" — bluehost.com

### E-E-A-T
- SEO Kreativ: "E-E-A-T Ultimate Guide 2026" — seo-kreativ.de
- iBrand Strategist: "Google E-E-A-T in 2026" — ibrandstrategist.com
- BKND: "E-E-A-T Content Quality Signals 2026" — bknddevelopment.com
- Wellows: "Google AI Overviews Ranking Factors 2026" — wellows.com

### Video SEO
- Marketer Milk: "8 Top SEO Trends 2026" — marketermilk.com
- NumeroUnoWeb: "3 SEO Trends 2026" — numerounoweb.com

### AI Agent Discovery
- Recomaze: "Future of Search 2027-2030" — recomaze.ai
- Sanbi AI: "Agentic Commerce 2026" — sanbi.ai

---

**VERSIONE:** 1.0
**DATA:** 14 Marzo 2026
**AUTORE:** RaaS Automazioni — Analisi strategica AI/GEO
**RIUTILIZZABILE:** Si' — adattare nomi, URL e dati specifici al progetto target
