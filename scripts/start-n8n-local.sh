#!/usr/bin/env bash
# Start n8n with local custom extensions (~/.n8n/custom must list this package — see workflows/README.md).
set -euo pipefail
export N8N_CUSTOM_EXTENSIONS="${N8N_CUSTOM_EXTENSIONS:-$HOME/.n8n/custom}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "N8N_CUSTOM_EXTENSIONS=$N8N_CUSTOM_EXTENSIONS"
echo "Meilisearch node repo: $ROOT"
exec npx n8n "$@"
