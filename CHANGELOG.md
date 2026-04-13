# Changelog

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
