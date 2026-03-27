#!/usr/bin/env node
/**
 * scrape-bandi.js — Scraping bandi da fonti ufficiali
 *
 * Fonti supportate:
 * - incentivi.gov.it (catalogo nazionale, JSON API)
 * - invitalia.it
 * - mimit.gov.it
 * - europainnovazione.com (aggregatore HTML — solo titoli, link verificati via Perplexity)
 *
 * NOTA europainnovazione.com:
 *   Usiamo questo sito SOLO come sorgente di titoli aggiornati.
 *   NON usiamo i suoi URL (redirect al sito aggregatore).
 *   I link ufficiali vengono trovati automaticamente da verificaLinkBandi()
 *   usando il titolo del bando come chiave di ricerca su Perplexity.
 *
 * Uso: node tools/scrape-bandi.js [--dry-run] [--source=europa_innovazione]
 * Output: Aggiorna data/bandi.json con nuovi bandi trovati
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, '..', 'data', 'bandi.json');
const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_VERIFY = process.argv.includes('--skip-verify');
const SOURCE_FILTER = process.argv.find(a => a.startsWith('--source='));

// Verifica link con Perplexity (opzionale, richiede API keys)
let verificaLinkBandi = null;
try {
  ({ verificaLinkBandi } = require('./verify-links-perplexity'));
} catch (e) {
  // Modulo non disponibile — la verifica verra' saltata
}

// ══════════ FONTI DI SCRAPING ══════════
const FONTI = [
  {
    id: 'incentivi_gov',
    nome: 'Incentivi.gov.it',
    url: 'https://www.incentivi.gov.it/it/api/incentivi?stato=attivo&limit=50',
    parser: parseIncentiviGov
  },
  {
    id: 'invitalia',
    nome: 'Invitalia',
    url: 'https://www.invitalia.it/incentivi-e-strumenti',
    parser: null // Richiede parsing HTML — placeholder
  },
  {
    id: 'mimit',
    nome: 'MIMIT',
    url: 'https://www.mimit.gov.it/it/incentivi',
    parser: null // Richiede parsing HTML — placeholder
  },
  {
    // AGGREGATORE: usa solo i TITOLI dei bandi — NON i link del sito
    // I link ufficiali vengono trovati da verificaLinkBandi() via Perplexity/Claude
    id: 'europa_innovazione',
    nome: 'Europa Innovazione (aggregatore titoli)',
    url: 'https://www.europainnovazione.com/bandi-e-agevolazioni/',
    urlsAlternativi: [
      'https://www.europainnovazione.com/interventi-per-la-nascita-e-lo-sviluppo-di-creazione-dimpresa/',
      'https://www.europainnovazione.com/bandi/',
      'https://www.europainnovazione.com/'
    ],
    parser: parseEuropaInnovazione,
    linkPolicy: 'no_direct' // IMPORTANTE: non usare i link del sito
  }
];

// ══════════ HTTP FETCH ══════════
function fetchURL(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const doFetch = (attempt) => {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'User-Agent': 'RaaS-Bandi-Scraper/1.0 (raasautomazioni.it)',
          'Accept': 'application/json, text/html'
        },
        timeout: 15000
      };

      const req = https.request(options, (res) => {
        // Segui redirect
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return doFetch(attempt); // seguirebbe il redirect
        }

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, body: data, headers: res.headers });
          } else if (attempt < retries) {
            const wait = Math.pow(2, attempt) * 1000;
            console.log(`    Retry ${attempt + 1}/${retries} tra ${wait / 1000}s (HTTP ${res.statusCode})`);
            setTimeout(() => doFetch(attempt + 1), wait);
          } else {
            reject(new Error(`HTTP ${res.statusCode} dopo ${retries} tentativi`));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        if (attempt < retries) {
          setTimeout(() => doFetch(attempt + 1), Math.pow(2, attempt) * 1000);
        } else {
          reject(new Error('Timeout dopo ' + retries + ' tentativi'));
        }
      });

      req.on('error', (e) => {
        if (attempt < retries) {
          setTimeout(() => doFetch(attempt + 1), Math.pow(2, attempt) * 1000);
        } else {
          reject(e);
        }
      });

      req.end();
    };
    doFetch(0);
  });
}

// ══════════ PARSERS ══════════
function parseIncentiviGov(body) {
  try {
    const json = JSON.parse(body);
    const items = json.results || json.data || json.incentivi || [];
    return items.map(item => ({
      id: 'gov_' + (item.id || item.slug || Math.random().toString(36).substr(2, 8)),
      titolo: item.titolo || item.title || item.nome || 'Senza titolo',
      ente: item.ente_erogatore || item.ente || 'Governo Italiano',
      tipo_ente: 'ministero',
      regione: item.regione || 'Nazionale',
      provincia: null,
      url_bando: item.url || item.link || null,
      url_domanda: item.url_domanda || item.url || null,
      data_apertura: item.data_apertura || null,
      data_scadenza: item.data_scadenza || null,
      stato: item.stato === 'attivo' ? 'aperto' : (item.stato || 'aperto'),
      dotazione: item.dotazione || null,
      contributo_min: item.contributo_min || null,
      contributo_max: item.contributo_max || item.importo_max || null,
      percentuale: item.percentuale_contributo || null,
      tipo_contributo: item.tipo_contributo || 'misto',
      beneficiari: item.beneficiari || ['imprese'],
      settori: item.settori || ['tutti'],
      finalita: item.finalita || [],
      keywords: [],
      descrizione: item.descrizione || item.abstract || '',
      data_scraping: new Date().toISOString(),
      fonte_scraping: 'incentivi_gov'
    }));
  } catch (e) {
    console.log('    Parsing JSON fallito, potrebbe essere HTML');
    return [];
  }
}

// ══════════ PARSER: EUROPA INNOVAZIONE (HTML — solo titoli) ══════════
function parseEuropaInnovazione(body) {
  const bandi = [];

  // Helper: decode HTML entities comuni
  function decodeHtml(s) {
    return s
      .replace(/&amp;/g, '&').replace(/&agrave;/g, 'à').replace(/&egrave;/g, 'è')
      .replace(/&igrave;/g, 'ì').replace(/&ograve;/g, 'ò').replace(/&ugrave;/g, 'ù')
      .replace(/&Agrave;/g, 'À').replace(/&Egrave;/g, 'È').replace(/&eacute;/g, 'é')
      .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—').replace(/&nbsp;/g, ' ')
      .replace(/&#8211;/g, '–').replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
      .replace(/&#8217;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .trim();
  }

  // Helper: hash semplice per ID deterministico dal titolo
  function titleToId(t) {
    let h = 0;
    for (let i = 0; i < t.length; i++) h = ((h << 5) - h + t.charCodeAt(i)) | 0;
    return 'ei_' + Math.abs(h).toString(36);
  }

  // Helper: indovina tipo_contributo dal titolo
  function inferTipo(titolo) {
    const t = titolo.toLowerCase();
    if (/fondo perduto|a fondo|contributo a fondo|sussidio/i.test(t)) return 'fondo_perduto';
    if (/tasso agevolato|mutuo|finanziamento|prestito|credito/i.test(t)) return 'tasso_agevolato';
    if (/credito d.imposta|tax credit|bonus/i.test(t)) return 'credito_imposta';
    return 'misto';
  }

  // Helper: indovina regione dal titolo o dal testo circostante
  function inferRegione(titolo) {
    const regioni = [
      'Nazionale','Abruzzo','Basilicata','Calabria','Campania','Emilia-Romagna',
      'Friuli','Lazio','Liguria','Lombardia','Marche','Molise','Piemonte',
      'Puglia','Sardegna','Sicilia','Toscana','Trentino','Umbria','Valle d\'Aosta','Veneto'
    ];
    for (const r of regioni) {
      if (new RegExp(r, 'i').test(titolo)) return r;
    }
    return 'Nazionale';
  }

  // Helper: indovina tipo_ente dal titolo
  function inferTipoEnte(titolo) {
    const t = titolo.toLowerCase();
    if (/cciaa|camera di commercio|camere di commercio/i.test(t)) return 'cciaa';
    if (/regione|fesr|fse|por|psr/i.test(t)) return 'regione';
    if (/inail|inps|invitalia|simest|mimit|mise|miur|mef/i.test(t)) return 'ente_nazionale';
    if (/ministero|governo|gal|pnrr/i.test(t)) return 'ministero';
    return 'altro';
  }

  // Estrai titoli da H1/H2/H3/H4 + titoli da tag <a> dentro article/card
  // Pattern multipli per coprire strutture diverse del sito
  const patterns = [
    // Heading tags
    /<h[1-4][^>]*class="[^"]*(?:title|titolo|entry|post)[^"]*"[^>]*>([\s\S]*?)<\/h[1-4]>/gi,
    /<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi,
    // Link di titolo dentro article o card
    /<article[^>]*>[\s\S]*?<a[^>]*href="[^"]*"[^>]*>([^<]{25,200})<\/a>/gi,
    // Titoli dentro classi comuni dei CMS
    /<[^>]+class="[^"]*(?:entry-title|post-title|card-title|bando-title)[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/gi
  ];

  const seenTitles = new Set();

  for (const regex of patterns) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(body)) !== null) {
      // Rimuovi tag HTML interni e decodifica
      let raw = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const titolo = decodeHtml(raw);

      // Filtri qualità
      if (titolo.length < 20 || titolo.length > 250) continue;
      if (/home|chi siamo|contatti|privacy|cookie|menu|search|login|register/i.test(titolo)) continue;
      if (/^(leggi|vai|clicca|scopri|torna|condividi|stampa)/i.test(titolo)) continue;

      const titoloKey = titolo.toLowerCase().replace(/\s+/g, ' ');
      if (seenTitles.has(titoloKey)) continue;
      seenTitles.add(titoloKey);

      bandi.push({
        id: titleToId(titoloKey),
        titolo: titolo,
        ente: 'Da verificare',      // Verrà aggiornato dalla verifica
        tipo_ente: inferTipoEnte(titolo),
        regione: inferRegione(titolo),
        provincia: null,
        url_bando: null,            // NESSUN link da europainnovazione.com
        url_domanda: null,          // Sarà trovato da verificaLinkBandi()
        data_apertura: null,
        data_scadenza: null,
        stato: 'aperto',
        dotazione: null,
        contributo_min: null,
        contributo_max: null,
        percentuale: null,
        tipo_contributo: inferTipo(titolo),
        beneficiari: ['imprese'],
        settori: ['tutti'],
        finalita: [],
        keywords: [],
        descrizione: '',
        data_scraping: new Date().toISOString(),
        fonte_scraping: 'europa_innovazione',
        needs_url_verification: true  // flag: Perplexity deve trovare il link ufficiale
      });
    }
  }

  console.log(`    Titoli estratti da Europa Innovazione: ${bandi.length}`);
  console.log('    NOTA: url_bando=null — link ufficiali da trovare con verificaLinkBandi()');
  return bandi;
}

// ══════════ MERGE LOGIC ══════════
function mergeBandi(existing, newBandi) {
  const existingIds = new Set(existing.map(b => b.id));
  const existingTitles = new Set(existing.map(b => b.titolo.toLowerCase()));
  let added = 0;

  for (const nb of newBandi) {
    // Evita duplicati per ID o titolo simile
    if (existingIds.has(nb.id)) continue;
    if (existingTitles.has(nb.titolo.toLowerCase())) continue;

    // Controlla somiglianza titolo
    const isDuplicate = existing.some(eb => {
      const sim = similarity(eb.titolo.toLowerCase(), nb.titolo.toLowerCase());
      return sim > 0.7;
    });
    if (isDuplicate) continue;

    existing.push(nb);
    existingIds.add(nb.id);
    existingTitles.add(nb.titolo.toLowerCase());
    added++;
    console.log(`    [NUOVO] ${nb.titolo}`);
  }

  return added;
}

function similarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;

  // Semplice Jaccard su parole
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;
  return intersection / union;
}

// ══════════ MAIN ══════════
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  SCRAPE BANDI — RaaS Automazioni');
  console.log('  ' + new Date().toISOString());
  if (DRY_RUN) console.log('  [DRY RUN - nessuna modifica]');
  console.log('═══════════════════════════════════════════\n');

  // Carica JSON esistente
  const fileData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const bandi = fileData.bandi;
  console.log(`Bandi esistenti: ${bandi.length}\n`);

  let totalNuovi = 0;

  for (const fonte of FONTI) {
    if (SOURCE_FILTER && !SOURCE_FILTER.includes(fonte.id)) continue;
    if (!fonte.parser) {
      console.log(`[${fonte.nome}] Parser non disponibile — skip`);
      console.log('  Fonte richiede parsing HTML, usare aggiornamento manuale\n');
      continue;
    }

    if (fonte.linkPolicy === 'no_direct') {
      console.log(`[${fonte.nome}] MODALITA' TITOLI-ONLY — i link verranno trovati via Perplexity`);
    }

    // Per fonti con URL alternativi (es. europainnovazione), prova in ordine finche' uno funziona
    const urlsDaTentare = [fonte.url, ...(fonte.urlsAlternativi || [])];
    let success = false;

    for (const tentativeUrl of urlsDaTentare) {
      console.log(`[${fonte.nome}] Scraping da ${tentativeUrl}`);
      try {
        const response = await fetchURL(tentativeUrl);
        const nuoviBandi = fonte.parser(response.body);
        console.log(`  Trovati: ${nuoviBandi.length} bandi`);

        const aggiunti = mergeBandi(bandi, nuoviBandi);
        totalNuovi += aggiunti;
        console.log(`  Nuovi aggiunti: ${aggiunti}\n`);
        success = true;
        break; // URL funzionante trovato, passa alla fonte successiva
      } catch (e) {
        console.log(`  ERRORE su ${tentativeUrl}: ${e.message}`);
        if (urlsDaTentare.indexOf(tentativeUrl) < urlsDaTentare.length - 1) {
          console.log('  Provo URL alternativo...');
        }
      }
    }

    if (!success) {
      console.log(`  Tutti gli URL per ${fonte.nome} hanno fallito\n`);
    }
  }

  // Aggiorna scadenze
  const oggi = new Date().toISOString().split('T')[0];
  let scaduti = 0;
  bandi.forEach(b => {
    if (b.data_scadenza && b.data_scadenza < oggi && b.stato !== 'chiuso') {
      b.stato = 'chiuso';
      scaduti++;
    }
  });

  // ══════════ VERIFICA LINK CON PERPLEXITY ══════════
  let linkVerificati = 0;
  let linkAggiornati = 0;
  const hasApiKeys = process.env.ANTHROPIC_API_KEY && process.env.PERPLEXITY_API_KEY;

  if (!SKIP_VERIFY && verificaLinkBandi && hasApiKeys) {
    console.log('\n── VERIFICA LINK (Claude + Perplexity) ──');

    // Bandi da europainnovazione senza URL: priorità massima alla verifica
    const needsVerification = bandi.filter(b => b.needs_url_verification && !b.url_bando);
    if (needsVerification.length > 0) {
      console.log(`  Bandi Europa Innovazione senza URL: ${needsVerification.length} — verifica prioritaria`);
    }

    try {
      const risultati = await verificaLinkBandi(bandi, {
        // Priorità: prima i bandi senza URL (da europainnovazione), poi i nuovi normali
        onlyNew: totalNuovi > 0,
        maxBandi: Math.max(totalNuovi, needsVerification.length, 10),
        prioritizeNeedsVerification: true,
        verbose: true
      });
      linkVerificati = risultati.verificati;
      linkAggiornati = risultati.aggiornati;
    } catch (e) {
      console.log(`  Verifica link fallita: ${e.message}`);
      console.log('  Il processo continua senza verifica.\n');
    }
  } else if (!SKIP_VERIFY && !hasApiKeys) {
    console.log('\nVerifica link saltata (API keys non configurate)');
    console.log('  Configura ANTHROPIC_API_KEY e PERPLEXITY_API_KEY per abilitare\n');
  }

  // Salva
  if (!DRY_RUN) {
    fileData.metadata.generated_at = new Date().toISOString();
    fileData.metadata.total_bandi = bandi.length;
    if (linkVerificati > 0) {
      fileData.metadata.last_link_verification = new Date().toISOString();
    }
    fs.writeFileSync(JSON_PATH, JSON.stringify(fileData, null, 2), 'utf8');
    console.log('JSON aggiornato e salvato.');
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(`  RISULTATO: +${totalNuovi} nuovi, ${scaduti} scaduti`);
  if (linkVerificati > 0) {
    console.log(`  Link verificati: ${linkVerificati}, aggiornati: ${linkAggiornati}`);
  }
  console.log(`  Totale bandi: ${bandi.length}`);
  console.log('═══════════════════════════════════════════\n');

  // Output per GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `new_bandi=${totalNuovi}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `total_bandi=${bandi.length}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `expired_bandi=${scaduti}\n`);
  }
}

main().catch(e => {
  console.error('ERRORE FATALE:', e);
  process.exit(1);
});
