#!/usr/bin/env node
/**
 * Confronta il titolo salvato in Supabase con il <title> della pagina linkata.
 * Se la sovrapposizione lessicale è troppo bassa → incongruenza (opzionale: disattiva riga).
 *
 * Env: SUPABASE_SERVICE_ROLE_KEY solo per --deactivate-incongruent (PATCH attivo=false).
 * Lettura: SUPABASE_ANON_KEY (o default pubblico come app.html).
 *
 * Uso:
 *   node tools/audit-bandi-coherence-supabase.js
 *   node tools/audit-bandi-coherence-supabase.js --offset=0 --limit=200
 *   node tools/audit-bandi-coherence-supabase.js --deactivate-incongruent
 */

const https = require('https');
const path = require('path');
const { fetchPageTitle } = require('./http-fetch-page-title');
const { hostnameOf, isBlockedAggregatorHost } = require('./bandi-link-policy');

const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://ieeriszlalrsbfsnarih.supabase.co';
const PUBLIC_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZXJpc3psYWxyc2Jmc25hcmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNjEyNjAsImV4cCI6MjA4MzczNzI2MH0.Sjwu1620mMTAAoKVHgXHQ1cA-m3hFXqtCtqjAQNErQo';

const STOP = new Set(
  `il la lo le gli un una uno di da in per con su tra fra del della dei delle degli
  che non come anche più più meno tutti tutte questo questa questi queste essere
  sono stato stati stata state essere ha ho hai hanno sia esso essa essi esse
  dal dalla dallo dagli dalla nel negli nella nei sul sulla sui verso tra
  and home page sito web ufficiale ministero regione bando bandi avviso programma
  incentivo contributo finanziamento agevolazione concorso pubblica pubblico
  repubblica italiana italia welcome benvenuto portale`.split(/\s+/)
);

function getKey() {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    PUBLIC_ANON
  );
}

function tokenize(s) {
  if (!s || typeof s !== 'string') return [];
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9àèéìòù\s]/gi, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP.has(w));
}

/** Coefficiente Dice: 2*|A∩B| / (|A|+|B|) */
function diceCoefficient(wordsA, wordsB) {
  const a = new Set(wordsA);
  const b = new Set(wordsB);
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const w of a) {
    if (b.has(w)) inter++;
  }
  return (2 * inter) / (a.size + b.size);
}

function restGet(pathAndQuery, apiKey) {
  return new Promise((resolve, reject) => {
    const u = new URL(pathAndQuery, SUPABASE_URL);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        apikey: apiKey,
        Authorization: 'Bearer ' + apiKey,
        Accept: 'application/json'
      }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('JSON: ' + e.message));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 400)}`));
        }
      });
    });
    req.on('error', reject);
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
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve();
        else reject(new Error(`PATCH ${res.statusCode}: ${data}`));
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

const offsetArg = process.argv.find((a) => a.startsWith('--offset='));
const BATCH_OFFSET = offsetArg ? Math.max(0, parseInt(offsetArg.split('=')[1], 10) || 0) : null;
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const BATCH_LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;
const minDiceArg = process.argv.find((a) => a.startsWith('--min-dice='));
const MIN_DICE = minDiceArg
  ? parseFloat(minDiceArg.split('=')[1]) || 0.12
  : 0.12;
const DEACTIVATE = process.argv.includes('--deactivate-incongruent');

async function fetchBandiSlice(apiKey) {
  if (BATCH_LIMIT != null && BATCH_LIMIT > 0) {
    const off = BATCH_OFFSET != null ? BATCH_OFFSET : 0;
    return restGet(
      `/rest/v1/bandi?select=id,titolo,url,attivo&attivo=eq.true&order=id.asc&limit=${BATCH_LIMIT}&offset=${off}`,
      apiKey
    );
  }
  const all = [];
  let offset = 0;
  const pageSize = 500;
  while (true) {
    const rows = await restGet(
      `/rest/v1/bandi?select=id,titolo,url,attivo&attivo=eq.true&order=id.asc&limit=${pageSize}&offset=${offset}`,
      apiKey
    );
    if (!rows.length) break;
    all.push(...rows);
    if (rows.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

function wordsFromUrlPath(urlStr) {
  try {
    const p = new URL(urlStr).pathname;
    return tokenize(p.replace(/[/._-]+/g, ' '));
  } catch {
    return [];
  }
}

function isIncongruent(titoloDb, pageTitle, urlStr) {
  const a = tokenize(titoloDb);
  const pathWords = wordsFromUrlPath(urlStr);
  const b = tokenize(pageTitle).concat(pathWords);
  if (a.length < 3) return false;
  if (!pageTitle || (b.length < 2 && pathWords.length === 0)) return true;
  const dice = diceCoefficient(a, b);
  if (dice >= MIN_DICE) return false;
  let inter = 0;
  const setB = new Set(b);
  for (const w of a) {
    if (setB.has(w)) inter++;
  }
  if (inter >= 3) return false;
  if (inter >= 2 && dice >= 0.06) return false;
  return true;
}

async function main() {
  const readKey = getKey();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (DEACTIVATE && !serviceKey) {
    console.error(
      'ERRORE: --deactivate-incongruent richiede SUPABASE_SERVICE_ROLE_KEY nel ambiente.'
    );
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════');
  console.log('  COERENZA titolo DB vs <title> pagina (Supabase)');
  console.log('  Soglia Dice min:', MIN_DICE);
  if (BATCH_LIMIT != null)
    console.log(
      '  Lotto: offset',
      BATCH_OFFSET != null ? BATCH_OFFSET : 0,
      'limit',
      BATCH_LIMIT
    );
  console.log('═══════════════════════════════════════════\n');

  const rows = await fetchBandiSlice(readKey);
  console.log('Record da analizzare:', rows.length, '\n');

  let skipped = 0;
  let incongruent = 0;
  let ok = 0;
  let noFetch = 0;
  const bad = [];

  for (const b of rows) {
    const u = (b.url || '').trim();
    const titolo = (b.titolo || '').trim();
    if (!u || u === '#') {
      skipped++;
      continue;
    }
    if (isBlockedAggregatorHost(hostnameOf(u))) {
      skipped++;
      continue;
    }

    const pageTitle = await fetchPageTitle(u);
    if (!pageTitle) {
      noFetch++;
      continue;
    }

    if (isIncongruent(titolo, pageTitle, u)) {
      incongruent++;
      bad.push({
        id: b.id,
        titolo,
        pageTitle: pageTitle.slice(0, 120),
        url: u
      });
      if (DEACTIVATE) {
        try {
          await restPatch(b.id, { attivo: false }, serviceKey);
          console.log('[DISATTIVATO] id=' + b.id);
        } catch (e) {
          console.error('[ERRORE PATCH] id=' + b.id, e.message);
        }
      }
    } else {
      ok++;
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  Coerenti:', ok);
  console.log('  Incongruenze titolo:', incongruent);
  console.log('  Senza titolo pagina / fetch fallito:', noFetch);
  console.log('  Saltati (no URL / aggregatore policy):', skipped);
  console.log('═══════════════════════════════════════════\n');

  if (bad.length && bad.length <= 40) {
    bad.forEach((x) => {
      console.log('--- id=' + x.id);
      console.log(' DB:  ', x.titolo.slice(0, 100));
      console.log(' Web:', x.pageTitle);
      console.log(' URL:', x.url.slice(0, 100));
      console.log('');
    });
  } else if (bad.length > 40) {
    console.log('Prime 15 incongruenze:');
    bad.slice(0, 15).forEach((x) => {
      console.log('id=' + x.id, '|', x.titolo.slice(0, 60) + '…');
    });
    console.log('… totale', bad.length, '\n');
  }

  if (incongruent > 0 && !DEACTIVATE) {
    console.log(
      'Per disattivare: export SUPABASE_SERVICE_ROLE_KEY=… && node tools/audit-bandi-coherence-supabase.js … --deactivate-incongruent\n'
    );
  }

  if (incongruent > 0 && DEACTIVATE) process.exitCode = 0;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
