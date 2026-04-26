---
name: ocr-pro
description: |
  Professional OCR integration and troubleshooting: OCR service architecture, PaddleOCR/EasyOCR setup, Handz OCR integration, frame detection, text recognition, image rotation, configuration management, caching strategies, error handling, performance optimization, and production reliability patterns.

  Use this skill when the user integrates OCR services (PaddleOCR, EasyOCR, Handz OCR), sets up OCR infrastructure, debugs OCR failures, optimizes OCR performance, or designs OCR workflows for document processing applications.

  Use **with** **`docker-pro`** for container orchestration, **`nestjs-pro`** for backend integration, **`azure-pro`** for Azure Storage integration, **`testing-pro`** for OCR accuracy tests, **`network-infra-pro`** for OCR service networking.

  Triggers: "OCR", "PaddleOCR", "EasyOCR", "Handz OCR", "text recognition", "frame detection", "image rotation", "bounding box", "OCR API", "OCR timeout", "OCR accuracy", "OCR configuration", "OCR docker", "Tesseract", "text extraction", "document processing", "OCR error", "OCR performance", "OCR cache".

metadata:
  short-description: OCR — architecture, setup, integration, troubleshooting, performance
  content-language: en
  domain: ocr
  level: professional
---

# OCR Integration and Troubleshooting (professional)

Skill text is **English**; answer in the user's preferred language when Cursor User Rules or the conversation specify it.

Use official [PaddleOCR docs](https://github.com/PaddlePaddle/PaddleOCR), [EasyOCR docs](https://github.com/JaidedAI/EasyOCR), and project-specific OCR service documentation for API truth; align production expectations with **caching**, **error handling**, **performance**, and **reliability** patterns. This skill encodes **OCR architecture discipline**, **service integration**, **configuration management**, and **operational reliability**. Confirm **OCR service type**, **language support**, **deployment model**, and **performance requirements** when known.

## Boundary

**`ocr-pro`** owns **OCR service architecture**: service selection (PaddleOCR vs Handz vs EasyOCR), **frame detection**, **text recognition**, **image rotation**, **configuration management**, **caching strategies**, **error handling**, **performance optimization**, and **troubleshooting**. It does **not** replace **`nestjs-pro`** for backend controller design, **`docker-pro`** for container orchestration, or **`azure-pro`** for Azure Storage integration.

| Skill | When to combine |
|-------|-----------------|
| **`docker-pro`** | OCR service containerization, Docker Compose orchestration |
| **`nestjs-pro`** | Backend controller design, service layer architecture |
| **`azure-pro`** | Azure Storage integration for image pipelines |
| **`testing-pro`** | OCR accuracy tests, integration tests |
| **`network-infra-pro`** | OCR service networking, load balancing |

## When to use

- Integrating OCR services (PaddleOCR, EasyOCR, Handz OCR) into applications.
- Setting up OCR infrastructure for local development or production.
- Debugging OCR failures (timeout, accuracy, configuration errors).
- Optimizing OCR performance (caching, batch processing, GPU acceleration).
- Designing OCR workflows for document processing applications.
- Trigger keywords: `OCR`, `PaddleOCR`, `EasyOCR`, `frame detection`, `text recognition`, `OCR error`, `OCR timeout`

## When not to use

- **Pure image processing** without OCR — **`image-processing-pro`** first.
- **Document parsing** beyond OCR (layout analysis, form field extraction) — specialized tools.
- **OCR model training** — specialized ML frameworks and data pipelines.

## Required inputs

- **OCR service type** (PaddleOCR, EasyOCR, Handz OCR) or requirements.
- **Language support** needs (Japanese, English, Math, etc.).
- **Deployment model** (local Docker, cloud, on-premises).
- **Performance requirements** (latency, throughput, accuracy targets).

## Expected output

Follow **Suggested response format (STRICT)** — eight sections from context through residual risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** OCR service type, language support, deployment model, and **performance/accuracy** requirements. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm OCR engine choice, language/script support, deployment model, and accuracy/latency target before changing the pipeline. Ask when the real need is OCR vs broader document understanding.
2. **Simplicity First** — Start with the smallest OCR path that satisfies the requirement. Do not add multiple engines, heavy preprocessing, or GPU assumptions unless needed.
3. **Surgical Changes** — Touch only the recognition path, config, cache, or integration point directly involved. Do not broaden into unrelated image or document workflows.
4. **Goal-Driven Execution** — Done = the OCR pipeline meets the stated accuracy/latency goal and the failure mode is explained or mitigated.
5. **OCR is probabilistic** — Accuracy expectations, language coverage, and image quality constraints must stay explicit.
6. **Preprocessing is part of the pipeline** — Rotation, cropping, and frame detection can matter as much as the model choice.
7. **Throughput and correctness trade off** — Caching, batching, and model selection should reflect the actual workload rather than generic “faster is better.”
8. **Integration boundaries matter** — OCR service contracts, storage handoff, and timeout behavior should be explicit before scaling deployment complexity.

## Default recommendations by scenario

- **New OCR integration** — Choose one engine and one clear pipeline before comparing alternatives.
- **Accuracy problem** — Check input quality, language config, and preprocessing before changing infrastructure.
- **Latency problem** — Profile model, batching, cache, and timeout behavior before adding replicas blindly.
- **Service failure** — Separate OCR engine errors from storage/network/backend integration issues.

## Decision trees

Summary: choose OCR engine, preprocessing, caching, and deployment complexity based on script support, latency, and operational constraints.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: treating OCR as deterministic, overcomplicating engine choice early, and debugging recognition issues without inspecting input quality and config first.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### OCR architecture (summary)

How OCR services, preprocessing, storage, and API boundaries fit together in a maintainable pipeline.

Details: [references/ocr-architecture.md](references/ocr-architecture.md)

### OCR setup and service comparison (summary)

How to choose and initialize PaddleOCR, EasyOCR, Handz OCR, or similar engines for the target need.

Details: [references/ocr-setup.md](references/ocr-setup.md)

### OCR configuration and troubleshooting (summary)

How language packs, model settings, and pipeline diagnostics influence real-world OCR outcomes.

Details: [references/ocr-configuration.md](references/ocr-configuration.md)

### OCR performance (summary)

How batching, caching, hardware choices, and timeout strategy affect latency and throughput.

Details: [references/ocr-performance.md](references/ocr-performance.md)

## Suggested response format (STRICT)

1. **Context** — OCR engine, languages, deployment model, and latency/accuracy target.
2. **Pipeline model** — Explain the recognition flow and where the issue or design choice sits.
3. **Recommendation** — Minimum OCR/config/integration change with rationale.
4. **Verification** — Accuracy, latency, or failure-path checks that prove the change.
5. **Residual risks** — Remaining image-quality, language, scaling, or integration caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| OCR architecture | [references/ocr-architecture.md](references/ocr-architecture.md) |
| OCR setup | [references/ocr-setup.md](references/ocr-setup.md) |
| OCR service comparison | [references/ocr-service-comparison.md](references/ocr-service-comparison.md) |
| OCR configuration | [references/ocr-configuration.md](references/ocr-configuration.md) |
| OCR troubleshooting | [references/ocr-troubleshooting.md](references/ocr-troubleshooting.md) |
| OCR performance | [references/ocr-performance.md](references/ocr-performance.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |

## Quick example

**Input:** "Set up OCR for Japanese receipts in Docker."
- Pick one engine with Japanese support and a minimal pipeline first.
- Keep container and OCR responsibilities explicit.
- **Verify:** Sample receipts process at the required accuracy and latency in the target container.

**Input (tricky):** "Accuracy dropped after we added image rotation."
- Inspect preprocessing and coordinate/frame assumptions before blaming the model.
- Reproduce with representative samples and narrow the pipeline stage that regressed.
- **Verify:** The corrected preprocessing path restores expected recognition quality.

**Input (cross-skill):** "OCR files land in blob storage and flow through a NestJS API."
- Pair **`nestjs-pro`** or storage-specific tooling for integration mechanics, while **`ocr-pro`** owns recognition path design.
- Keep backend orchestration separate from OCR engine reasoning.
- **Verify:** The service contract handles upload, OCR, and error paths explicitly.

## Checklist before calling the skill done

- [ ] OCR engine, language support, deployment model, and target metrics confirmed first (Think Before Coding)
- [ ] Minimum OCR pipeline chosen; no unnecessary engine or infra complexity added (Simplicity First)
- [ ] Only the relevant OCR/config/integration surface was changed (Surgical Changes)
- [ ] Success criteria and recognition/performance verification are explicit (Goal-Driven Execution)
- [ ] Input quality and preprocessing assumptions are considered
- [ ] Language/model support is explicit
- [ ] Latency and accuracy trade-offs are acknowledged
- [ ] Residual recognition or integration caveats are documented
