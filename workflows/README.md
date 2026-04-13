# Meilisearch node smoke workflow

## Local n8n with this package

1. Install the package under `~/.n8n/custom` (see repo root: `~/.n8n/custom/package.json` should depend on this repo via `file:…`, then `npm install` in that folder).
2. **`N8N_CUSTOM_EXTENSIONS`** must point at that folder. This repo documents setting it in **`~/.bashrc`**; open a new shell or `source ~/.bashrc`.
3. Start n8n: **`./scripts/start-n8n-local.sh`** from the repo, or **`npx n8n`** after the env var is set.

## Import

1. In n8n: **Workflows → Import from File** → select [`meilisearch-node-smoke.json`](./meilisearch-node-smoke.json).
2. Install or link this package so the node type **`n8n-nodes-meilisearch.meilisearch`** (version **1**) is available.
3. Open each **Meilisearch** node and assign your **Meilisearch API** credential (host URL + API key).

## Prerequisite data

Create an index with UID **`n8n_meili_smoke`** (or change every node’s **Index UID** / **UID** to match your index). At least one document should exist if you run **Get One Document** (document id `1` in the sample workflow—adjust to a real primary key).

## What it exercises

- **General → Health** (simple GET)
- **Indexes → List indexes**
- **Documents → Get documents** with **Additional fields**: `limit`, `fields` (routing templates / `qs`)
- **Documents → Get one document** with top-level **Fields** (top-level `qs` merge)
- **Search → Search index** with **Additional fields**: `query`, `limit`, `attributesToRetrieve` (JSON body templates)
- **Tasks → Get all tasks** with **Additional fields**: `limit` and **Before enqueued at** (date → ISO `qs` template)

Run **Execute workflow** from the manual trigger. Fix **Index UID** / **Document ID** / dates if a step fails against your data.
