# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **Force-push to shared default** | Rewrites others’ bases | CI/PR chaos; missing commits | **Revert** on `main`; policy + branch protection — **`edge-cases.md`** |
| **Secret pushed** | `.env` in commit | Scanner; audit | **Rotate** key first; then history scrub if policy — **`security-pro`** |
| **Merge wrong direction** | `main` merged into many topics repeatedly | Messy graph | Rebase/squash policy; one integration direction — **`decision-tree.md`** |
| **Conflict resolution blind apply** | Accept “theirs” without reading | Subtle bugs | Review hunk-by-hunk; tests — **`tips-and-tricks.md`** |
| **Detached HEAD commits lost** | Forgot branch | `reflog` rescue | `switch -c` from detached — **`edge-cases.md`** |
| **Submodule pointer stale** | Updated child repo; parent not | Build uses old lib | Commit superproject after submodule bump — **`edge-cases.md`** |
| **LFS not installed / quota** | Clone incomplete | Missing binaries in CI | Document LFS in README; CI step — **`versions.md`** |
| **Case rename broke on Windows/mac** | Case-insensitive FS | Weird duplicate paths | Two-step `git mv` — **`edge-cases.md`** |
| **Bisect skipped bad mid-point** | Flaky test | Wrong culprit | Mark flake; widen range — **`tips-and-tricks.md`** |
| **Signed tag without verification** | Supply chain trust | Unsigned merge to prod | Verify signatures in release job — **`security-pro`** |
