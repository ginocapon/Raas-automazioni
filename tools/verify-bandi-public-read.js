#!/usr/bin/env node
/**
 * Controllo che l'API pubblica Supabase (chiave anon) legga la tabella bandi.
 * Utile dopo applicazione della migration bandi_rls_anon_access.
 *
 * Exit 0: HTTP 200 e conteggio attivi >= soglia (default 1).
 * Exit 1: errore rete, 401/403, o conteggio sotto soglia.
 *
 * Uso:
 *   node tools/verify-bandi-public-read.js
 *   node tools/verify-bandi-public-read.js --min-count=500
 */

const https = require('https');

const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://ieeriszlalrsbfsnarih.supabase.co';
const ANON =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZXJpc3psYWxyc2Jmc25hcmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNjEyNjAsImV4cCI6MjA4MzczNzI2MH0.Sjwu1620mMTAAoKVHgXHQ1cA-m3hFXqtCtqjAQNErQo';

const minArg = process.argv.find((a) => a.startsWith('--min-count='));
const MIN_COUNT = minArg
  ? Math.max(0, parseInt(minArg.split('=')[1], 10) || 0)
  : 1;

function request(pathWithQuery) {
  return new Promise((resolve, reject) => {
    const u = new URL(pathWithQuery, SUPABASE_URL);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        apikey: ANON,
        Authorization: 'Bearer ' + ANON,
        Accept: 'application/json',
        Prefer: 'count=exact',
      },
    };
    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          contentRange: res.headers['content-range'] || '',
          body: body,
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(25000, () => {
      req.destroy();
      reject(new Error('timeout'));
    });
    req.end();
  });
}

function parseTotalFromRange(cr) {
  if (!cr) return null;
  const parts = String(cr).split('/');
  if (parts.length !== 2) return null;
  const n = parseInt(parts[1], 10);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  const path =
    '/rest/v1/bandi?select=id&attivo=eq.true&limit=1';
  const r = await request(path);
  if (r.status < 200 || r.status >= 300) {
    console.error('FAIL: HTTP', r.status, r.body.slice(0, 300));
    process.exit(1);
  }
  const total = parseTotalFromRange(r.contentRange);
  if (total == null) {
    console.error('FAIL: header Content-Range assente o non leggibile:', r.contentRange);
    process.exit(1);
  }
  console.log('OK: bandi attivi (anon, count exact):', total);
  if (total < MIN_COUNT) {
    console.error(
      'FAIL: conteggio',
      total,
      '< soglia',
      MIN_COUNT,
      '(imposta --min-count= se serve solo smoke test)'
    );
    process.exit(1);
  }
  let rows;
  try {
    rows = JSON.parse(r.body);
  } catch (e) {
    console.error('FAIL: JSON body', e.message);
    process.exit(1);
  }
  if (!Array.isArray(rows) || rows.length < 1) {
    console.error('FAIL: risposta senza righe campione');
    process.exit(1);
  }
  console.log('PASS: lettura pubblica bandi verificata.');
}

main().catch((e) => {
  console.error('FAIL:', e.message || e);
  process.exit(1);
});
