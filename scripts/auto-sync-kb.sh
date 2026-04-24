#!/bin/bash
# Auto-sync KB after git pull (Mac/Linux)
# Run this after pulling KB changes from another location

# Check if knowledge-base/documents/ changed
CHANGED_FILES=$(git diff-tree -r --name-only ORIG_HEAD HEAD)
if echo "$CHANGED_FILES" | grep -q "knowledge-base/documents/"; then
    echo "📚 KB documents changed - rebuilding embeddings..."
    node dist/tools.js build-kb
    node dist/tools.js verify-kb
    echo "✅ KB sync complete"
else
    echo "ℹ️ No KB document changes detected"
fi
