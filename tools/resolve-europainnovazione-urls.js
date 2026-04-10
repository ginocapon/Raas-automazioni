#!/usr/bin/env node
/**
 * Sostituisce URL europainnovazione.com con link istituzionali (estrazione dalla pagina
 * aggregatore + punteggio host PA/UE/CCIAA) oppure disattiva il bando se non risolvibile.
 *
 * Policy: niente link a competitor in pubblicazione; lo scraping della pagina aggregatore
 * serve solo a recuperare href verso .gov.it / incentivi / regione / camcom / invitalia / ecc.
 *
 * Env obbligatorio per scrittura: SUPABASE_SERVICE_ROLE_KEY
 * Env opzionali: SUPABASE_URL
 *
 * Uso:
 *   node tools/resolve-europainnovazione-urls.js --dry-run --limit=5
 *   node tools/resolve-europainnovazione-urls.js --apply --limit=100
 *   node tools/resolve-europainnovazione-urls.js --apply --all   # batch da 100 fino a esaurimento
 *   node tools/resolve-europainnovazione-urls.js --apply --all --perplexity   # + PERPLEXITY_API_KEY (costi API)
 *
 * Tra una richiesta HTTP all’aggregatore e la successiva: pausa (rispetto ToS / rate).
 */

const https = require('https');
const http = require('http');
const {
  hostnameOf,
  isAcceptableOfficialBandoUrl,
  isBlockedAggregatorHost,
} = require('./bandi-link-policy');

const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://ieeriszlalrsbfsnarih.supabase.co';
const BATCH = 100;
const PAUSE_MS = 450;

function argVal(name, def) {
  const a = process.argv.find((x) => x.startsWith(name + '='));
  if (!a) return def;
  return a.slice(name.length + 1).trim() || def;
}

const DRY = process.argv.includes('--dry-run') || !process.argv.includes('--apply');
const RUN_ALL = process.argv.includes('--all');
const USE_PERPLEXITY = process.argv.includes('--perplexity');
const LIMIT = Math.min(
  500,
  Math.max(1, parseInt(argVal('--limit', String(BATCH)), 10) || BATCH)
);

function isOfficialInstitutionalUrl(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return false;
  if (isAcceptableOfficialBandoUrl(urlStr)) return true;
  try {
    const h = hostnameOf(urlStr).replace(/^www\./i, '').toLowerCase();
    if (isBlockedAggregatorHost(h)) return false;
    if (h.includes('regione.')) return true;
    if (h.includes('provincia.')) return true;
    return false;
  } catch {
    return false;
  }
}

function scoreOfficialUrl(urlStr) {
  if (!isOfficialInstitutionalUrl(urlStr)) return -1;
  try {
    const h = hostnameOf(urlStr).replace(/^www\./i, '').toLowerCase();
    if (h.includes('incentivi.gov.it')) return 100;
    if (h.endsWith('.gov.it')) return 90;
    if (/invitalia\.it$/i.test(h)) return 88;
    if (/\.camcom\.(it|gov\.it)$/i.test(h) || h.includes('camcom')) return 82;
    if (h.includes('regione.') || h.endsWith('.regione.it')) return 85;
    if (h.endsWith('.europa.eu')) return 80;
    return 70;
  } catch {
    return 70;
  }
}

function collectUrlCandidates(html) {
  const raw = [];
  const reHref = /href\s*=\s*["'](https?:\/\/[^"'>\s]+)/gi;
  let m;
  while ((m = reHref.exec(html)) !== null) {
    let u = m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    if (u.includes('#')) u = u.split('#')[0];
    raw.push(u);
  }
  const reBare =
    /\b(https?:\/\/[a-zA-Z0-9][-a-zA-Z0-9._~:/%?#[\]@!$&'()*+,;=]*)/g;
  while ((m = reBare.exec(html)) !== null) {
    let u = m[0].replace(/[.,;)\]}>'"\]]+$/g, '');
    raw.push(u);
  }
  const seen = new Set();
  const uniq = [];
  for (const u of raw) {
    const k = u.slice(0, 220);
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(u);
  }
  return uniq;
}

function pickBestOfficialFromHtml(html) {
  const candidates = collectUrlCandidates(html);
  let best = null;
  let bestScore = -1;
  for (const u of candidates) {
    const s = scoreOfficialUrl(u);
    if (s > bestScore) {
      bestScore = s;
      best = u;
    }
  }
  return bestScore >= 70 ? best : null;
}

function queryPerplexityOfficialUrl(titolo, ente) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return Promise.resolve(null);
  const payload = JSON.stringify({
    model: 'sonar-pro',
    messages: [
      {
        role: 'system',
        content:
          'Trova solo URL istituzionali italiani o UE: .gov.it, .governo.it, .europa.eu, incentivi.gov.it, invitalia.it, inail.it, simest.it, sace.it, ice.it, domini regione.*.it, provincia.*.it, .camcom.it / .camcom.gov.it. Mai aggregatori commerciali di bandi.',
      },
      {
        role: 'user',
        content: `Qual è l'URL ufficiale della pagina del bando o dell'avviso (scheda precisa, non solo home)? Rispondi con un solo URL https. Titolo: ${String(titolo).slice(0, 450)}. Ente indicato: ${String(ente || '').slice(0, 120)}.`,
      },
    ],
    return_citations: true,
    max_tokens: 400,
  });
  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.perplexity.ai',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 35000,
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode < 200 || res.statusCode >= 300) {
            resolve(null);
            return;
          }
          const content = json.choices?.[0]?.message?.content || '';
          const citations = json.citations || [];
          const urls = [];
          for (const c of citations) {
            if (typeof c === 'string' && /^https?:\/\//i.test(c)) urls.push(c);
          }
          for (const x of content.matchAll(/https?:\/\/[^\s\])"'<>]+/g)) {
            urls.push(x[0].replace(/[.,;)+]+$/g, ''));
          }
          let best = null;
          let bestScore = -1;
          for (const u of urls) {
            const s = scoreOfficialUrl(u);
            if (s > bestScore) {
              bestScore = s;
              best = u;
            }
          }
          resolve(bestScore >= 70 ? best : null);
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.write(payload);
    req.end();
  });
}

function fetchUrl(urlStr) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const lib = u.protocol === 'https:' ? https : http;
      const opts = {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; RaaS-BandiResolve/1.0; +https://www.raasautomazioni.it)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 22000,
      };
      const req = lib.request(opts, (res) => {
        let chunks = [];
        const max = 2_000_000;
        let n = 0;
        res.on('data', (c) => {
          n += c.length;
          if (n <= max) chunks.push(c);
        });
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 400,
            status: res.statusCode,
            body,
          });
        });
      });
      req.on('error', () => resolve({ ok: false, status: 0, body: '' }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, status: 0, body: '' });
      });
      req.end();
    } catch {
      resolve({ ok: false, status: 0, body: '' });
    }
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function restGet(path, key) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, SUPABASE_URL);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + key,
        Accept: 'application/json',
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 500)}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('timeout'));
    });
    req.end();
  });
}

function restPatch(id, body, serviceKey) {
  return new Promise((resolve, reject) => {
    const pathq = `/rest/v1/bandi?id=eq.${encodeURIComponent(id)}`;
    const u = new URL(pathq, SUPABASE_URL);
    const postData = JSON.stringify(body);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(true);
        else reject(new Error(`PATCH ${res.statusCode}: ${data}`));
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function fetchBatch(serviceKey, limit) {
  const q = [
    'select=id,titolo,url,ente,regione,attivo',
    'url=ilike.' + encodeURIComponent('%europainnovazione%'),
    'order=id.asc',
    'limit=' + limit,
  ].join('&');
  return restGet('/rest/v1/bandi?' + q, serviceKey);
}

async function processOne(row, dry) {
  const oldUrl = row.url || '';
  const res = await fetchUrl(oldUrl);
  if (!res.ok || !res.body) {
    return {
      action: 'deactivate',
      reason: 'fetch_fail',
      newUrl: null,
    };
  }
  let found = pickBestOfficialFromHtml(res.body);
  if (found) {
    return { action: 'replace', reason: 'extracted_html', newUrl: found };
  }
  if (USE_PERPLEXITY && process.env.PERPLEXITY_API_KEY) {
    found = await queryPerplexityOfficialUrl(row.titolo, row.ente);
    await sleep(1200);
    if (found) {
      return { action: 'replace', reason: 'perplexity', newUrl: found };
    }
  }
  return { action: 'deactivate', reason: 'no_official_url', newUrl: null };
}

async function runBatch(rows, serviceKey, dry) {
  let replaced = 0;
  let deactivated = 0;
  let errors = 0;
  for (const row of rows) {
    let outcome;
    try {
      outcome = await processOne(row, dry);
    } catch (e) {
      console.error('id', row.id, 'process error', e.message);
      errors++;
      await sleep(PAUSE_MS);
      continue;
    }
    if (dry) {
      console.log(
        `[dry-run] id=${row.id} action=${outcome.action} reason=${outcome.reason} newUrl=${outcome.newUrl || '(none)'} titolo=${(row.titolo || '').slice(0, 70)}`
      );
    } else if (outcome.action === 'replace' && outcome.newUrl) {
      try {
        await restPatch(
          row.id,
          {
            url: outcome.newUrl,
          },
          serviceKey
        );
        replaced++;
        console.log(`OK replace id=${row.id} -> ${outcome.newUrl}`);
      } catch (e) {
        console.error(`FAIL patch id=${row.id}`, e.message);
        errors++;
      }
    } else {
      try {
        await restPatch(
          row.id,
          {
            attivo: false,
            url: null,
          },
          serviceKey
        );
        deactivated++;
        console.log(`OK deactivate id=${row.id} (${outcome.reason})`);
      } catch (e) {
        try {
          await restPatch(
            row.id,
            {
              attivo: false,
            },
            serviceKey
          );
          deactivated++;
          console.log(`OK deactivate (no url null) id=${row.id}`);
        } catch (e2) {
          console.error(`FAIL deactivate id=${row.id}`, e.message, e2.message);
          errors++;
        }
      }
    }
    await sleep(PAUSE_MS);
  }
  return { replaced, deactivated, errors };
}

async function main() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!DRY && !serviceKey) {
    console.error(
      'Serve SUPABASE_SERVICE_ROLE_KEY per --apply (mai committare la chiave).'
    );
    process.exit(1);
  }
  const readKey =
    serviceKey ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!readKey) {
    console.error(`
ERRORE: manca una chiave API valida per leggere la tabella bandi.

1) Apri Supabase → il TUO progetto → Settings → API
2) Copia il Project URL e (scegli UNA delle chiavi):
   - anon public  → per sola lettura / dry-run
   - service_role → va bene anche per dry-run e serve per --apply

Nel terminale (stessa sessione in cui lanci npm):

  export SUPABASE_URL='https://XXXX.supabase.co'
  export SUPABASE_ANON_KEY='incolla_anon_o_service_role'
  # oppure, se usi la service role:
  export SUPABASE_SERVICE_ROLE_KEY='incolla_service_role'

Poi rilancia il comando. Non committare mai le chiavi.
`);
    process.exit(1);
  }

  let totalReplaced = 0;
  let totalDeactivated = 0;
  let totalErrors = 0;
  let batchNum = 0;

  do {
    batchNum++;
    let rows;
    try {
      rows = await fetchBatch(readKey, LIMIT);
    } catch (e) {
      if (String(e.message).includes('401')) {
        console.error(`
HTTP 401 — chiave rifiutata da Supabase.

Controlla di aver incollato la chiave COMPLETA (anon o service_role) del progetto
che contiene la tabella bandi, e che SUPABASE_URL corrisponda a quel progetto
(Settings → API → Project URL).

Se hai ruotato le chiavi, usa quelle attuali dalla dashboard.
`);
      }
      throw e;
    }
    if (!rows.length) {
      console.log('Nessun record con URL europainnovazione: fine.');
      break;
    }
    console.log(
      `\n--- Batch ${batchNum}: ${rows.length} record (dry=${DRY}, limit=${LIMIT}) ---\n`
    );
    const stats = await runBatch(rows, serviceKey, DRY);
    totalReplaced += stats.replaced;
    totalDeactivated += stats.deactivated;
    totalErrors += stats.errors;
    if (!RUN_ALL) break;
    await sleep(2000);
  } while (RUN_ALL);

  console.log('\nRiepilogo:', {
    sostituiti: totalReplaced,
    disattivati: totalDeactivated,
    errori: totalErrors,
    dry_run: DRY,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
