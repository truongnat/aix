# Windows Git hook wrapper for post-merge
# Copy this to .git/hooks/post-merge (without .ps1 extension) and make executable
& "$PSScriptRoot\..\..\.git\hooks\post-merge.ps1"
