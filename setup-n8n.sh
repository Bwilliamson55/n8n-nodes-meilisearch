#!/bin/bash
# Setup script for linking n8n-nodes-meilisearch to local n8n installation

set -e

echo "🔧 Setting up n8n-nodes-meilisearch for local development..."

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NODE_DIR="$SCRIPT_DIR"
N8N_CUSTOM_DIR="$HOME/.n8n/custom"

# Step 1: Build the node
echo "📦 Building the node..."
cd "$NODE_DIR"
npm run build

# Step 2: Create custom directory if it doesn't exist
echo "📁 Creating n8n custom directory..."
mkdir -p "$N8N_CUSTOM_DIR"

# Step 3: Link the package globally
echo "🔗 Linking package globally..."
npm link

# Step 4: Link to n8n custom directory
echo "🔗 Linking to n8n custom directory..."
cd "$N8N_CUSTOM_DIR"
npm link n8n-nodes-meilisearch

# Step 5: Verify installation
echo "✅ Verifying installation..."
if npm list n8n-nodes-meilisearch > /dev/null 2>&1; then
    echo "✅ Successfully linked n8n-nodes-meilisearch!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Start n8n: n8n start"
    echo "   2. Open http://localhost:5678 in your browser"
    echo "   3. Look for 'Meilisearch' node in the node panel"
    echo ""
    echo "💡 To rebuild after making changes:"
    echo "   cd $NODE_DIR && npm run build"
else
    echo "❌ Failed to link node. Please check the errors above."
    exit 1
fi

