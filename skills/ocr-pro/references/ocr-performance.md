# OCR Performance Optimization

## Caching Strategies

### Database Caching

Cache OCR results in database to avoid redundant processing:

```typescript
// Check cache before processing
const cached = await this.modelAnswerOcrDetection.findOne({
  where: {
    testManagementId,
    modelAnswerSheetPageId,
  },
});

if (cached) {
  return { error: false, data: cached.ocrResponse };
}
```

**Benefits**:
- Eliminates redundant OCR processing
- Reduces latency for repeated requests
- Lower resource usage

**Considerations**:
- Cache invalidation strategy
- Storage costs
- Cache hit rate monitoring

### Redis Caching

Use Redis for high-performance caching:

```typescript
// Cache key pattern
const cacheKey = `ocr:detection:${testManagementId}:${pageId}`;

// Check Redis first
const cached = await redis.get(cacheKey);
if (cached) {
  return JSON.parse(cached);
}

// Process OCR
const result = await this.ocrService.callOcrDetectionApi(request);

// Cache result
await redis.setex(cacheKey, 3600, JSON.stringify(result));
```

**Benefits**:
- Faster than database caching
- Automatic expiration
- Distributed caching support

**Considerations**:
- Additional infrastructure
- Memory usage
- Cache coherence

### In-Memory Caching

Use in-memory cache for frequently accessed data:

```typescript
// Simple in-memory cache
const cache = new Map();

const getCached = (key: string) => cache.get(key);
const setCached = (key: string, value: any, ttl: number) => {
  cache.set(key, value);
  setTimeout(() => cache.delete(key), ttl * 1000);
};
```

**Benefits**:
- Fastest access
- No external dependencies
- Simple implementation

**Considerations**:
- Not distributed
- Limited by process memory
- Lost on restart

## Image Preprocessing Optimization

### Resize Images

Reduce image size before OCR processing:

```typescript
// Resize to reasonable dimensions
const MAX_WIDTH = 2000;
const MAX_HEIGHT = 2000;

if (image.width > MAX_WIDTH || image.height > MAX_HEIGHT) {
  const ratio = Math.min(MAX_WIDTH / image.width, MAX_HEIGHT / image.height);
  image = image.resize(
    Math.round(image.width * ratio),
    Math.round(image.height * ratio)
  );
}
```

**Benefits**:
- Faster processing
- Lower memory usage
- Reduced network transfer

**Considerations**:
- May reduce accuracy
- Need to find optimal size
- Aspect ratio preservation

### Convert to Grayscale

Simplify image to single channel:

```typescript
// Convert to grayscale for faster processing
const grayscale = image.grayscale();
```

**Benefits**:
- Faster processing
- Lower memory usage
- Often sufficient for OCR

**Considerations**:
- Color information lost
- May affect accuracy for some cases

### Optimize Compression

Use appropriate compression for images:

```typescript
// Compress image before sending
const compressed = image.jpeg({ quality: 85 });
```

**Benefits**:
- Smaller file size
- Faster transfer
- Lower bandwidth usage

**Considerations**:
- Compression artifacts
- Quality trade-off

## Batch Processing

### Process Multiple Images

Process multiple images in a single request:

```typescript
// Batch processing endpoint
@Post('/batch-detection')
async batchDetectFrames(@Body() body: BatchDetectionRequestDto) {
  const results = await Promise.all(
    body.images.map(image => this.ocrService.callOcrDetectionApi(image))
  );
  return results;
}
```

**Benefits**:
- Reduced overhead
- Better resource utilization
- Lower latency per image

**Considerations**:
- Higher memory usage
- Longer request time
- Error handling complexity

### Queue-Based Processing

Use message queue for async processing:

```typescript
// Add to queue
await this.ocrQueue.add('process-image', {
  imagePath,
  traceId,
  imageParameters,
});

// Worker processes in background
@Processor('ocr-queue')
async processImage(job: Job) {
  const result = await this.ocrService.callOcrDetectionApi(job.data);
  // Save result to database
}
```

**Benefits**:
- Non-blocking
- Scalable
- Better resource management

**Considerations**:
- Additional infrastructure
- Complexity
- Async result retrieval

## GPU Acceleration

### Enable GPU in PaddleOCR

```yaml
services:
  paddleocr-local:
    environment:
      - USE_GPU=true
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

**Benefits**:
- 5-10x faster processing
- Higher throughput
- Better for production

**Considerations**:
- GPU hardware required
- Higher cost
- Driver compatibility

### Mixed CPU/GPU Processing

Use GPU for heavy tasks, CPU for light tasks:

```typescript
// Route based on image complexity
if (image.complexity > threshold) {
  return await processWithGPU(image);
} else {
  return await processWithCPU(image);
}
```

**Benefits**:
- Optimal resource usage
- Cost-effective
- Flexible scaling

**Considerations**:
- Complexity estimation
- Routing logic
- Monitoring needed

## Parallel Processing

### Concurrent Requests

Process multiple OCR requests concurrently:

```typescript
// Process multiple images in parallel
const results = await Promise.all(
  images.map(img => this.ocrService.process(img))
);
```

**Benefits**:
- Faster overall processing
- Better resource utilization
- Lower latency

**Considerations**:
- Higher memory usage
- Rate limiting
- Error handling

### Worker Pools

Use worker pool for CPU-bound tasks:

```typescript
const pool = new WorkerPool(os.cpus().length);

const results = await Promise.all(
  images.map(img => pool.submit(() => processImage(img)))
);
```

**Benefits**:
- Optimal CPU usage
- Controlled concurrency
- Better resource management

**Considerations**:
- Worker overhead
- Memory per worker
- Complexity

## Load Balancing

### Multiple OCR Instances

Deploy multiple OCR service instances:

```yaml
services:
  paddleocr-local:
    deploy:
      replicas: 3
```

**Benefits**:
- Higher throughput
- Better availability
- Load distribution

**Considerations**:
- Higher cost
- Synchronization
- Session management

### Load Balancer Configuration

Use load balancer to distribute requests:

```yaml
# Example with Nginx
upstream ocr_services {
  server paddleocr-1:8000;
  server paddleocr-2:8000;
  server paddleocr-3:8000;
}

server {
  location /ocr/ {
    proxy_pass http://ocr_services;
  }
}
```

**Benefits**:
- Automatic load distribution
- Health checking
- SSL termination

**Considerations**:
- Additional infrastructure
- Configuration complexity
- Monitoring

## Monitoring and Optimization

### Key Metrics

Monitor these metrics for performance:

1. **Latency**
   - p50, p95, p99 response times
   - Per-endpoint latency
   - Time by stage (download, process, upload)

2. **Throughput**
   - Requests per second
   - Images per second
   - Concurrent requests

3. **Resource Usage**
   - CPU utilization
   - Memory usage
   - GPU utilization (if applicable)
   - Network bandwidth

4. **Accuracy**
   - OCR accuracy rate
   - Error rate
   - Cache hit rate

### Performance Testing

Run load tests to identify bottlenecks:

```bash
# Use k6 or similar tool
k6 run --vus 10 --duration 30s ocr-load-test.js
```

### Optimization Checklist

- [ ] Caching implemented and configured
- [ ] Image preprocessing optimized
- [ ] Batch processing where applicable
- [ ] GPU acceleration enabled (if available)
- [ ] Parallel processing implemented
- [ ] Load balancing configured
- [ ] Monitoring in place
- [ ] Performance baselines established
- [ ] Regular performance reviews
- [ ] Optimization based on metrics

## Performance Targets

### Latency Targets

- Frame detection: < 3 seconds (P95)
- Text recognition: < 2 seconds per box (P95)
- Status check: < 500ms (P95)

### Throughput Targets

- PaddleOCR (CPU): 10-20 requests/second
- PaddleOCR (GPU): 50-100 requests/second
- Handz OCR: 5-10 requests/second

### Resource Targets

- Memory per instance: 2-4GB
- CPU per instance: 2-4 cores
- GPU memory: 2-4GB (if using GPU)
