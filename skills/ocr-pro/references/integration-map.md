# OCR Integration Map

## System Architecture

```
Frontend (Next.js)
    ↓ HTTP/REST
Backend (NestJS)
    ↓ HTTP
OCR Service (PaddleOCR/Handz)
    ↓
Database (PostgreSQL)
    ↓
Azure Storage (Images)
```

## Component Integration

### Frontend → Backend

**Endpoints**:
- POST /api/v1/ocr-processing/frame-detection
- POST /api/v1/ocr-processing/text-recognition
- POST /api/v1/ocr-processing/update-status

### Backend → OCR Service

**Endpoints**:
- POST /api/v1/detection/
- POST /api/v1/text_recognition/text
- POST /api/v1/text_recognition/status/

### Backend → Database

**Tables**:
- t_model_answer_ocr_detection
- t_ocr_requests
- t_answer_ocr_result_box
- t_model_answer_ocr_result_box

## Cross-Skill Dependencies

### docker-pro

When to combine: OCR service containerization, Docker Compose orchestration.

### nestjs-pro

When to combine: Backend controller design, service layer architecture.

### azure-pro

When to combine: Azure Storage integration, SAS token generation.

## Configuration Integration

### Environment Variables

```env
OCR_API_URL=http://paddleocr-local:8000
OCR_TIMEOUT=30000
```

### Docker Compose Integration

```yaml
services:
  backend:
    environment:
      - OCR_API_URL=http://paddleocr-local:8000
    depends_on:
      - paddleocr-local
```

## Error Handling Integration

Error propagation: OCR Service Error → Backend OCR Service → Backend Controller → Frontend

## Deployment Integration

### Local Development

Frontend (localhost:3000) → Backend (localhost:3010) → PaddleOCR (localhost:8000) → PostgreSQL (localhost:5432)

### Production

Frontend (Cloud CDN) → Backend (Kubernetes) → PaddleOCR (Kubernetes, 3 replicas) → PostgreSQL (Managed DB)
