# Ricerca bandi: fonti ufficiali, verifica e parole chiave

Guida operativa per discovery e validazione (allineata al progetto RaaS: URL istituzionali, no claim inventati).  
Skill Cursor correlata: `.cursor/skills/bandi-nuove-fonti/SKILL.md`.

---

## 1. Verifica delle fonti

### Cosa considerare “ufficiale”

| Livello | Esempi di ambito | Indizi di autenticità |
|--------|-------------------|------------------------|
| **UE** | Programmi quadro, gare, progetti | Domini `europa.eu`, `ec.europa.eu`; [Funding & Tenders Portal](https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home) |
| **Italia** | Ministeri, agenzie, PNRR | `gov.it`, siti ministeriali (es. [MIMIT](https://www.mimit.gov.it/), MASE, MiC, MUR), [incentivi.gov.it](https://www.incentivi.gov.it/), Invitalia, enti nazionali |
| **Regioni / Province / Comuni** | Bandi territoriali | Domini `.gov.it`, portali `regione.*`, `provincia.*`, comuni su domini istituzionali |
| **CCIAA** | Voucher, PID, bandi camera | `*.camcom.it`, [Unioncamere](https://www.unioncamere.gov.it/), PID collegati |

**Nota nomenclatura:** le funzioni un tempo ricollegate al **MISE** sono oggi in gran parte di competenza del **MIMIT** (Ministero delle Imprese e del Made in Italy). Verificare sempre l’ente firmatario sull’avviso.

### Portale nazionale (riferimento verificabile)

- **[incentivi.gov.it](https://www.incentivi.gov.it/)** — portale nazionale per incentivi e agevolazioni della PA; in comunicazione istituzionale è associato al **MIMIT** (es. [notizie su incentivi.gov.it](https://www.mimit.gov.it/it/notizie-stampa/portale-incentivi-gov-it-oltre-1000-gli-incentivi-pubblicati-e-374-le-amministrazioni-coinvolte)). I numeri di bandi/amministrazioni **cambiano nel tempo**: non copiarli in contenuti pubblici senza averli ricontrollati sul sito.

### Controlli incrociati (autenticità)

1. **Stesso provvedimento** ripetuto sul sito dell’**ente erogatore** (non solo aggregatore).
2. Presenza di **riferimenti normativi** (DGR, DM, avviso regionale, CUP/CIG se gara PA).
3. **Contatti istituzionali** (PEC o area trasparenza dello stesso ente).
4. **Red flag:** unica fonte su dominio non istituzionale; landing “lascia email”; testo generico senza allegati ufficiali.

---

## 2. Parole chiave specifiche (template)

Sostituisci `[settore]`, `[Regione]`, `[Provincia]`, `[Comune]`, `[ente]`.

### Nazionale

- `bando [settore] site:gov.it`
- `avviso pubblico [ente] fondo perduto`
- `contributi imprese site:incentivi.gov.it`
- `PNRR [misura] avviso site:gov.it` / `site:mimit.gov.it`

### Regionale

- `bando [settore] [Regione]`
- `avviso pubblico regione [nome] imprese`
- `contributi fondo perduto [Regione]`
- `DGR [Regione] contributi` (dove le regioni pubblicano su delibere)

### Provinciale / Città metropolitana

- `avviso pubblico provincia [nome]`
- `bandi imprese città metropolitana [nome]`

### Comunale

- `avviso pubblico comune [nome]`
- `regolamento contributi comune [nome]`
- `bando imprese comune [nome]`

### Attenzione semantica

- **“Gara d’appalto”** ≠ sempre incentivo a fondo perduto: filtrare con **contributi**, **agevolazioni**, **voucher**, **fondo perduto** se l’obiettivo è finanziamento alle imprese, non solo appalti.

---

## 3. Strategie di ricerca

### Portali istituzionali

- Cercare sezioni: **Bandi e finanziamenti**, **Imprese**, **Sviluppo economico**, **Trasparenza → Bandi di concorso**.
- Usare **filtri per beneficiario** (PMI, startup, terzo settore) e **calendario scadenze** dove presenti.

### Motori di ricerca

- Operatori: virgolette per frasi esatte, `site:dominio.it`, combinazioni `AND` / `OR`.
- **Google Alerts** (o equivalenti) con query strette, es.: `"avviso pubblico" AND "fondo perduto" AND "Veneto"` per ridurre rumore.

### Workflow interno al repo

- Estrarre keyword dal corpus: `npm run build-bandi-keywords` → `data/bandi-keyword-stats.json` (`by_regione`, `by_tipo_ente`, `global`).
- Aggiungere solo **URL verificati** in `FONTI` dentro `supabase/functions/manutenzione-bandi/index.ts`, poi deploy function.

---

## 4. Esempi pratici (query + dove approfondire)

| Ambito | Esempi di query | Dove approfondire (tipo) |
|--------|------------------|----------------------------|
| **Lombardia** | `bandi imprese Lombardia fondo perduto`, `avviso pubblico Regione Lombardia` | Portale bandi regionale, delibere Giunta |
| **Veneto** | `contributi Veneto PMI`, `bandi digitalizzazione Veneto` | Portale regione Veneto / bandi regionali |
| **Area Bologna / Emilia-Romagna** | `bandi Camera Commercio Bologna`, `avviso metropolitana Bologna imprese` | CCIAA Bologna, Città metropolitana, Regione Emilia-Romagna |
| **Nazionale / innovazione** | `smart start invitalia`, `incentivi.gov.it startup` | Invitalia, incentivi.gov.it, MIMIT |

---

## 5. Aggiornamenti e monitoraggio

### Affidabili

- Newsletter degli **enti erogatori** (Regioni, CCIAA, Invitalia, ministeri).
- **RSS/Atom** dei portali che li espongono (se presenti).
- **Manutenzione programmata** (Edge Function `manutenzione-bandi`, admin RaaS).

### Con cautela

- **Social / Telegram / gruppi Facebook**: utili come **radar**, mai come prova di ufficialità senza link al sito istituzionale.
- **Aggregatori commerciali** (es. BandiOnline, Eurodesk, CeSPI, ANCI come punti di ingresso): usare per **discovery**, poi **obbligo** di risalire alla pagina ufficiale dell’ente (coerente con `tools/bandi-link-policy.js`).

---

## 6. Checklist tipologie di fonti (non esaustiva)

### Bandi europei

- [Funding & Tenders Portal (UE)](https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home)
- CORDIS (progetti e risultati)
- Programmi: Horizon Europe, Erasmus+, COSME, Interreg, LIFE, Europa creativa (sempre da siti UE ufficiali)

### Bandi nazionali (Italia)

- Governo / Presidenza del Consiglio (dove pubblicati provvedimenti trasversali)
- Ministeri (MIMIT, MASE, MiC, MUR, … secondo materia)
- [incentivi.gov.it](https://www.incentivi.gov.it/)
- Invitalia, SIMEST, INAIL, SACE, CDP (secondo misura)
- Italia Domani / PNRR (collegamenti da fonti istituzionali)

### Bandi regionali e locali

- Portale di **ogni Regione** (e Province autonome)
- **Province / Città metropolitane / Comuni** (trasparenza e area economica)
- Query tipo: `bandi provincia [nome]`, `bandi comune [nome]` + verifica dominio istituzionale nei risultati

### Camere di Commercio

- Unioncamere, singole CCIAA, PID

---

## 7. Prompt riutilizzabile (per agente o team)

```
Per ogni bando in lista:
1) Indica la fonte ufficiale (URL istituzionale) e un controllo incrociato (secondo sito .gov o ente erogatore).
2) Propone 5–10 keyword di ricerca per trovare misure simili a livello regionale/provinciale/nazionale.
3) Suggerisci una strategia (portale + alert) senza inventare URL non verificati.
```

---

*Ultimo aggiornamento struttura documento: aprile 2026. Aggiornare link e numeri solo dopo verifica sulle fonti citate.*
