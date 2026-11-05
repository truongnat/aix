# Failure modes — detection and mitigation (SEO)

## Contents

1. [Index bloat and duplicates](#index-bloat-and-duplicates)
2. [Rendering gaps (JS)](#rendering-gaps-js)
3. [Soft 404 and quality](#soft-404-and-quality)
4. [Measurement mis-attribution](#measurement-mis-attribution)

---

## Index bloat and duplicates

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Parameterized URL explosion** | Coverage noise | Canonical, noindex, faceted policy — **`technical-seo-and-crawl.md`** |

---

## Rendering gaps (JS)

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Empty shell to bot** | Fetch+render diff | SSR/SSG hooks — **`nextjs-pro`**, **`react-pro`** |

---

## Soft 404 and quality

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Thin affiliate doorway** | Manual actions risk | Merge or noindex — **`anti-patterns.md`** |

---

## Measurement mis-attribution

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Many changes at once** | Unknown lever | Stagger + annotations — **`tips-and-tricks.md`** |
