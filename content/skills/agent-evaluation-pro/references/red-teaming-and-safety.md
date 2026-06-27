# Red-Teaming and Safety

## Adversarial testing categories

1. **Jailbreaks**: Attempts to override system instructions.
2. **Prompt injection**: Malicious input that changes model behavior.
3. **Data extraction**: Attempts to extract training data or secrets.
4. **Toxicity / bias**: Outputs that are harmful, biased, or unethical.
5. **Hallucination**: Factual errors presented confidently.

## Automated red-teaming tools

- **Promptfoo red-team plugin**: Automated adversarial test generation.
- **Garak**: LLM vulnerability scanner from NVIDIA.
- **PurpleLlama**: Meta's open-source safety tools.
- **Custom adversarial datasets**: Curated from production abuse logs.

## Human review

- Safety-critical outputs must have human-in-the-loop review.
- Define escalation paths: auto-block, human review, auto-allow with logging.
- Regular red-team exercises with dedicated safety reviewers.

## Measuring safety

- False negative rate: harmful outputs that slip through.
- False positive rate: safe outputs incorrectly blocked.
- Balance based on application risk: a medical bot needs near-zero false negatives.
