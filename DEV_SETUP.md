# Development Setup Guide

This guide will help you set up a local development environment for the n8n-nodes-meilisearch project.

## Prerequisites

- **Node.js**: Version 18.17.0 or higher (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- **npm**: Comes with Node.js
- **n8n**: For testing the node locally

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Build icons using gulp
- Output files to the `dist/` directory

### 3. Link the Node to n8n for Local Development

#### Option A: Using npm link (Recommended for development)

1. **Build the node first:**
   ```bash
   cd /home/bwilliamson/dev/n8n/n8n-nodes-meilisearch
   npm run build
   ```

2. **Link the package globally:**
   ```bash
   npm link
   ```

3. **Link it to n8n's custom nodes directory:**
   ```bash
   # Create custom nodes directory if it doesn't exist
   mkdir -p ~/.n8n/custom
   
   # Link the node
   cd ~/.n8n/custom
   npm link n8n-nodes-meilisearch
   ```

4. **Verify the link:**
   ```bash
   npm list n8n-nodes-meilisearch
   ```
   You should see the package listed.

5. **Start n8n:**
   ```bash
   n8n start
   ```

#### Option B: Using n8n's N8N_CUSTOM_EXTENSIONS environment variable (Alternative)

1. **Set the environment variable:**
   ```bash
   export N8N_CUSTOM_EXTENSIONS=/home/bwilliamson/dev/n8n/n8n-nodes-meilisearch
   ```

2. **Start n8n:**
   ```bash
   n8n start
   ```

#### Option C: Direct symlink (Simple alternative)

1. **Create a symlink directly:**
   ```bash
   mkdir -p ~/.n8n/custom
   ln -s /home/bwilliamson/dev/n8n/n8n-nodes-meilisearch ~/.n8n/custom/n8n-nodes-meilisearch
   ```

2. **Start n8n:**
   ```bash
   n8n start
   ```

#### Option C: Using Docker (if running n8n in Docker)

1. **Mount the node directory:**
   ```bash
   docker run -it --rm \
     --name n8n \
     -p 5678:5678 \
     -v ~/.n8n:/home/node/.n8n \
     -v /home/bwilliamson/dev/n8n/n8n-nodes-meilisearch:/home/node/.n8n/custom/n8n-nodes-meilisearch \
     n8nio/n8n
   ```

## Development Workflow

### Watch Mode

For automatic rebuilding during development:

```bash
npm run dev
```

This runs TypeScript in watch mode, automatically recompiling when you make changes.

### Testing Changes

1. **Make your changes** to the TypeScript files in `nodes/` or `credentials/`
2. **Rebuild** (if not using watch mode):
   ```bash
   npm run build
   ```
3. **Restart n8n** (if needed) or wait for hot reload
4. **Test in n8n UI** at http://localhost:5678

### Linting

Check for code issues:

```bash
npm run lint
```

Fix issues automatically:

```bash
npm run lintfix
```

### Formatting

Format code with Prettier:

```bash
npm run format
```

## Project Structure

```
n8n-nodes-meilisearch/
├── credentials/          # Credential definitions
│   └── MeilisearchApi.credentials.ts
├── nodes/                # Node implementations
│   └── Meilisearch/
│       ├── Meilisearch.node.ts      # Main node class
│       ├── DocumentsDescription.ts  # Documents operations
│       ├── GeneralDescription.ts   # General operations
│       ├── IndexesDescription.ts   # Indexes operations
│       ├── KeysDescription.ts      # Keys operations
│       ├── SettingsDescription.ts  # Settings operations
│       ├── TasksDescription.ts     # Tasks operations
│       └── meilisearch.svg         # Node icon
├── dist/                # Compiled output (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Testing with Meilisearch

To test the node, you'll need a running Meilisearch instance:

### Using Docker (Quick Start)

```bash
docker run -d \
  --name meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY=masterKey \
  getmeili/meilisearch:latest
```

### Access Meilisearch

- **URL**: http://localhost:7700
- **Master Key**: `masterKey` (from the docker command above)

### Test Credentials in n8n

1. Open n8n at http://localhost:5678
2. Go to **Credentials** → **New**
3. Select **Meilisearch API**
4. Enter:
   - **Host URL**: `http://localhost:7700`
   - **API Key**: `masterKey`
5. Test and save

## Common Issues

### Node doesn't appear in n8n

- Ensure you've run `npm run build`
- Check that the node is linked correctly: `ls -la ~/.n8n/custom/`
- Restart n8n
- Check n8n logs for errors

### TypeScript compilation errors

- Check that all dependencies are installed: `npm install`
- Verify TypeScript version compatibility
- Check `tsconfig.json` settings

### Changes not reflecting

- Rebuild the project: `npm run build`
- Clear n8n cache (if applicable)
- Restart n8n

### Module not found errors

- Run `npm install` to ensure all dependencies are installed
- Check that `n8n-workflow` is properly installed

## Next Steps

- Review [PLANNING.md](./PLANNING.md) for upcoming features
- Check [README.md](./README.md) for usage examples
- Start implementing task completion features (see Phase 1 in PLANNING.md)

## Useful Commands

```bash
# Install dependencies
npm install

# Build project
npm run build

# Watch mode (auto-rebuild)
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run lintfix

# Format code
npm run format

# Check for outdated packages
npm outdated

# Update packages
npm update
```

