#!/usr/bin/env bash
# Start local development.
# Credentials + LLM_MODE other than mock: wrangler dev with the AI binding remote
# and D1/queues local.
# Otherwise: next dev with LLM_MODE=mock so no Cloudflare login is required.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .dev.vars ]]; then
  cp .dev.vars.example .dev.vars
fi

while IFS= read -r line || [[ -n "$line" ]]; do
  trimmed="${line%%#*}"
  trimmed="${trimmed#"${trimmed%%[![:space:]]*}"}"
  trimmed="${trimmed%"${trimmed##*[![:space:]]}"}"
  [[ -z "$trimmed" || "$trimmed" != *=* ]] && continue
  key="${trimmed%%=*}"
  value="${trimmed#*=}"
  if [[ -z "${!key+x}" ]]; then
    export "$key=$value"
  fi
done < .dev.vars

account="${CLOUDFLARE_ACCOUNT_ID:-}"
token="${CLOUDFLARE_API_TOKEN:-}"
mode="${LLM_MODE:-}"
use_remote=false
if [[ -n "$token" && -n "$account" && "$account" != replace-with* && "$mode" != "mock" ]]; then
  use_remote=true
fi

worker=false
if [[ "${1:-}" == "--worker" ]]; then
  worker=true
fi

if [[ "$use_remote" == true ]]; then
  if [[ "$worker" == false && ( ! -f .open-next/worker.js || ! -f cloudflare/dist/worker.js ) ]]; then
    npm run build:cf
  fi
  echo "Remote AI Gateway, local D1 and queues (wrangler dev)"
  exec npx wrangler dev --ip 0.0.0.0 --port "${PORT:-3000}"
fi

export LLM_MODE=mock
if [[ "$worker" == true ]]; then
  echo "No Cloudflare AI credentials. wrangler dev --local with LLM_MODE=mock"
  exec npx wrangler dev --local --ip 0.0.0.0 --port "${PORT:-3000}"
fi

echo "No Cloudflare AI credentials. next dev with LLM_MODE=mock"
exec npm run dev
