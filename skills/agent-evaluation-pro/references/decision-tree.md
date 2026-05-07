# Agent Evaluation Decision Tree

## Goal → Metric → Tool → CI

```
What is the evaluation goal?
├── Correctness → exact match, embedding similarity, LLM-as-judge
├── Latency → time-to-first-token, total response time
├── Cost → tokens × price, per-query cost
├── Safety → red-team score, toxicity detection, human review
└── User satisfaction → human rating, NPS, retention proxy

What is the baseline?
├── Current version → A/B test or paired comparison
├── Human benchmark → human labels as ground truth
└── Competitor → external benchmark or API comparison

Which framework?
├── CLI-first, red-teaming → Promptfoo
├── CI-native, statistical testing → Braintrust
├── LangChain ecosystem → LangSmith
├── OTel-native, self-hosted → Arize Phoenix
├── Open-source, self-hosted → Langfuse
└── Custom → build with SDK + spreadsheet

CI integration?
├── Every PR → run regression dataset, gate on score
├── Nightly → full benchmark, trend analysis
└── Pre-deploy → canary eval on production traffic sample
```
