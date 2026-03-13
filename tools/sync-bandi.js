#!/usr/bin/env node
/**
 * sync-bandi.js — Sincronizza bandi da data/bandi.json a Supabase
 *
 * Operazioni:
 * 1. Legge data/bandi.json
 * 2. Aggiorna automaticamente lo stato (scaduti → chiuso)
 * 3. Upsert su tabella Supabase "bandi"
 * 4. Salva JSON aggiornato
 *
 * Uso: node tools/sync-bandi.js
 * Env: SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ══════════ CONFIG ══════════
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ieeriszlalrsbfsnarih.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const JSON_PATH = path.join(__dirname, '..', 'data', 'bandi.json');

// ══════════ HELPERS ══════════
function supabaseRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, SUPABASE_URL);
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      }
    };
    if (postData) options.headers['Content-Length'] = Buffer.byteLength(postData);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : null);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function aggiornaSatoBandi(bandi) {
  const oggi = new Date().toISOString().split('T')[0];
  let aggiornati = 0;

  bandi.forEach(b => {
    // Se ha scadenza passata e non e' gia' chiuso
    if (b.data_scadenza && b.data_scadenza < oggi && b.stato !== 'chiuso') {
      b.stato = 'chiuso';
      aggiornati++;
      console.log(`  [SCADUTO] ${b.id}: ${b.titolo} (scadenza: ${b.data_scadenza})`);
    }
  });

  return aggiornati;
}

function mapBandoToSupabase(b) {
  return {
    titolo: b.titolo,
    descrizione: b.descrizione,
    ente: b.ente,
    regione: b.regione === 'Nazionale' ? null : b.regione,
    importo_max: b.contributo_max,
    tipo_contributo: mapTipoContributo(b.tipo_contributo),
    settore: Array.isArray(b.settori) ? b.settori.filter(s => s !== 'tutti').join(', ') : null,
    scadenza: b.data_scadenza || null,
    link: b.url_bando || null,
    attivo: b.stato === 'aperto'
  };
}

function mapTipoContributo(tipo) {
  const map = {
    'fondo_perduto': 'Fondo Perduto',
    'tasso_agevolato': 'Credito Agevolato',
    'misto': 'Contributo Misto',
    'credito_imposta': 'Credito Agevolato',
    'garanzia': 'Garanzia'
  };
  return map[tipo] || 'Contributo Misto';
}

// ══════════ MAIN ══════════
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  SYNC BANDI — BandiItalia');
  console.log('  ' + new Date().toISOString());
  console.log('═══════════════════════════════════════════');

  // 1. Leggi JSON
  if (!fs.existsSync(JSON_PATH)) {
    console.error('ERRORE: File non trovato:', JSON_PATH);
    process.exit(1);
  }
  const fileData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const bandi = fileData.bandi;
  console.log(`\n[1] Letti ${bandi.length} bandi da ${JSON_PATH}`);

  // 2. Aggiorna stato bandi scaduti
  console.log('\n[2] Controllo scadenze...');
  const scaduti = aggiornaSatoBandi(bandi);
  console.log(`    ${scaduti} bandi aggiornati a "chiuso"`);

  // 3. Aggiorna metadata
  fileData.metadata.generated_at = new Date().toISOString();
  fileData.metadata.total_bandi = bandi.length;

  // 4. Salva JSON aggiornato
  fs.writeFileSync(JSON_PATH, JSON.stringify(fileData, null, 2), 'utf8');
  console.log('\n[3] JSON aggiornato e salvato');

  // 5. Sync con Supabase (se key disponibile)
  if (!SUPABASE_KEY) {
    console.log('\n[4] SUPABASE_SERVICE_KEY non configurata — skip sync Supabase');
    console.log('    Per abilitare: export SUPABASE_SERVICE_KEY="..."');
  } else {
    console.log('\n[4] Sincronizzazione con Supabase...');
    const bandiAttivi = bandi.filter(b => b.stato === 'aperto');
    let inseriti = 0, errori = 0;

    for (const b of bandiAttivi) {
      try {
        const row = mapBandoToSupabase(b);
        await supabaseRequest('POST', '/rest/v1/bandi', [row]);
        inseriti++;
      } catch (e) {
        errori++;
        console.error(`  ERRORE ${b.id}: ${e.message}`);
      }
    }
    console.log(`    Inseriti/aggiornati: ${inseriti}, Errori: ${errori}`);
  }

  // 6. Riepilogo
  const aperti = bandi.filter(b => b.stato === 'aperto').length;
  const chiusi = bandi.filter(b => b.stato === 'chiuso').length;
  const inArrivo = bandi.filter(b => b.stato === 'in_arrivo').length;
  console.log('\n═══════════════════════════════════════════');
  console.log(`  RIEPILOGO: ${bandi.length} bandi totali`);
  console.log(`  Aperti: ${aperti} | Chiusi: ${chiusi} | In arrivo: ${inArrivo}`);
  console.log('═══════════════════════════════════════════\n');
}

main().catch(e => {
  console.error('ERRORE FATALE:', e);
  process.exit(1);
});
