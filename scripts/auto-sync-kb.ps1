# Auto-sync KB after git pull
# Run this after pulling KB changes from another location

# Check if knowledge-base/documents/ changed
$changedFiles = git diff-tree -r --name-only ORIG_HEAD HEAD
if ($changedFiles -match "knowledge-base/documents/") {
    Write-Host "📚 KB documents changed - rebuilding embeddings..."
    node dist/tools.js build-kb
    node dist/tools.js verify-kb
    Write-Host "✅ KB sync complete"
} else {
    Write-Host "ℹ️ No KB document changes detected"
}
