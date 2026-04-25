#!/bin/bash
# Upgrade all skills with Karpathy principles

REPO_ROOT="/Users/truongdq/tx/dev/own-skills"
cd "$REPO_ROOT"

# Process each skill
for skill_dir in skills/*-pro/ skills/sync-custom-to-repo/; do
  [ -d "$skill_dir" ] || continue
  skill=$(basename "$skill_dir")
  skill_md="$skill_dir/SKILL.md"
  
  [ -f "$skill_md" ] || continue
  
  # Skip if already has Karpathy principles
  if grep -q "Karpathy principles" "$skill_md" 2>/dev/null; then
    echo "SKIP: $skill (already updated)"
    continue
  fi
  
  echo "Processing: $skill"
  
  # Update Workflow section - replace 3-step with goal-driven
  sed -i.tmp 's/## Workflow/## Workflow\n\nApply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution./' "$skill_md" 2>/dev/null || true
  
  # Remove temp file
  rm -f "$skill_dir/SKILL.md.tmp"
  
done

echo "Phase 1 complete: Workflow headers updated"
echo "Next: Manual review and detailed updates needed for each skill"
