#!/usr/bin/env bash
# Esegue audit coerenza titolo vs pagina su tutti i bandi attivi Supabase, a lotti.
# Opzionale: export SUPABASE_SERVICE_ROLE_KEY e passare --deactivate
#
# Uso:
#   bash tools/run-audit-coherence-bandi-supabase-batches.sh
#   STEP=200 bash tools/run-audit-coherence-bandi-supabase-batches.sh
#   SUPABASE_SERVICE_ROLE_KEY=… bash tools/run-audit-coherence-bandi-supabase-batches.sh --deactivate

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STEP="${STEP:-200}"
EXTRA=()
if [[ "${1:-}" == "--deactivate" ]]; then EXTRA+=(--deactivate-incongruent); fi

offset=0
while true; do
  echo "=== coherence offset=$offset limit=$STEP ==="
  out=$(node tools/audit-bandi-coherence-supabase.js \
    --offset="$offset" \
    --limit="$STEP" \
    "${EXTRA[@]}" 2>&1) || true
  echo "$out"
  echo ""
  n=$(echo "$out" | sed -n 's/.*Record da analizzare: \([0-9][0-9]*\).*/\1/p' | head -1)
  n="${n:-0}"
  if [ "$n" -eq 0 ]; then break; fi
  if [ "$n" -lt "$STEP" ]; then break; fi
  offset=$((offset + STEP))
done

echo "Fine audit coerenza."
