# Skill: kaizen
Schema: antigrav.skill@v1

```json
{
  "description": "Guide for continuous improvement, error proofing, and standardization. Use this skill when the user wants to improve code quality, refactor, or discuss process improvements.",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154383,
  "model": "qwen3:8b",
  "name": "kaizen",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "kaizen/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "external",
    "imported"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Guide for continuous improvement, error proofing, and standardization. Use this skill when the user wants to improve code quality, refactor, or discuss process improvements.

## When to Use
- Code implementation and refactoring
- Architecture and design decisions
- Process and workflow improvements
- Error handling and validation

## Examples
- // Iteration 1: Make it work
const calculateTotal = (items: Item[]) => {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
};

// Iteration 2: Make it clear (refactor)
const calculateTotal = (items: Item[]): number => {
return items.reduce((total, item) => {
return total + (item.price \* item.quantity);
}, 0);
};

// Iteration 3: Make it robust (add validation)
const calculateTotal = (items: Item[]): number => {
if (!items?.length) return 0;

return items.reduce((total, item) => {
if (item.price < 0 || item.quantity < 0) {
throw new Error('Price and quantity must be non-negative');
}
return total + (item.price \* item.quantity);
}, 0);
};
- // Trying to do everything at once
const calculateTotal = (items: Item[]): number => {
  // Validate, optimize, add features, handle edge cases all together
  if (!items?.length) return 0;
  const validItems = items.filter(item => {
    if (item.price < 0) throw new Error('Negative price');
    if (item.quantity < 0) throw new Error('Negative quantity');
    return item.quantity > 0; // Also filtering zero quantities
  });
  // Plus caching, plus logging, plus currency conversion...
  return validItems.reduce(...); // Too many concerns at once
};
- // Error: string status can be any value
type OrderBad = {
  status: string; // Can be "pending", "PENDING", "pnding", anything!
  total: number;
};

// Good: Only valid states possible
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';
type Order = {
status: OrderStatus;
total: number;
};

// Better: States with associated data
type Order =
| { status: 'pending'; createdAt: Date }
| { status: 'processing'; startedAt: Date; estimatedCompletion: Date }
| { status: 'shipped'; trackingNumber: string; shippedAt: Date }
| { status: 'delivered'; deliveredAt: Date; signature: string };

// Now impossible to have shipped without trackingNumber

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `kaizen/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Kaizen: Continuous Improvement ## Overview Small improvements, continuously. Error-proof by design. Follow what works. Build only what's needed. **Core principle:** Many small improvements beat one big change. Prevent errors at design time, not with fixes. ## When to Use **Always applied for:** - Code implementation and refactoring - Architecture and design decisions - Process and workflow improvements - Error handling and validation **Philosophy:** Quality through incremental progress and prevention, not perfection through massive effort. ## The Four Pillars ### 1. Continuous Improvement (Kaizen) Small, frequent improvements compound into major gains. #### Principles **Incremental over revolutionary:** - Make smallest viable change that improves quality - One improvement at a time - Ver

{{input}}
