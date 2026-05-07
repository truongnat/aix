# Metrics and Scoring

## Exact match

- **When**: Classification, extraction, boolean answers, code syntax.
- **How**: String or JSON equality between output and reference.
- **Pros**: Unambiguous, fast to compute.
- **Cons**: Too strict for semantic equivalence; fails on paraphrases.

## Embedding similarity

- **When**: Semantic equivalence matters (summarization, Q&A, rewrite).
- **How**: Cosine similarity between output and reference embeddings.
- **Pros**: Captures paraphrase and synonymy.
- **Cons**: Can miss factual errors that preserve semantic similarity.

## LLM-as-judge

- **When**: Complex, subjective, or multi-dimensional quality assessment.
- **How**: Another LLM scores output on a rubric (1-5, pass/fail, etc.).
- **Pros**: Flexible, no hand-written rules.
- **Cons**: Expensive, can be biased, needs human calibration.
- **Best practice**: Provide the rubric explicitly in the judge prompt; show examples of each score level.

## Rule-based

- **When**: Structured outputs, code, JSON, compliance checks.
- **How**: Regex, JSON Schema validation, AST parsing, compilation.
- **Pros**: Fast, deterministic, no model cost.
- **Cons**: Brittle; requires maintenance as output format evolves.

## Latency and cost

- **Latency**: Time-to-first-token and total response time.
- **Cost**: Input tokens + output tokens × model pricing.
- **Best practice**: Track per-query; alert on p99 latency and cost per 1K queries.

## Statistical significance

- Always report confidence intervals. A 2% improvement on 10 examples is noise; on 10,000 it may be real.
- Use paired t-test or Wilcoxon signed-rank for comparing two variants.
