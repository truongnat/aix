# OCR Architecture and Flow

## System Overview

The Realtendant2 OCR system consists of three main components:

1. **Backend Controller** (NestJS) - Handles OCR requests from frontend
2. **OCR Service** - Calls external OCR APIs
3. **External OCR Services** - PaddleOCR Local or Handz OCR

## Data Flow

### Frame Detection Flow

```
Frontend → POST /api/v1/ocr-processing/frame-detection
  ↓
Backend: OcrProcessingController.detectFrames()
  ↓
1. Validate RLS (Row Level Security)
2. Get image from database (m_model_answer_sheet_pages)
3. Check cache (t_model_answer_ocr_detection)
4. If cached → Return cached results
5. If not cached → Call OCR service
  ↓
Backend: OcrService.callOcrDetectionApi()
  ↓
HTTP POST → {OCR_API_URL}/api/v1/detection/
  ↓
External OCR Service (PaddleOCR/Handz)
  ↓
EasyOCR / Handz OCR Engine
  ↓
Return bounding boxes (large, medium, small)
  ↓
Backend: Cache results in t_model_answer_ocr_detection
  ↓
Return results → Frontend
```

### Text Recognition Flow

```
Frontend → POST /api/v1/ocr-processing/text-recognition
  ↓
Backend: OcrProcessingController.textRecognition()
  ↓
1. Validate request with bounding boxes
2. Call OCR service with base64 images
  ↓
Backend: OcrService.callOcrTextRecognitionApi()
  ↓
HTTP POST → {OCR_API_URL}/api/v1/text_recognition/text
  ↓
External OCR Service
  ↓
OCR Engine processes each bounding box
  ↓
Return recognized text for each box
  ↓
Backend: Save results to database
  ↓
Backend: Update t_ocr_requests table
  ↓
Return results → Frontend
```

### Status Check Flow

```
Frontend → POST /api/v1/ocr-processing/update-status
  ↓
Backend: OcrProcessingController.updateOcrStatus()
  ↓
1. Get OCR request from database
2. Call OCR status API
  ↓
Backend: OcrService.callOcrStatusApi()
  ↓
HTTP POST → {OCR_API_URL}/api/v1/text_recognition/status/
  ↓
External OCR Service
  ↓
Return processing status (completed/pending/failed)
  ↓
Backend: Update t_ocr_requests table
  ↓
Return updated status → Frontend
```

## Caching Strategy

### Database Caching

Cache OCR results in database to avoid redundant processing:

- **t_model_answer_ocr_detection**: Caches frame detection results for model answers
  - Key: testManagementId + modelAnswerSheetPageId
  - Value: JSON array of bounding boxes
  - TTL: Permanent (model answers don't change)

- **t_ocr_requests**: Tracks OCR processing requests
  - Key: requestId (UUID)
  - Value: Processing status, timestamps
  - TTL: Based on business requirements

### When to Bypass Cache

- Force re-detection parameter set
- Image updated in database
- OCR service upgraded
- Manual cache invalidation

## Error Handling

### Timeout Handling

- Default timeout: 30 seconds (configurable via OCR_TIMEOUT)
- Retry strategy: Exponential backoff
- Fallback: Return cached results if available
- Last resort: Return error with 504 status

### Error Categories

1. **Network Errors**: OCR service unreachable
   - Action: Retry with backoff, check Docker container status
2. **Timeout Errors**: OCR processing too slow
   - Action: Increase timeout, optimize image preprocessing
3. **Validation Errors**: Invalid request data
   - Action: Return 400 with detailed error message
4. **OCR Service Errors**: Internal OCR failures
   - Action: Log error details, return 500 with safe message

## Image Preprocessing

### Parameters

- **verticalOffset**: Y-axis adjustment
- **horizontalOffset**: X-axis adjustment
- **zoom**: Scale percentage (100 = original)
- **rotation**: Rotation angle in degrees
- **shade**: Intensity level adjustment

### Preprocessing Pipeline

1. Download image from Azure Storage
2. Apply rotation (if specified)
3. Apply zoom (if specified)
4. Apply offset adjustments (if specified)
5. Apply shade/intensity adjustment (if specified)
6. Send preprocessed image to OCR service

## Security Considerations

### RLS (Row Level Security)

- All OCR operations respect RLS
- Resource accounts use distributable RLS ID
- User accounts use their own RLS ID

### API Key Management

- OCR API URLs stored in environment variables
- No hardcoded credentials in code
- Azure Key Vault for production secrets

### Input Validation

- Validate image paths (prevent directory traversal)
- Validate bounding box coordinates
- Validate base64 image data size limits

## Performance Considerations

### Latency

- Frame detection: 2-5 seconds (typical)
- Text recognition: 1-3 seconds per bounding box
- Status check: < 1 second

### Throughput

- PaddleOCR Local: ~10-20 requests/second (CPU)
- Handz OCR: ~5-10 requests/second (depends on hardware)
- GPU acceleration: 5-10x improvement

### Resource Usage

- PaddleOCR Docker image: 2.9GB disk
- Memory usage: 2-4GB per container
- CPU usage: High during processing

## Monitoring

### Key Metrics

- OCR request latency (p50, p95, p99)
- OCR success rate
- OCR accuracy (manual sampling)
- Cache hit rate
- OCR service resource usage

### Logging

- Request/response payloads (sanitized)
- Error details with stack traces
- Performance metrics
- Cache hit/miss events
