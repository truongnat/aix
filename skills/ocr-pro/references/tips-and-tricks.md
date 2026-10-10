# OCR Tips and Tricks

## Quick Wins

### 1. Use Health Checks

```bash
curl http://localhost:8000/health
```

### 2. Pre-download Models

```bash
docker-compose exec paddleocr-local python -c "from paddleocr import PaddleOCR; PaddleOCR(lang='japan')"
```

### 3. Use Persistent Volumes

```yaml
volumes:
  paddleocr_models:
```

### 4. Set Appropriate Timeouts

```typescript
const DETECTION_TIMEOUT = 60000;
const RECOGNITION_TIMEOUT = 30000;
```

## Performance Tips

### 1. Batch Similar Requests

```typescript
const batches = groupBy(images, img => img.type);
```

### 2. Use Connection Pooling

```typescript
const axiosInstance = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
});
```

### 3. Parallel Processing

```typescript
const results = await Promise.all(images.map(img => this.ocrService.process(img)));
```

## Configuration Tips

### 1. Environment-Specific Configs

```bash
# .env.development
OCR_API_URL=http://localhost:8000

# .env.production
OCR_API_URL=https://ocr.production.com
```

### 2. Validate Configuration

```typescript
if (!config.apiUrl) throw new Error('OCR_API_URL is required');
```

## Debugging Tips

### 1. Enable Debug Logging

```typescript
this.logger.debug('OCR Request:', request);
```

### 2. Use Trace IDs

```typescript
const traceId = uuidv4();
this.logger.info({ traceId, 'Processing OCR request' });
```

## Integration Tips

### 1. Use Retry with Backoff

```typescript
const result = await pRetry(() => this.ocrService.process(request), { retries: 3, minTimeout: 1000 });
```

### 2. Circuit Breaker

```typescript
const circuitBreaker = new CircuitBreaker(this.ocrService.process.bind(this.ocrService), { timeout: 30000 });
```

## Security Tips

### 1. Sanitize Input

```typescript
if (!isValidUrl(request.imagePath)) throw new BadRequestException('Invalid image URL');
```

### 2. Rate Limit by User

```typescript
@Throttle({ default: { limit: 100, ttl: 3600 } })
async detect(@Body() body: DetectionDto) {
  return await this.ocrService.detect(body);
}
```

## Cost Optimization Tips

### 1. Use Caching Aggressively

```typescript
const cacheKey = `ocr:${hash(request)}`;
const cached = await this.cache.get(cacheKey);
if (cached) return cached;
```

### 2. Optimize Image Size

```typescript
const compressed = image.jpeg({ quality: 85 });
```
