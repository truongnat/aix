#!/usr/bin/env sh
set -eu

# Removes large MP4 blobs from all git history. Run once after migrating video to GitHub Releases.
# Requires a clean working tree. Afterwards: git push --force-with-lease origin main

export FILTER_BRANCH_SQUELCH_WARNING=1

git filter-branch -f --index-filter \
  'git rm --cached --ignore-unmatch site/public/AI_Engineering_Harness.mp4 demo-video/out/DemoVideo.mp4 AI_Engineering_Harness.mp4' \
  --prune-empty -- --all

git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "History rewritten. Verify: git rev-list --objects --all | rg mp4 || echo 'no mp4 blobs'"
echo "Then: git push --force-with-lease origin main"
