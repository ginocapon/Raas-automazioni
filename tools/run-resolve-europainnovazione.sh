#!/usr/bin/env bash
# Sostituisce URL europainnovazione con fonti istituzionali (o disattiva).
# Richiede SUPABASE_SERVICE_ROLE_KEY nel ambiente (non committare).

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  echo "Imposta: export SUPABASE_SERVICE_ROLE_KEY=…" >&2
  exit 1
fi

exec node tools/resolve-europainnovazione-urls.js --apply --all "$@"
