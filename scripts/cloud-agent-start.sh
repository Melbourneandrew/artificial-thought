#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .dev.vars ]]; then
  cp .dev.vars.example .dev.vars
fi

node scripts/prepare-local-db.mjs
exec bash scripts/start-dev.sh
