# Agent Evaluation Anti-patterns

## 1. Evaluating on training data

**Symptom**: The agent was trained or fine-tuned on the eval dataset.
**Fix**: Keep eval data strictly separate. Use temporal split (train on past, eval on future) or random split with verification.

## 2. Single metric obsession

**Symptom**: Optimizing only for exact match while hallucination rate skyrockets.
**Fix**: Use a balanced scorecard: correctness, latency, cost, safety, user satisfaction.

## 3. No human calibration

**Symptom**: LLM-as-judge scores diverge from human judgment; nobody checked.
**Fix**: Calibrate automated metrics against human labels on a holdout set quarterly.

## 4. Ignoring latency and cost

**Symptom**: Agent passes correctness but takes 30 seconds and costs $1 per query.
**Fix**: Include latency and cost as first-class metrics from day one.

## 5. No regression dataset

**Symptom**: New deploy breaks previously working cases; no tests catch it.
**Fix**: Maintain a regression dataset of critical cases and run it on every PR.

## 6. Evaluating once and forgetting

**Symptom**: Initial benchmark looks good; no ongoing monitoring.
**Fix**: Re-run evals on golden dataset after every model or prompt change. Monitor production metrics continuously.

## 7. Dataset drift blindness

**Symptom**: Production traffic changes (new product, new language) but dataset stays static.
**Fix**: Re-sample from production traffic quarterly and retire outdated examples.
