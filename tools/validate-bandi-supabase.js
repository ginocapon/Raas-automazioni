#!/usr/bin/env node
/**
 * Validazione HTTP di tutti i link bandi su Supabase (tabella public.bandi, attivo=true).
 * Stessa logica di tools/http-verify-url.js e bandi-link-policy.js.
 *
 * Env: SUPABASE_URL, SUPABASE_ANON_KEY (se assenti, usa chiave anon pubblica come in app.html — solo lettura).
 *
 * Uso:
 *   node tools/validate-bandi-supabase.js
 *   node tools/validate-bandi-supabase.js --concurrency=15
 *   node tools/validate-bandi-supabase.js --save-report=data/bandi-supabase-link-report.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { verifyUrlResponds } = require('./http-verify-url');
const { hostnameOf, isBlockedAggregatorHost } = require('./bandi-link-policy');

const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://ieeriszlalrsbfsnarih.supabase.co';

const concArg = process.argv.find((a) => a.startsWith('--concurrency='));
const CONCURRENCY = concArg
  ? Math.min(50, Math.max(1, parseInt(concArg.split('=')[1], 10) || 10))
  : 10;
const saveArg = process.argv.find((a) => a.startsWith('--save-report='));
const SAVE_REPORT = saveArg ? saveArg.split('=').slice(1).join('=').trim() : '';

const PUBLIC_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZXJpc3psYWxyc2Jmc25hcmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNjEyNjAsImV4cCI6MjA4MzczNzI2MH0.Sjwu1620mMTAAoKVHgXHQ1cA-m3hFXqtCtqjAQNErQo';

function getKey() {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    PUBLIC_ANON
  );
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
            reject(new Error('JSON parse: ' + e.message));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 500)}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function fetchAllActiveBandi(apiKey) {
  const all = [];
  let offset = 0;
  const pageSize = 1000;
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

async function main() {
  const apiKey = getKey();
  if (!apiKey) {
    console.error('ERRORE: impossibile determinare SUPABASE_ANON_KEY');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════');
  console.log('  VALIDAZIONE LINK BANDI — Supabase (attivo=true)');
  console.log('  Concorrenza:', CONCURRENCY);
  console.log('═══════════════════════════════════════════\n');

  const bandi = await fetchAllActiveBandi(apiKey);
  console.log('Record caricati dal DB:', bandi.length, '\n');

  let ok = 0;
  let noUrl = 0;
  let blocked = 0;
  let unreachable = 0;
  const failures = [];

  const queue = bandi.slice();
  let done = 0;

  async function worker() {
    while (queue.length) {
      const b = queue.shift();
      const u = (b.url || '').trim();
      const titolo = (b.titolo || String(b.id) || '').toString().slice(0, 80);
      if (!u || u === '#') {
        noUrl++;
        done++;
        continue;
      }
      const host = hostnameOf(u);
      if (isBlockedAggregatorHost(host)) {
        blocked++;
        failures.push({ id: b.id, titolo, url: u, reason: 'aggregatore_policy' });
        done++;
        continue;
      }
      const up = await verifyUrlResponds(u);
      if (up) ok++;
      else {
        unreachable++;
        failures.push({ id: b.id, titolo, url: u, reason: 'http_unreachable' });
      }
      done++;
      if (done % 100 === 0 || done === bandi.length) {
        process.stdout.write(`  … ${done}/${bandi.length} controllati\r`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  console.log('\n═══════════════════════════════════════════');
  console.log('  Raggiungibili:', ok);
  console.log('  Senza URL:', noUrl);
  console.log('  Host aggregatore (policy):', blocked);
  console.log('  Non raggiungibili HTTP:', unreachable);
  console.log('═══════════════════════════════════════════\n');

  if (failures.length <= 80) {
    if (failures.length) {
      console.log('Dettaglio errori:\n');
      failures.forEach((f) => {
        console.log(`[${f.reason}] id=${f.id} ${titoloEsc(f.titolo)}`);
        console.log('   ', f.url);
      });
      console.log('');
    }
  } else {
    console.log('Errori totali:', failures.length, '(lista completa nel report file)\n');
    failures.slice(0, 25).forEach((f) => {
      console.log(`[${f.reason}] id=${f.id}`, titoloEsc(f.titolo));
      console.log('   ', f.url);
    });
    console.log('…\n');
  }

  if (SAVE_REPORT) {
    const out = {
      generated_at: new Date().toISOString(),
      source: 'supabase',
      total: bandi.length,
      ok,
      no_url: noUrl,
      blocked,
      unreachable,
      failures
    };
    const abs = path.isAbsolute(SAVE_REPORT)
      ? SAVE_REPORT
      : path.join(__dirname, '..', SAVE_REPORT);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, JSON.stringify(out, null, 2), 'utf8');
    console.log('Report salvato:', abs);
  }

  // Exit code: solo errori HTTP reali (i link aggregatore sono violazione policy, non timeout)
  if (unreachable > 0) process.exitCode = 1;
}

function titoloEsc(s) {
  return (s || '').slice(0, 60) + ((s || '').length > 60 ? '…' : '');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
