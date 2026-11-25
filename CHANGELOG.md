# Changelog

## 0.2.1

### Fixed

- **Document writes returned `415 missing_content_type`.** `addOrReplaceDocuments`, `addOrUpdateDocuments` and `deleteDocumentsBatch` sent their payload without a `Content-Type` header, so every write against Meilisearch v0.23 or newer failed with:
  `A Content-Type header is missing. Accepted values for the Content-Type header are: application/json, application/x-ndjson, text/csv`.
  - `parseAndSetBodyJsonArray()` set `requestOptions.body` to a JSON **array**, and the follow-up guard only added the header when the body was a **string**, so the header was never set. The same helper now serializes the payload with `JSON.stringify()` and sets `Content-Type: application/json`.
  - `requestDefaults.headers` never applied to real requests, because the custom `execute()` builds its own options and calls `helpers.httpRequest()` directly instead of going through the declarative routing engine. The Content-Type guard therefore now runs for **every** request that carries a body, outside the `preSend`-only branch, and checks header names case-insensitively so an explicit `csv`/`ndjson` override is still preserved.
- Workflows that previously failed on every document write now reach Meilisearch; note that an empty upstream `data: []` produces a valid no-op task rather than an error.

## 0.2.0

### Fixed

- Custom `execute()` now resolves routing templates correctly: `replaceAll`/`split`, plain `={{$value}}`, `={{new Date($value).toJSON()}}`, and `={{$parameter["…"]}}` in `request.body` (e.g. create index, update API key). Previously many requests sent literal `={{…}}` strings or mangled values.
- Merged **top-level** parameters with `routing.request.qs` (e.g. **Get one document → Fields**) into the HTTP request.

### Added

- **Documents → Delete one document** (`DELETE /indexes/{uid}/documents/{documentId}`).
- **Indexes → Get index** and **Delete index**.
- **Documents → Get documents** additional fields: **Sort**, **IDs**, **Retrieve vectors**.
- Importable smoke workflow: [`workflows/meilisearch-node-smoke.json`](./workflows/meilisearch-node-smoke.json) (see [`workflows/README.md`](./workflows/README.md)).

### Changed

- **Create index** URL normalized to `/indexes`.
- Search **Offset** default `0` and **min** `0` (Meilisearch uses 0-based offsets). Same for **List indexes** and **Get API keys** optional offsets.
- Credential **documentation** link points to current Meilisearch API overview.

### Internal

- Shared helpers: [`routingTemplates.ts`](./nodes/Meilisearch/routingTemplates.ts), [`waitPollFields.ts`](./nodes/Meilisearch/waitPollFields.ts), [`searchQueryApply.ts`](./nodes/Meilisearch/searchQueryApply.ts), [`documentJson.ts`](./nodes/Meilisearch/documentJson.ts).

### Upgrade note

Workflows that accidentally depended on the old broken template behavior may send different (correct) HTTP payloads after this release.
