/**
 * Script di scraping automatico bandi agevolazioni italiane.
 *
 * Fonti istituzionali monitorate:
 * - Invitalia
 * - MIMIT (Ministero Imprese e Made in Italy)
 * - SIMEST (Gruppo CDP)
 * - INAIL
 *
 * Eseguito ogni lunedi alle 06:00 UTC via GitHub Actions.
 * Aggiorna la tabella `bandi` su Supabase e genera data/bandi.json.
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- Configurazione ----------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Errore: SUPABASE_URL e SUPABASE_SERVICE_KEY sono obbligatori.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ---------- Definizione fonti ----------

const FONTI = [
  {
    id: 'invitalia',
    nome: 'Invitalia',
    url: 'https://www.invitalia.it/cosa-facciamo/creiamo-nuove-aziende',
    parser: parseInvitalia,
  },
  {
    id: 'mimit',
    nome: 'MIMIT',
    url: 'https://www.mimit.gov.it/it/incentivi',
    parser: parseMIMIT,
  },
  {
    id: 'simest',
    nome: 'SIMEST',
    url: 'https://www.simest.it/prodotti-702/finanziamenti-agevolati',
    parser: parseSIMEST,
  },
  {
    id: 'inail',
    nome: 'INAIL',
    url: 'https://www.inail.it/cs/internet/attivita/prevenzione-e-sicurezza/agevolazioni-e-finanziamenti.html',
    parser: parseINAIL,
  },
];

// ---------- Funzione fetch pagina ----------

/**
 * Scarica il contenuto HTML di una pagina.
 * Ritorna stringa HTML o null in caso di errore.
 */
async function fetchPagina(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; RaaSBandiBot/1.0; +https://www.raasautomazioni.it)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'it-IT,it;q=0.9',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.warn(`[${url}] HTTP ${response.status}`);
      return null;
    }

    return await response.text();
  } catch (err) {
    console.warn(`[${url}] Errore fetch: ${err.message}`);
    return null;
  }
}

// ---------- Parser per fonte ----------
// Ogni parser riceve l'HTML della pagina e ritorna un array di oggetti bando
// con lo schema compatibile con data/bandi.json.
// I parser sono placeholder: l'HTML di ogni sito ha struttura diversa
// e va analizzato caso per caso.

/**
 * Parser Invitalia
 *
 * TODO: Implementare il parsing reale.
 * La pagina Invitalia elenca gli incentivi in card/box con:
 * - Titolo del bando (tag <h3> o <a> dentro .card)
 * - Link alla pagina dettaglio
 * - Stato (aperto/chiuso)
 * - Destinatari
 *
 * Strategia consigliata:
 * 1. Cercare i container .card o .incentivo-item
 * 2. Estrarre titolo, URL dettaglio, stato
 * 3. Per ogni bando, fare fetch della pagina dettaglio per importo e scadenza
 */
async function parseInvitalia(html) {
  console.log('[Invitalia] Parser placeholder - da implementare con parsing HTML reale');

  // Placeholder: ritorna array vuoto.
  // Quando implementato, ritornera' oggetti con questo schema:
  // {
  //   id: 'inv_xxx',
  //   titolo: 'Nome Bando',
  //   ente: 'Invitalia',
  //   tipo_ente: 'ente_nazionale',
  //   regione: 'Nazionale',
  //   provincia: null,
  //   url_bando: 'https://...',
  //   url_domanda: 'https://...',
  //   data_apertura: '2026-01-01',
  //   data_scadenza: null,
  //   stato: 'aperto',
  //   dotazione: null,
  //   contributo_min: null,
  //   contributo_max: null,
  //   percentuale: null,
  //   tipo_contributo: 'fondo_perduto',
  //   beneficiari: [],
  //   settori: [],
  //   finalita: [],
  //   keywords: [],
  //   descrizione: '',
  //   data_scraping: new Date().toISOString(),
  //   fonte_scraping: 'invitalia'
  // }
  return [];
}

/**
 * Parser MIMIT
 *
 * TODO: Implementare il parsing reale.
 * La pagina MIMIT /it/incentivi elenca gli incentivi attivi con:
 * - Titolo incentivo
 * - Stato (attivo, in fase di attivazione, chiuso)
 * - Link alla scheda dettaglio
 * - Categoria (agevolazioni, crediti d'imposta, ecc.)
 *
 * Strategia consigliata:
 * 1. Cercare la lista incentivi nel DOM (tipicamente <ul> o <div> con classe specifica)
 * 2. Estrarre titolo, link, stato per ogni voce
 * 3. Navigare le pagine dettaglio per importi e scadenze
 */
async function parseMIMIT(html) {
  console.log('[MIMIT] Parser placeholder - da implementare con parsing HTML reale');
  return [];
}

/**
 * Parser SIMEST
 *
 * TODO: Implementare il parsing reale.
 * La pagina SIMEST elenca i finanziamenti agevolati con:
 * - Nome prodotto finanziario
 * - Descrizione sintetica
 * - Link alla pagina dettaglio
 * - Tipologia (finanziamento agevolato, fondo perduto, ecc.)
 *
 * Strategia consigliata:
 * 1. Cercare i blocchi prodotto nella pagina
 * 2. Estrarre nome, descrizione, URL dettaglio
 * 3. Dalla pagina dettaglio estrarre importi, percentuali, requisiti
 */
async function parseSIMEST(html) {
  console.log('[SIMEST] Parser placeholder - da implementare con parsing HTML reale');
  return [];
}

/**
 * Parser INAIL
 *
 * TODO: Implementare il parsing reale.
 * La pagina INAIL agevolazioni e finanziamenti contiene:
 * - Elenco bandi ISI (annuali)
 * - Riduzione tasso medio per prevenzione
 * - Link a pagine dettaglio con importi e scadenze
 *
 * Strategia consigliata:
 * 1. Cercare i link ai bandi ISI nella pagina
 * 2. Estrarre anno, dotazione, stato (aperto/chiuso/click day)
 * 3. Dalla pagina dettaglio estrarre assi di finanziamento e importi
 */
async function parseINAIL(html) {
  console.log('[INAIL] Parser placeholder - da implementare con parsing HTML reale');
  return [];
}

// ---------- Logica principale ----------

async function main() {
  console.log('=== Scraping bandi agevolazioni ===');
  console.log(`Data: ${new Date().toISOString()}`);
  console.log('');

  const tuttiBandiNuovi = [];

  // 1. Scraping da ogni fonte
  for (const fonte of FONTI) {
    console.log(`--- Elaborazione fonte: ${fonte.nome} (${fonte.url}) ---`);

    const html = await fetchPagina(fonte.url);

    if (!html) {
      console.warn(`Impossibile scaricare ${fonte.nome}, salto alla prossima fonte.`);
      continue;
    }

    console.log(`HTML scaricato: ${html.length} caratteri`);

    const bandi = await fonte.parser(html);
    console.log(`Bandi estratti da ${fonte.nome}: ${bandi.length}`);

    tuttiBandiNuovi.push(...bandi);
    console.log('');
  }

  console.log(`Totale bandi estratti da scraping: ${tuttiBandiNuovi.length}`);

  // 2. Upsert su Supabase (se ci sono nuovi bandi)
  if (tuttiBandiNuovi.length > 0) {
    console.log('Upsert bandi su Supabase...');

    const { data, error } = await supabase
      .from('bandi')
      .upsert(tuttiBandiNuovi, {
        onConflict: 'id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Errore upsert Supabase:', error.message);
    } else {
      console.log(`Upsert completato: ${tuttiBandiNuovi.length} record elaborati.`);
    }
  } else {
    console.log(
      'Nessun nuovo bando estratto dai parser (placeholder attivi). ' +
      'Procedo con export da Supabase dei bandi esistenti.'
    );
  }

  // 3. Esporta tutti i bandi attivi da Supabase come data/bandi.json
  console.log('');
  console.log('Export bandi da Supabase...');

  const { data: bandiAttivi, error: errExport } = await supabase
    .from('bandi')
    .select('*')
    .order('data_scraping', { ascending: false });

  if (errExport) {
    console.error('Errore export da Supabase:', errExport.message);
    console.log('Mantengo il file bandi.json esistente.');
    return;
  }

  if (!bandiAttivi || bandiAttivi.length === 0) {
    console.log('Nessun bando trovato su Supabase. Mantengo il file esistente.');
    return;
  }

  // Estrai fonti uniche
  const fontiUniche = [...new Set(bandiAttivi.map((b) => b.fonte_scraping).filter(Boolean))];

  const output = {
    metadata: {
      version: '3.0.0',
      generated_at: new Date().toISOString(),
      total_bandi: bandiAttivi.length,
      sources: fontiUniche,
    },
    bandi: bandiAttivi,
  };

  // Assicura che la directory data/ esista
  const dataDir = resolve(ROOT, 'data');
  mkdirSync(dataDir, { recursive: true });

  const outputPath = resolve(dataDir, 'bandi.json');
  writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`File scritto: ${outputPath}`);
  console.log(`Totale bandi esportati: ${bandiAttivi.length}`);
  console.log('');
  console.log('=== Scraping completato ===');
}

main().catch((err) => {
  console.error('Errore fatale:', err);
  process.exit(1);
});
