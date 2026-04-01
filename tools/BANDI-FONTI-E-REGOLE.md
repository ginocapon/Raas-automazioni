# Bandi: fonti, regole e roadmap (senza API a pagamento obbligatorie)

## Principi

1. **Titoli da aggregatori, link solo ufficiali**  
   Da siti come *Europa Innovazione* si usano **solo i titoli** per scoprire misure nuove. **Non** si pubblicano mai URL che puntano a concorrenti o aggregatori commerciali (`url_bando` nullo finché non c’è fonte istituzionale).

2. **Ogni URL pubblicato deve**  
   - Essere su dominio **istituzionale** ammesso dalla policy in `tools/bandi-link-policy.js` (`.gov.it`, `.europa.eu`, Invitalia, INAIL, regioni `regione.*.it`, `.camcom.it`, ecc.).  
   - **Rispondere in HTTP** (controllo gratuito: `node tools/validate-bandi-links-free.js`).  
   - **Corrispondere al bando** (titolo coerente con la pagina): verifica assistita opzionale con `verify-links-perplexity.js` (richiede chiavi API a pagamento: solo in ambiente di lavoro, non in runtime sito).

3. **Estendere la lista “aggregatori vietati”**  
   Modifica `AGGREGATOR_HOST_SUBSTRINGS` in `bandi-link-policy.js` quando individui nuovi domini da non linkare.

## Fonti gratuite già integrate o citate nel codice

| Fonte | Ruolo | Note |
|--------|--------|------|
| [incentivi.gov.it](https://www.incentivi.gov.it) API + open data | Nazionale, JSON/CSV | Limite query aumentato a 200 nel tool `scrape-bandi.js`; allineato ad `admin.html` / Supabase |
| Portali regionali | Da implementare con parser dedicati | Molte regioni espongono HTML o dataset su sottodomini `regione.*.it` |
| CCIAA | `.camcom.it` | Policy già ammette Camere di Commercio |
| Open data | [dati.gov.it](https://dati.gov.it), [OpenCoesione](https://opencoesione.gov.it) | Utili per qualità dati e geografia; integrazione = lavoro di mapping sui vostri campi |

## Cosa fare senza budget API

- Dopo ogni scrape: `node tools/validate-bandi-links-free.js` (eventuale `--limit=100`).  
- In CI (opzionale): fallire il job se `NON RAGGIUNGIBILE` supera una soglia.  
- Per nuove voci “solo titolo”: marcare `needs_url_verification: true` e compilare `url_bando` solo dopo ricerca manuale o dopo una sessione con Perplexity/Claude in locale.

## Limiti noti

- **Perplexity + Claude** in `verify-links-perplexity.js` sono **opzionali** e a consumo.  
- L’**allineamento titolo ↔ pagina** non è garantito al 100% da nessun automa: serve controllo umano spot sui record ad alto rischio.
