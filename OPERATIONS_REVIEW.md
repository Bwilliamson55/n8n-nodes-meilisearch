# Operations Review - Wait for Completion & Missing Features

## Operations That Return taskUid

### Documents Resource
- ✅ **Add or Replace Documents** - Has wait for completion
- ✅ **Add or Update Documents** - Has wait for completion
- ✅ **Delete Batch of Documents** - Has wait for completion
- ✅ **Delete All Documents** - Has wait for completion

### Indexes Resource
- ✅ **Create Index** - Has wait for completion
- ✅ **Swap Indexes** - Has wait for completion

### Settings Resource
- ✅ **Update Index Settings** - Has wait for completion
- ✅ **Reset Index Settings** - Has wait for completion

### Keys Resource
- ✅ **Create An API Key** - Has wait for completion
- ✅ **Update An API Key** - Has wait for completion
- ✅ **Delete An API Key** - Has wait for completion

### General Resource
- ✅ **Create a Dump** - Has wait for completion

## Missing Fields Review

### Documents - Get Documents (getMany)
- ✅ Filter - Already added
- ✅ Fields - Present
- ✅ Limit - Present
- ✅ Offset - Present

### Search Operations
- ✅ Filter - Present in searchFields
- ✅ All other search parameters - Present

## Missing Capabilities

### Multi-Search
- **Status**: Not implemented
- **API Endpoint**: POST /multi-search
- **Description**: Perform multiple searches in a single request
- **Use Case**: Search across multiple indexes simultaneously
- **Priority**: Medium

### Index Settings Sub-routes
- **Status**: Not implemented (currently supports full settings object only)
- **Sub-routes**:
  - GET/PATCH /indexes/{uid}/settings/ranking-rules
  - GET/PATCH /indexes/{uid}/settings/searchable-attributes
  - GET/PATCH /indexes/{uid}/settings/displayed-attributes
  - GET/PATCH /indexes/{uid}/settings/filterable-attributes
  - GET/PATCH /indexes/{uid}/settings/sortable-attributes
  - GET/PATCH /indexes/{uid}/settings/stop-words
  - GET/PATCH /indexes/{uid}/settings/synonyms
  - GET/PATCH /indexes/{uid}/settings/distinct-attribute
  - GET/PATCH /indexes/{uid}/settings/typo-tolerance
  - GET/PATCH /indexes/{uid}/settings/faceting
  - GET/PATCH /indexes/{uid}/settings/pagination
- **Priority**: Low (full settings object works, but sub-routes are more granular)

### Other Missing Features
- **Metrics endpoint** - GET /metrics (Prometheus-compatible)
- **Experimental features** - Various experimental endpoints

## Implementation Status

### ✅ Completed
1. ✅ Wait for completion added to ALL operations that return taskUid:
   - Documents: addOrReplaceDocuments, addOrUpdateDocuments, deleteDocumentsBatch, deleteAllDocuments
   - Indexes: createIndex, swapIndexes
   - Settings: updateSettings, resetSettings
   - Keys: createKey, updateKey, deleteKey
   - General: dumps
2. ✅ Created reusable `waitForTaskCompletion` helper function
3. ✅ Made wait-for-completion logic generic and extensible

### 🔄 Next Steps

### Medium Priority
1. Implement Multi-Search
   - API Endpoint: POST /multi-search
   - Allows searching across multiple indexes in a single request
   - Need to research exact API structure

### Low Priority
2. Implement Index Settings Sub-routes
   - More granular settings updates (individual endpoints vs full object)
   - Lower priority since full settings object works

