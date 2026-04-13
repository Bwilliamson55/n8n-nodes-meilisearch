#!/usr/bin/env bash
# Start n8n. Community nodes load from ~/.n8n/nodes (see workflows/README.md).
# Optional: N8N_CUSTOM_EXTENSIONS for an extra folder (does not replace ~/.n8n/nodes).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -n "${N8N_CUSTOM_EXTENSIONS:-}" ]]; then
	echo "N8N_CUSTOM_EXTENSIONS=$N8N_CUSTOM_EXTENSIONS"
fi
echo "Meilisearch node repo: $ROOT"
echo "Tip: install this package under ~/.n8n/nodes (npm install file:$ROOT)"
exec npx n8n "$@"
