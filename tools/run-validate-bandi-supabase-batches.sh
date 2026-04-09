#!/usr/bin/env bash
# Valida tutti i bandi attivi su Supabase a lotti (default 50 per volta) fino alla fine.
#
# Uso (dalla root del repo):
#   bash tools/run-validate-bandi-supabase-batches.sh
#   STEP=100 CONC=20 bash tools/run-validate-bandi-supabase-batches.sh
#
# Opzionale: export SUPABASE_ANON_KEY="..." (altrimenti Node usa la chiave anon come in app.html)

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# STEP consigliato 50–200 (max 1000: oltre PostgREST può restituire solo 1000 righe per richiesta)
STEP="${STEP:-50}"
CONC="${CONC:-15}"
OUTDIR="${OUTDIR:-data/bandi-validate-batches}"
mkdir -p "$OUTDIR"

echo "════════════════════════════════════════════════════════════"
echo " Validazione Supabase a lotti: STEP=$STEP CONCURRENCY=$CONC"
echo " Directory report: $OUTDIR/"
echo "════════════════════════════════════════════════════════════"
echo ""

offset=0
while true; do
  report="$OUTDIR/batch-${offset}.json"
  echo "--- offset=$offset limit=$STEP ---"

  out=$(node tools/validate-bandi-supabase.js \
    --offset="$offset" \
    --limit="$STEP" \
    --concurrency="$CONC" \
    --save-report="$report" 2>&1) || true

  echo "$out"
  echo ""

  n=$(echo "$out" | sed -n 's/.*Record caricati dal DB: \([0-9][0-9]*\).*/\1/p' | head -1)
  n="${n:-0}"

  if [ "$n" -eq 0 ]; then
    echo "Nessun record: stop."
    rm -f "$report" 2>/dev/null || true
    break
  fi

  if [ "$n" -lt "$STEP" ]; then
    echo "Ultimo lotto ($n righe < $STEP): stop."
    break
  fi

  offset=$((offset + STEP))
done

echo "Fine. Report batch in: $OUTDIR/"
