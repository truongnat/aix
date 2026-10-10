# OCR Troubleshooting

## Common Errors and Solutions

### Error 1: OCR Service Unreachable

**Symptoms**:
- Backend throws connection refused error
- Timeout after 30 seconds
- `ECONNREFUSED` or `ETIMEDOUT` in logs

**Diagnosis Steps**:
```bash
# Check if OCR service is running
docker ps | grep paddleocr

# Check if container is healthy
docker inspect paddleocr-local | grep Health

# Test connectivity from backend
docker exec backend-container curl http://paddleocr-local:8000/health
```

**Solutions**:
1. Start OCR service:
```bash
cd appl-rtd2-paddleocr-local
docker-compose up -d
```

2. Check Docker network:
```bash
docker network inspect dnp_network
# Ensure both backend and OCR service are on same network
```

3. Verify OCR_API_URL:
```bash
echo $OCR_API_URL
# Should be: http://paddleocr-local:8000
```

4. Check firewall rules:
```bash
# Ensure port 8000 is not blocked
```

### Error 2: OCR Timeout

**Symptoms**:
- Requests fail after timeout period
- Large images timeout more frequently
- Error: "Request timeout of 30000ms exceeded"

**Diagnosis Steps**:
```bash
# Check OCR service logs
docker-compose logs paddleocr-local

# Check image size
curl -I <image_url>
# Look for Content-Length

# Test with small image
curl -X POST http://localhost:8000/api/v1/detection/ \
  -H "Content-Type: application/json" \
  -d '{"imagePath": "small.jpg", "traceId": "test", "imageParameters": {...}}'
```

**Solutions**:
1. Increase timeout:
```env
OCR_TIMEOUT=60000
```

2. Optimize image preprocessing:
- Resize large images before sending
- Compress images
- Use appropriate zoom level

3. Implement retry with backoff:
```typescript
// In OCR service
const retryConfig = {
  retries: 3,
  retryDelay: 1000,
};
```

4. Use GPU acceleration:
```env
USE_GPU=true
```

### Error 3: Low OCR Accuracy

**Symptoms**:
- Recognized text has many errors
- Bounding boxes are incorrect
- Missed text regions

**Diagnosis Steps**:
```bash
# Check image quality
# - Is resolution sufficient? (300 DPI recommended)
# - Is lighting good?
# - Is text clear and legible?

# Test with known good image
curl -X POST http://localhost:8000/api/v1/detection/ \
  -H "Content-Type: application/json" \
  -d '{"imagePath": "test-good.jpg", ...}'

# Check preprocessing parameters
# - rotation
# - zoom
# - shade
```

**Solutions**:
1. Improve image preprocessing:
```json
{
  "imageParameters": {
    "rotation": "0.00",
    "zoom": "150",
    "shade": "1.00"
  }
}
```

2. Use higher quality images
3. Switch to more accurate OCR service (Handz OCR)
4. Train custom models for specific fonts

### Error 4: Models Not Downloading

**Symptoms**:
- First request takes very long
- Error: "Model download failed"
- Logs show network errors

**Diagnosis Steps**:
```bash
# Check internet connectivity from container
docker-compose exec paddleocr-local ping -c 3 google.com

# Check model directory
docker-compose exec paddleocr-local ls -la /root/.paddleocr

# Check disk space
docker system df
```

**Solutions**:
1. Pre-download models:
```bash
docker-compose exec paddleocr-local python -c \
  "from paddleocr import PaddleOCR; PaddleOCR(lang='japan'); PaddleOCR(lang='en')"
```

2. Check Docker proxy settings
3. Use mirror for model downloads
4. Persist model volume to avoid re-downloading

### Error 5: Memory Exhaustion

**Symptoms**:
- Container crashes with OOM error
- System becomes slow
- Error: "Cannot allocate memory"

**Diagnosis Steps**:
```bash
# Check container memory usage
docker stats paddleocr-local

# Check system memory
free -h

# Check Docker memory limits
docker inspect paddleocr-local | grep Memory
```

**Solutions**:
1. Increase Docker memory limit:
```yaml
services:
  paddleocr-local:
    deploy:
      resources:
        limits:
          memory: 4G
```

2. Reduce batch size
3. Use smaller models
4. Add more RAM to system

### Error 6: CORS Errors

**Symptoms**:
- Browser blocks requests
- Error: "CORS policy blocked"
- Network tab shows preflight failure

**Diagnosis Steps**:
```bash
# Check CORS configuration in OCR service
# Look for CORS_ORIGINS env var

# Test with curl (should work)
curl -X POST http://localhost:8000/api/v1/detection/ ...
```

**Solutions**:
1. Configure CORS origins:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3010
```

2. Use proxy in backend
3. Add CORS middleware to backend

### Error 7: Invalid Request Data

**Symptoms**:
- 400 Bad Request error
- Validation error in response
- Missing required fields

**Diagnosis Steps**:
```bash
# Check request payload
# Verify all required fields are present
# Check data types match schema
```

**Solutions**:
1. Validate request before sending:
```typescript
// In controller
@Body() body: FrameDetectionRequestDto
```

2. Add detailed error messages:
```typescript
throw new BadRequestException('testManagementId is required');
```

3. Use DTO validation decorators

## Debugging Workflow

### Step 1: Check Service Status

```bash
# Is OCR service running?
docker ps | grep ocr

# Is it healthy?
docker inspect <container-name> | grep Health

# Check logs
docker logs <container-name>
```

### Step 2: Test OCR Service Directly

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test detection endpoint
curl -X POST http://localhost:8000/api/v1/detection/ \
  -H "Content-Type: application/json" \
  -d '{
    "imagePath": "test.jpg",
    "traceId": "debug-123",
    "imageParameters": {
      "verticalOffset": "0",
      "horizontalOffset": "0",
      "zoom": "100",
      "rotation": "0",
      "shade": "1"
    }
  }'
```

### Step 3: Check Backend Configuration

```bash
# Check environment variables
echo $OCR_API_URL
echo $OCR_TIMEOUT

# Test backend can reach OCR
docker exec backend-container curl http://paddleocr-local:8000/health
```

### Step 4: Check Network

```bash
# Check Docker network
docker network inspect dnp_network

# Check container IPs
docker inspect paddleocr-local | grep IPAddress
docker inspect backend-container | grep IPAddress

# Test connectivity
docker exec backend-container ping paddleocr-local
```

### Step 5: Check Database

```bash
# Check if OCR results are cached
# Connect to database and query t_model_answer_ocr_detection

# Check if OCR requests are tracked
# Query t_ocr_requests table
```

### Step 6: Enable Debug Logging

```typescript
// In OCR service
this.logger.debug('OCR Request:', request);
this.logger.debug('OCR Response:', response);
```

```bash
# Set log level
export LOG_LEVEL=debug
```

## Log Analysis

### Key Log Points

1. **Request received** - Confirm request reached OCR service
2. **Image download** - Check for download errors
3. **OCR processing** - Check for processing errors
4. **Response sent** - Check response format
5. **Error** - Check error details and stack traces

### Log Patterns

**Success pattern**:
```
INFO: Processing frame detection request for traceId: xxx
INFO: Image downloaded successfully
INFO: Frame detection completed, found N boxes
INFO: Response sent
```

**Error pattern**:
```
ERROR: Frame detection failed: <error details>
ERROR: Image download failed: <error>
ERROR: OCR processing timeout
```

## Performance Issues

### Slow Response Times

**Diagnosis**:
```bash
# Measure response time
time curl -X POST http://localhost:8000/api/v1/detection/ ...

# Check CPU usage
docker stats paddleocr-local

# Check if GPU is being used
nvidia-smi
```

**Solutions**:
1. Enable GPU acceleration
2. Reduce image resolution
3. Use caching
4. Optimize preprocessing
5. Scale horizontally

### High Memory Usage

**Diagnosis**:
```bash
# Check memory usage
docker stats paddleocr-local

# Check for memory leaks
# Monitor memory over time
```

**Solutions**:
1. Increase memory limit
2. Process images in batches
3. Clear cache periodically
4. Use smaller models

## Getting Help

### Information to Collect

1. Error messages and stack traces
2. OCR service logs
3. Backend logs
4. Docker container status
5. Environment variables
6. Request/response payloads (sanitized)
7. Image examples (if applicable)

### Where to Get Help

1. Check project documentation
2. Check OCR service documentation
3. Check GitHub issues
4. Contact support (for commercial OCR)
5. Community forums
