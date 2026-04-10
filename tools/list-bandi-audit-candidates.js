#!/usr/bin/env node
/**
 * Elenca via REST (chiave anon) i bandi da revisionare:
 * - tipo_ente legacy camera_commercio (normalizzare a cciaa)
 * - url che contengono host aggregatore (es. europainnovazione.com)
 *
 * Per liste lunghe stampa un campione e il totale (header Content-Range).
 * Uso:
 *   npm run list-bandi-audit-candidates
 *   node tools/list-bandi-audit-candidates.js --sample=80
 *   node tools/list-bandi-audit-candidates.js --all   # stampa tutto (attento a migliaia di righe)
 *
 * Env: SUPABASE_URL, SUPABASE_ANON_KEY (opzionale; default come altri tool)
 */

const https = require('https');

const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://ieeriszlalrsbfsnarih.supabase.co';
const ANON =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZXJpc3psYWxyc2Jmc25hcmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNjEyNjAsImV4cCI6MjA4MzczNzI2MH0.Sjwu1620mMTAAoKVHgXHQ1cA-m3hFXqtCtqjAQNErQo';

const SELECT =
  'id,titolo,ente,regione,url,tipo_ente,fonte,attivo';

function get(path, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, SUPABASE_URL);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        apikey: ANON,
        Authorization: 'Bearer ' + ANON,
        Accept: 'application/json',
        Prefer: 'count=exact',
        ...extraHeaders,
      },
    };
    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body,
          contentRange: res.headers['content-range'] || '',
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

function parseTotal(cr) {
  if (!cr) return null;
  const parts = String(cr).split('/');
  if (parts.length !== 2) return null;
  const n = parseInt(parts[1], 10);
  return Number.isFinite(n) ? n : null;
}

async function fetchSample(pathBase, sampleLimit, fetchAllRows) {
  const sep = pathBase.includes('?') ? '&' : '?';
  const pageSize = 500;
  const out = [];
  let total = null;

  if (!fetchAllRows) {
    const lim = Math.min(pageSize, Math.max(1, sampleLimit));
    const path = `${pathBase}${sep}limit=${lim}&offset=0`;
    const r = await get(path);
    if (r.status < 200 || r.status >= 300) {
      console.error('HTTP', r.status, r.body.slice(0, 400));
      process.exit(1);
    }
    total = parseTotal(r.contentRange);
    let chunk;
    try {
      chunk = JSON.parse(r.body);
    } catch (e) {
      console.error('JSON', e.message);
      process.exit(1);
    }
    if (!Array.isArray(chunk)) {
      console.error('Risposta non array');
      process.exit(1);
    }
    return { rows: chunk, total };
  }

  let offset = 0;
  for (;;) {
    const path = `${pathBase}${sep}limit=${pageSize}&offset=${offset}`;
    const r = await get(path);
    if (r.status < 200 || r.status >= 300) {
      console.error('HTTP', r.status, r.body.slice(0, 400));
      process.exit(1);
    }
    total = parseTotal(r.contentRange);
    let chunk;
    try {
      chunk = JSON.parse(r.body);
    } catch (e) {
      console.error('JSON', e.message);
      process.exit(1);
    }
    if (!Array.isArray(chunk)) {
      console.error('Risposta non array');
      process.exit(1);
    }
    out.push(...chunk);
    if (chunk.length < pageSize) break;
    offset += pageSize;
  }
  return { rows: out, total };
}

function printSection(title, rows, total) {
  const shown = rows.length;
  const totStr =
    total != null ? `totale DB: ${total}` : 'totale DB: (sconosciuto)';
  const note =
    total != null && shown < total
      ? ` (campione: mostrati ${shown} di ${total}; usare --all o SQL per l’elenco completo)`
      : '';
  console.log('\n===', title, '—', totStr + note, '===\n');
  if (!rows.length) {
    console.log('(nessuno)');
    return;
  }
  for (const b of rows) {
    console.log(
      [
        `id=${b.id}`,
        `tipo_ente=${b.tipo_ente || ''}`,
        `ente=${(b.ente || '').slice(0, 60)}`,
        `url=${b.url || ''}`,
      ].join('\n  ')
    );
    console.log('');
  }
}

async function main() {
  const all = process.argv.includes('--all');
  const sampleArg = process.argv.find((a) => a.startsWith('--sample='));
  const sampleLimit = Math.min(
    500,
    Math.max(15, parseInt(sampleArg ? sampleArg.split('=')[1] : '35', 10) || 35)
  );

  const cam = await fetchSample(
    `/rest/v1/bandi?select=${SELECT}&tipo_ente=eq.camera_commercio&order=id.desc`,
    sampleLimit,
    all
  );
  const agg = await fetchSample(
    `/rest/v1/bandi?select=${SELECT}&url=ilike.${encodeURIComponent('%europainnovazione.com%')}&order=id.desc`,
    sampleLimit,
    all
  );

  printSection(
    'Legacy tipo_ente = camera_commercio (considerare UPDATE → cciaa)',
    cam.rows,
    cam.total
  );
  printSection(
    'URL con europainnovazione.com (sostituire con link istituzionale o disattivare)',
    agg.rows,
    agg.total
  );

  console.log(
    '\nSQL equivalente: tools/sql/audit-bandi-legacy-tipo-e-url.sql\n'
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
