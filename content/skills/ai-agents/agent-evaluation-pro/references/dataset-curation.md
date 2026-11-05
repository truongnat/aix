# Dataset Curation

## Golden dataset principles

1. **Representative**: Matches production traffic distribution (not cherry-picked successes).
2. **Diverse**: Covers happy path, edge cases, failure modes, and adversarial inputs.
3. **Stable**: Ground truth does not change frequently (or is versioned when it does).
4. **Right-sized**: Enough for statistical power (typically 100-500 for regression; 1,000+ for benchmark).

## Sources

- **Production logs**: Sample real user queries (anonymize PII).
- **Synthetic generation**: LLM-generated examples, human-reviewed.
- **Past bugs**: Every production failure should become a dataset example.
- **Adversarial**: Jailbreaks, edge cases, ambiguity traps.

## Versioning

Treat datasets like code:
- Version in Git or a dataset registry.
- Branch for experiments.
- Review changes (adding, removing, editing examples).
- Tag releases that correspond to model / prompt releases.

## Maintenance

- Re-sample from production traffic quarterly.
- Retire outdated examples (e.g., after a feature change makes old answers wrong).
- Monitor for dataset drift: are new failure modes not covered?
