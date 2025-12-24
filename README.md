# n8n-nodes-meilisearch

A comprehensive n8n community node for interacting with the Meilisearch REST API. This node provides full coverage of Meilisearch operations including document management, index operations, search functionality, task management, and more.

## About Meilisearch

[Meilisearch](https://meilisearch.com) is an open-source, lightning-fast, and hyper-relevant search engine that fits effortlessly into your apps, websites, and workflows. It provides a RESTful API for managing search indexes, documents, and performing lightning-fast searches.

## About n8n

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform that allows you to connect different services and automate tasks.

## Table of Contents

- [Installation](#installation)
- [Operations](#operations)
- [Credentials](#credentials)
- [Compatibility](#compatibility)
- [Usage](#usage)
- [Examples](#examples)
- [Resources](#resources)
- [Version History](#version-history)
- [Contributing](#contributing) 

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

This node supports all major Meilisearch API operations organized by resource type:

### Documents
- **Add or Replace Documents** - Add new documents or replace existing ones in an index
- **Add or Update Documents** - Add new documents or update existing ones (partial updates)
- **Delete Batch of Documents** - Delete multiple documents by their UIDs
- **Delete All Documents** - Remove all documents from an index
- **Get Documents** - Retrieve multiple documents with pagination support
- **Get One Document** - Retrieve a single document by its UID

### General
- **Create a Dump** - Generate a database dump for backup or migration
- **Get All Index Stats** - Retrieve statistics about all indexes and the database
- **Get Health** - Check the health status of your Meilisearch instance
- **Get Version** - Get the version information of your Meilisearch instance

### Indexes
- **Create an Index** - Create a new search index with optional primary key
- **Get Stats of an Index** - Retrieve detailed statistics for a specific index
- **List Indexes** - List all indexes with pagination support
- **Search Index** - Perform a search query on an index (also available in Search resource)
- **Swap Indexes** - Swap documents, settings, and task history between index pairs

### Keys
- **Create an API Key** - Create a new API key with specific permissions
- **Delete an API Key** - Delete a key by its UID or key value
- **Get an API Key** - Retrieve details of a specific API key
- **Get API Keys** - List all API keys (returns 20 most recently created)
- **Update an API Key** - Update permissions or expiration of an existing key

### Search
- **Search Index** - Perform advanced searches with filtering, faceting, highlighting, and more

### Settings
- **Get Index Settings** - Retrieve all settings for an index
- **Reset Index Settings** - Reset all settings to their default values
- **Update Index Settings** - Update searchable attributes, ranking rules, typo tolerance, synonyms, and more

### Tasks
- **Get All Tasks** - List all tasks with filtering options (by status, type, index, date, etc.)
- **Get a Single Task** - Retrieve details of a specific task by UID
- **Cancel Tasks** - Cancel enqueued or processing tasks
- **Delete Tasks** - Delete finished tasks (succeeded, failed, or canceled)

## Credentials

### Setting Up Credentials

1. **Host URL**: Enter your Meilisearch instance URL (e.g., `https://your-meilisearch-instance.com` or `http://localhost:7700`)
2. **API Key**: Provide your Meilisearch API key

### Security Notes

By [providing Meilisearch with a master key at launch](https://docs.meilisearch.com/learn/security/master_api_keys.html#protecting-a-meilisearch-instance), you protect your instance from unauthorized requests. The provided master key must be at least 16 bytes. From then on, you must include the `Authorization` header along with a valid API key to access protected routes (all routes except `/health`).

The credentials type provided in this node automatically sends an `Authorization` header with the key you provide:
```
Authorization: Bearer YOURKEY
```

### Credential Testing

The credentials are tested against the `/version` endpoint. You can save your credentials regardless of the test result, but ensure your API key has the necessary permissions for the operations you plan to use.

## Compatibility

- **n8n**: Compatible with n8n version 1.6.0 and above
- **Meilisearch**: Compatible with Meilisearch v1.0.0 and above
- **Node.js**: Requires Node.js 16.x or higher

*Note: Compatibility is subject to change with future updates.*

## Usage

### Basic Workflow

1. Add the Meilisearch node to your workflow
2. Configure your credentials (Host URL and API Key)
3. Select the resource type (Documents, Indexes, Search, etc.)
4. Choose the operation you want to perform
5. Fill in the required parameters
6. Execute the workflow

### Tips

- **Index UID Fields**: When your API key has proper permissions, index UID fields will show as dropdowns with available indexes
- **JSON Input**: For document operations, you can use n8n expressions like `{{ JSON.stringify($json) }}` or `{{ JSON.stringify($jmespath($input.all(), "[].json")) }}`
- **Task Management**: Many operations return a task UID. Use the Tasks resource to check task status
- **Field Hints**: Most fields include helpful hints and examples in their descriptions

### Common Patterns

#### Adding Documents
1. Use "Documents" → "Add or Replace Documents"
2. Select your index from the dropdown
3. Provide documents as JSON array in the "Documents JSON" field

#### Searching
1. Use "Search" → "Search Index" or "Indexes" → "Search Index"
2. Select your index
3. Enter your search query
4. Configure additional fields like filters, facets, pagination, etc.

#### Waiting for Task Completion
Currently, you need to manually poll tasks. See the [Planning Document](./PLANNING.md) for upcoming improvements to automate this process.

## Updating

If you depend soley on the community nodes part of the GUI, you can update there.

If you use a dockerfile setup such as one of mine: [SimpleDockerfileExample](https://github.com/Bwilliamson55/n8n-custom-images/blob/master/bwill-nodes-simple/Dockerfile) , you can rebuild your container to get the updated node version.

---

### *If you're using `docker compose` or `docker-compose`, you can still use a dockerfile to persist custom nodes:*

Put the `DockerFile` and `docker-entrypoint` in the same directory as your docker-compose file, and swap the `image` property for `build: .`

 Then run `docker-compose down && docker-compose up --build -d`.

 Or if you want to have less down time, run `docker-compose build` to create the image, THEN do `docker-compose down && docker-compose up --force-recreate -d` - [Source Docs](https://docs.docker.com/compose/compose-file/build/#dockerfile)

 If you're on Digital Ocean or similar, "Force rebuild and redeploy".

`Dockerfile`:
    ***Note the `-g` - these nodes will not show in 'community nodes' but will work and show when searched for***
```yaml
FROM n8nio/n8n:latest
RUN npm install -g n8n-nodes-meilisearch
```
`docker-entrypoint.sh`:  (Default one from n8n repo)
```shell
#!/bin/sh

if [ -d /root/.n8n ] ; then
  chmod o+rx /root
  chown -R node /root/.n8n
  ln -s /root/.n8n /home/node/
fi

chown -R node /home/node

if [ "$#" -gt 0 ]; then
  # Got started with arguments
  exec su-exec node "$@"
else
  # Got started without arguments
  exec su-exec node n8n
fi
```

## Examples

### Example 1: Adding Documents to an Index

```json
{
  "resource": "documents",
  "operation": "addOrReplaceDocuments",
  "uid": "movies",
  "documentsJson": "[{\"id\": 1, \"title\": \"Inception\", \"year\": 2010}, {\"id\": 2, \"title\": \"The Matrix\", \"year\": 1999}]"
}
```

### Example 2: Searching with Filters

```json
{
  "resource": "search",
  "operation": "search",
  "uid": "movies",
  "additionalFields": {
    "query": "sci-fi",
    "filter": "year > 2000",
    "limit": 20
  }
}
```

### Example 3: Checking Task Status

```json
{
  "resource": "tasks",
  "operation": "getTask",
  "uid": 12345
}
```

## Resources

### Documentation
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Official Meilisearch API Reference](https://www.meilisearch.com/docs/reference/api/overview)
- [Official Meilisearch Documentation](https://www.meilisearch.com/docs/learn/what_is_meilisearch/overview)
- [Meilisearch Tasks Documentation](https://www.meilisearch.com/docs/learn/async/working_with_tasks)

### Repository
- [n8n-nodes-meilisearch GitHub Repository](https://github.com/Bwilliamson55/n8n-nodes-meilisearch)

### Support
- [Meilisearch Discord](https://discord.gg/meilisearch)
- [n8n Community Forum](https://community.n8n.io/)

## Version History

### 0.1.2 (Current)
- Current stable version

### 0.1.1 - QOL Updates
- Improved JSON validation for document operations with better error messages
- Array type input fields now validated and transformed as JSON
- UID fields display as dropdowns when credentials have proper permissions
- Enhanced field descriptions and hints

### 0.1.0 - Initial Release
- Comprehensive coverage of Meilisearch API endpoints
- Support for Documents, General, Indexes, Keys, Search, Settings, and Tasks resources
- Auto-populating options for index UIDs (when permissions allow)
- Full settings management (as entire settings object)

### Known Limitations & Planned Features
- **Multi-search**: Not yet implemented (planned)
- **Index Settings Sub-routes**: Currently supports full settings object only (sub-routes planned)
- **Task Polling**: Manual task checking required (automated polling planned)
- See [PLANNING.md](./PLANNING.md) for detailed roadmap

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run linting: `npm run lint`

### Reporting Issues

If you encounter any issues or have feature requests, please open an issue on the [GitHub repository](https://github.com/Bwilliamson55/n8n-nodes-meilisearch/issues).
