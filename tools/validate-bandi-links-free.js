#!/usr/bin/env node
/**
 * Controllo gratuito (solo HTTP) degli URL in data/bandi.json.
 * Segnala: link aggregatore vietato, URL non raggiungibili.
 * Nessuna API a pagamento.
 *
 * Uso: node tools/validate-bandi-links-free.js [--limit=50]
 */

const fs = require('fs');
const path = require('path');
const { verifyUrlResponds } = require('./http-verify-url');
const { hostnameOf, isBlockedAggregatorHost } = require('./bandi-link-policy');

const JSON_PATH = path.join(__dirname, '..', 'data', 'bandi.json');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) || 9999 : 9999;

async function main() {
  const raw = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const bandi = raw.bandi || [];
  let blocked = 0;
  let unreachable = 0;
  let ok = 0;
  let noUrl = 0;

  const slice = bandi.slice(0, LIMIT);
  console.log('═══════════════════════════════════════════');
  console.log('  VALIDAZIONE LINK BANDI (HTTP gratuito)');
  console.log('  Record controllati:', slice.length, '/', bandi.length);
  console.log('═══════════════════════════════════════════\n');

  for (const b of slice) {
    const u = b.url_bando || b.url;
    const titolo = (b.titolo || b.id || '').toString().slice(0, 70);
    if (!u || u === '#') {
      noUrl++;
      continue;
    }
    const host = hostnameOf(u);
    if (isBlockedAggregatorHost(host)) {
      console.log('[BLOCCATO]', titolo);
      console.log('           ', u);
      blocked++;
      continue;
    }
    process.stdout.write('Checking… ' + titolo.slice(0, 50) + '… ');
    const up = await verifyUrlResponds(u);
    if (up) {
      console.log('OK');
      ok++;
    } else {
      console.log('NON RAGGIUNGIBILE');
      console.log('   ', u);
      unreachable++;
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  Raggiungibili:', ok);
  console.log('  Senza URL:', noUrl);
  console.log('  Host aggregatore (policy):', blocked);
  console.log('  Non raggiungibili HTTP:', unreachable);
  console.log('═══════════════════════════════════════════\n');

  if (blocked + unreachable > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
