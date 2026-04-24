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

1. Confirm OCR service type, language support, deployment model, and **performance/accuracy** requirements.
2. Apply principles and summaries below; open `references/` for depth; tie **architecture**, **configuration**, **caching**, and **troubleshooting** together explicitly.
3. Respond using **Suggested response format (STRICT)**; flag timeout, accuracy, configuration, and **integration** risks.

### Operating principles

1. **Choose OCR service by use case** — PaddleOCR/EasyOCR for local dev, Handz OCR for production accuracy.
2. **Cache OCR results** — avoid redundant processing; use database or Redis for bounding boxes and text.
3. **Handle timeouts gracefully** — set appropriate timeouts, retry with backoff, fallback to cached results.
4. **Validate OCR output** — check bounding box coordinates, text quality, and confidence scores.
5. **Optimize image preprocessing** — rotation, zoom, shade adjustments improve accuracy.
6. **Monitor OCR performance** — track latency, accuracy, error rates, and resource usage.
7. **Test with real data** — use actual documents from production for accuracy validation.

### OCR architecture and flow (summary)

Service selection, data flow, caching strategy, error handling — **`ocr-architecture.md`**.

Details: [references/ocr-architecture.md](references/ocr-architecture.md)

### OCR service comparison (summary)

PaddleOCR vs EasyOCR vs Handz OCR — features, accuracy, performance, use cases — **`ocr-service-comparison.md`**.

Details: [references/ocr-service-comparison.md](references/ocr-service-comparison.md)

### Configuration management (summary)

Environment variables, Docker Compose, backend integration — **`ocr-configuration.md`**.

Details: [references/ocr-configuration.md](references/ocr-configuration.md)

### Setup and deployment (summary)

Local development setup, Docker containerization, production deployment — **`ocr-setup.md`**.

Details: [references/ocr-setup.md](references/ocr-setup.md)

### Troubleshooting (summary)

Common errors, debugging steps, log analysis — **`ocr-troubleshooting.md`**.

Details: [references/ocr-troubleshooting.md](references/ocr-troubleshooting.md)

### Performance optimization (summary)

Caching strategies, batch processing, GPU acceleration — **`ocr-performance.md`**.

Details: [references/ocr-performance.md](references/ocr-performance.md)

### Decision trees (summary)

When to use which OCR service, troubleshooting flow — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Tips and tricks (summary)

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Empty images, corrupted images, unsupported languages — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Integration map (summary)

Backend integration, Azure Storage, database caching — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Version notes (summary)

PaddleOCR versions, EasyOCR versions, Handz OCR SDK versions — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — OCR service type, language support, deployment model, performance/accuracy requirements.
2. **Problem / goal** — OCR integration task, troubleshooting issue, or optimization goal.
3. **System design** — OCR architecture, data flow, caching strategy — **`ocr-architecture.md`**.
4. **Decision reasoning** — Service selection, configuration choices — **`ocr-service-comparison.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Configuration, integration code, setup steps — label **Code**.
6. **Trade-offs** — Accuracy vs speed, local vs cloud, caching vs real-time.
7. **Failure modes** — Timeout, accuracy issues, configuration errors — **`ocr-troubleshooting.md`** themes.
8. **Residual risks** — Accuracy gaps, performance bottlenecks, **`docker-pro`** / **`nestjs-pro`** handoffs.

## Resources in this skill

| Topic | File |
|-------|------|
| OCR architecture & flow | [references/ocr-architecture.md](references/ocr-architecture.md) |
| OCR service comparison | [references/ocr-service-comparison.md](references/ocr-service-comparison.md) |
| Configuration management | [references/ocr-configuration.md](references/ocr-configuration.md) |
| Setup & deployment | [references/ocr-setup.md](references/ocr-setup.md) |
| Troubleshooting | [references/ocr-troubleshooting.md](references/ocr-troubleshooting.md) |
| Performance optimization | [references/ocr-performance.md](references/ocr-performance.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips & tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

### 1 — Setup (common)

**Input:** Set up PaddleOCR local service for Japanese and English text recognition.  
**Expected output:** Docker Compose setup, configuration, backend integration — follow **Suggested response format (STRICT)**.

### 2 — Troubleshooting (edge case)

**Input:** OCR detection API returns timeout errors for large images.  
**Expected output:** Timeout configuration, image preprocessing, caching strategy — **`ocr-troubleshooting.md`**.

### 3 — Cross-skill

**Input:** Integrate Handz OCR with NestJS backend and Azure Storage.  
**Expected output:** Backend controller design (**`nestjs-pro`**), Azure Storage integration (**`azure-pro`**), Docker orchestration (**`docker-pro`**).

## Checklist before calling the skill done

### Core

- [ ] OCR service type and language support confirmed.
- [ ] Configuration (OCR_API_URL, timeout, etc.) documented.
- [ ] Caching strategy defined (database, Redis, in-memory).
- [ ] Error handling and timeout logic implemented.

### Setup & deployment

- [ ] Docker containerization configured (if applicable).
- [ ] Backend integration tested (controller → service → OCR API).
- [ ] Environment variables set for local and production.

### Performance & reliability

- [ ] Timeout and retry logic configured.
- [ ] OCR output validation implemented (bounding boxes, text quality).
- [ ] Monitoring and logging in place (latency, accuracy, error rates).

### Anti-regression

- [ ] OCR accuracy tested with real production data.
- [ ] Performance benchmarks established (latency, throughput).
- [ ] Rollback plan documented for OCR service upgrades.
