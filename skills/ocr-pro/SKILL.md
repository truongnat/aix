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