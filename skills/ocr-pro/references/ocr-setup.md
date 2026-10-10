# OCR Setup and Deployment

## PaddleOCR Local Setup

### Prerequisites

- Docker and Docker Compose installed
- Docker network `dnp_network` exists
- At least 4GB RAM available
- At least 10GB disk space available

### Step 1: Clone/Verify Project

```bash
cd appl-rtd2-paddleocr-local
```

### Step 2: Build and Start

```bash
docker-compose up -d --build
```

### Step 3: Verify Service

```bash
# Check container is running
docker ps | grep paddleocr

# Check health
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy"}
```

### Step 4: Test OCR

```bash
# Test frame detection
curl -X POST http://localhost:8000/api/v1/detection/ \
  -H "Content-Type: application/json" \
  -d '{
    "imagePath": "https://example.com/image.jpg",
    "traceId": "test-123",
    "imageParameters": {
      "verticalOffset": "0",
      "horizontalOffset": "0",
      "zoom": "100",
      "rotation": "0",
      "shade": "1"
    }
  }'
```

### Step 5: Check Logs

```bash
docker-compose logs -f paddleocr-local
```

## Handz OCR Setup

### Prerequisites

- Python 3.10+
- Proprietary SDK files (libHandzOcrEngine.so, etc.)
- Tesseract OCR installed
- Azure Storage credentials (if using Azure)

### Step 1: Copy SDK Files

```bash
# Copy proprietary libraries to correct locations
cp app/sdk/Japanese/Lib/lib/*.so* /usr/local/lib/japanese/
cp app/sdk/English/Lib/lib/*.so* /usr/local/lib/english/
cp app/sdk/Math1/Lib/lib/*.so* /usr/local/lib/math/
```

### Step 2: Build Docker Image

```bash
cd appl-rtd2-ocr
docker build -t handz-ocr:latest -f ocr-engine/Dockerfile .
```

### Step 3: Run Container

```bash
docker run -d \
  --name handz-ocr \
  -p 8000:8000 \
  --network dnp_network \
  -e OCR_API_URL=http://localhost:8000 \
  handz-ocr:latest
```

### Step 4: Verify Service

```bash
curl http://localhost:8000/health
```

## Backend Integration Setup

### Step 1: Set Environment Variables

Create or update `.env` in backend directory:

```env
OCR_API_URL=http://paddleocr-local:8000
OCR_TIMEOUT=30000
OCR_AZURE_FUNCTION_URL=
```

### Step 2: Update Docker Compose (if using Docker)

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    # ... existing config
    environment:
      - OCR_API_URL=http://paddleocr-local:8000
      - OCR_TIMEOUT=30000
    depends_on:
      - paddleocr-local
```

### Step 3: Restart Backend

```bash
# If running locally
# Stop and restart with new env vars

# If running in Docker
docker-compose restart backend
```

### Step 4: Test Integration

```bash
# Test frame detection endpoint
curl -X POST http://localhost:3010/api/v1/ocr-processing/frame-detection \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "testManagementId": "1",
    "answerSheetPageId": "1"
  }'
```

## Production Deployment

### PaddleOCR Production

#### 1. Use GPU Acceleration

```yaml
services:
  paddleocr-local:
    # ... other config
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    environment:
      - USE_GPU=true
```

#### 2. Load Balancing

```yaml
services:
  paddleocr-local:
    # Scale to multiple instances
    deploy:
      replicas: 3
```

#### 3. Monitoring

Add health checks and metrics:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Handz OCR Production

#### 1. Secure SDK Files

Store proprietary libraries in secure location:

- Azure Key Vault
- AWS Secrets Manager
- Encrypted volume

#### 2. License Management

- Ensure commercial license is valid
- Track usage for compliance
- Renew before expiration

#### 3. High Availability

- Deploy multiple instances
- Use load balancer
- Implement failover

## Troubleshooting Setup Issues

### Container Won't Start

**Check logs**:
```bash
docker-compose logs paddleocr-local
```

**Common causes**:
- Port already in use
- Docker network missing
- Insufficient resources
- Build errors

### Service Unreachable

**Check network**:
```bash
docker network inspect dnp_network
```

**Check container IP**:
```bash
docker inspect paddleocr-local | grep IPAddress
```

### Models Not Downloading

**Check internet connectivity**:
```bash
docker-compose exec paddleocr-local ping -c 3 google.com
```

**Pre-download models**:
```bash
docker-compose exec paddleocr-local python -c "from paddleocr import PaddleOCR; PaddleOCR(lang='japan')"
```

### Permission Errors

**Check file permissions**:
```bash
docker-compose exec paddleocr-local ls -la /root/.paddleocr
```

**Fix permissions**:
```bash
docker-compose exec paddleocr-local chown -R root:root /root/.paddleocr
```

## Setup Verification Checklist

### PaddleOCR Local

- [ ] Docker and Docker Compose installed
- [ ] Docker network `dnp_network` exists
- [ ] Container builds successfully
- [ ] Container starts without errors
- [ ] Health check passes
- [ ] Frame detection API works
- [ ] Text recognition API works
- [ ] Models downloaded successfully
- [ ] Logs show no errors

### Handz OCR

- [ ] Python 3.10+ installed
- [ ] SDK files copied correctly
- [ ] Tesseract installed
- [ ] Docker image builds successfully
- [ ] Container starts without errors
- [ ] All OCR endpoints work
- [ ] License is valid

### Backend Integration

- [ ] OCR_API_URL set correctly
- [ ] OCR_TIMEOUT configured
- [ ] Backend can reach OCR service
- [ ] Frame detection endpoint works
- [ ] Text recognition endpoint works
- [ ] Status check endpoint works
- [ ] Caching works correctly
- [ ] Error handling works

### Production

- [ ] GPU acceleration configured (if needed)
- [ ] Load balancing set up
- [ ] Health checks configured
- [ ] Monitoring in place
- [ ] Secrets managed securely
- [ ] License compliance verified
- [ ] Backup strategy in place
- [ ] Rollback plan documented
