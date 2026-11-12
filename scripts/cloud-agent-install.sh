#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v sqlite3 >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y sqlite3
fi

npm ci

if [[ ! -f .dev.vars ]]; then
  cp .dev.vars.example .dev.vars
fi
