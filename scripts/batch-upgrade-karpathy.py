#!/usr/bin/env python3
"""Batch upgrade skills with Karpathy principles."""

import os
import re
import glob

SKILLS_DIR = "/Users/truongdq/tx/dev/own-skills/skills"

KARPATHY_WORKFLOW = """## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm"""

KARPATHY_OPERATING_PRINCIPLES = """### Operating principles

1. **Think Before Coding** — State assumptions: domain context, constraints. Ask when uncertain.
2. **Simplicity First** — Start with minimum solution; add complexity only when justified.
3. **Surgical Changes** — Only touch code directly related to the request.
4. **Goal-Driven Execution** — Define success criteria; loop until verified."""

def update_workflow(content, skill_name):
    """Update Workflow section with Karpathy principles."""
    # Pattern to match old workflow
    pattern = r'(## Workflow\n\n)(1\. .*)'
    
    def replacer(match):
        header = match.group(1)
        old_steps = match.group(2)
        
        # Extract first step for verify context
        first_step_match = re.search(r'1\. (.+?)(?:\n2\.|\n\n###|$)', old_steps + '\n2.', re.DOTALL)
        if first_step_match:
            first_step = first_step_match.group(1).strip()
            # Create new workflow
            new_workflow = f"""## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** {first_step} → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond"""
            return new_workflow
        return match.group(0)
    
    return re.sub(pattern, replacer, content, count=1, flags=re.DOTALL)

def update_operating_principles(content):
    """Add Karpathy principles to Operating principles."""
    pattern = r'(### Operating principles\n\n)(1\. )'
    
    def replacer(match):
        return match.group(1) + KARPATHY_OPERATING_PRINCIPLES + "\n\n5. "
    
    return re.sub(pattern, replacer, content, count=1)

def process_skill(skill_path):
    """Process a single skill."""
    skill_md = os.path.join(skill_path, "SKILL.md")
    
    if not os.path.exists(skill_md):
        return False, "No SKILL.md"
    
    with open(skill_md, 'r') as f:
        content = f.read()
    
    # Skip if already updated
    if "Karpathy principles" in content:
        return False, "Already updated"
    
    # Update Workflow
    content = update_workflow(content, os.path.basename(skill_path))
    
    # Update Operating principles
    content = update_operating_principles(content)
    
    with open(skill_md, 'w') as f:
        f.write(content)
    
    return True, "Updated"

def main():
    skill_dirs = glob.glob(os.path.join(SKILLS_DIR, "*-pro")) + [os.path.join(SKILLS_DIR, "sync-custom-to-repo")]
    
    updated = 0
    skipped = 0
    errors = []
    
    for skill_dir in sorted(skill_dirs):
        skill_name = os.path.basename(skill_dir)
        try:
            success, msg = process_skill(skill_dir)
            if success:
                print(f"✓ {skill_name}")
                updated += 1
            else:
                print(f"⊘ {skill_name}: {msg}")
                skipped += 1
        except Exception as e:
            print(f"✗ {skill_name}: {e}")
            errors.append((skill_name, str(e)))
    
    print(f"\nUpdated: {updated}, Skipped: {skipped}, Errors: {len(errors)}")
    if errors:
        print("\nErrors:")
        for name, err in errors:
            print(f"  {name}: {err}")

if __name__ == "__main__":
    main()
