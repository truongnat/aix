# OCR Anti-Patterns

## Anti-Pattern 1: No Caching

**Problem**: Every OCR request processes the same image repeatedly.

**Example**:
```typescript
// Bad: No caching
async detectFrames(body: FrameDetectionRequestDto) {
  const ocrResponse = await this.ocrService.callOcrDetectionApi(request);
  return ocrResponse;
}
```

**Why it's bad**:
- Wastes computational resources
- High latency for repeated requests
- Increased costs
- Poor user experience

**Solution**:
```typescript
// Good: Implement caching
async detectFrames(body: FrameDetectionRequestDto) {
  const cacheKey = `${body.testManagementId}:${body.answerSheetPageId}`;
  
  const cached = await this.cache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  const ocrResponse = await this.ocrService.callOcrDetectionApi(request);
  await this.cache.set(cacheKey, ocrResponse, 3600);
  
  return ocrResponse;
}
```

## Anti-Pattern 2: Synchronous Processing in Request Path

**Problem**: Long-running OCR processing blocks the HTTP request.

**Example**:
```typescript
// Bad: Synchronous processing
@Post('/process')
async processDocument(@Body() body: ProcessDto) {
  // This blocks for 10+ seconds
  const result = await this.ocrService.processLargeDocument(body);
  return result;
}
```

**Why it's bad**:
- Request timeouts
- Poor user experience
- Server resource exhaustion
- No progress feedback

**Solution**:
```typescript
// Good: Async processing with status tracking
@Post('/process')
async processDocument(@Body() body: ProcessDto) {
  const jobId = await this.ocrQueue.add('process', body);
  return { jobId, status: 'queued' };
}

@Get('/status/:jobId')
async getStatus(@Param('jobId') jobId: string) {
  return await this.ocrQueue.getJob(jobId);
}
```

## Anti-Pattern 3: Hardcoded Configuration

**Problem**: OCR service URLs and timeouts hardcoded in code.

**Example**:
```typescript
// Bad: Hardcoded configuration
const OCR_API_URL = 'http://localhost:8000';
const OCR_TIMEOUT = 30000;

async callOcrApi(request: OcrRequestDto) {
  return await axios.post(`${OCR_API_URL}/api/v1/detection/`, request, {
    timeout: OCR_TIMEOUT,
  });
}
```

**Why it's bad**:
- Cannot change without redeploy
- Different configs for dev/staging/prod
- Security risk (credentials in code)
- Poor maintainability

**Solution**:
```typescript
// Good: Environment-based configuration
@Injectable()
export class OcrService {
  private readonly config: OcrRequestConfig;
  
  constructor(private configService: ConfigService) {
    this.config = this.configService.get<OcrRequestConfig>('ocrRequest');
  }
  
  async callOcrApi(request: OcrRequestDto) {
    return await axios.post(`${this.config.apiUrl}/api/v1/detection/`, request, {
      timeout: this.config.timeout,
    });
  }
}
```

## Anti-Pattern 4: No Error Handling

**Problem**: OCR service errors crash the entire application.

**Example**:
```typescript
// Bad: No error handling
async detectFrames(body: FrameDetectionRequestDto) {
  const result = await this.ocrService.callOcrDetectionApi(request);
  return result;
}
```

**Why it's bad**:
- Application crashes on OCR failure
- No graceful degradation
- Poor user experience
- Difficult debugging

**Solution**:
```typescript
// Good: Comprehensive error handling
async detectFrames(body: FrameDetectionRequestDto) {
  try {
    const result = await this.ocrService.callOcrDetectionApi(request);
    return { error: false, data: result };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      this.logger.error('OCR service unreachable');
      return { error: true, message: 'OCR service unavailable' };
    }
    if (error.code === 'ETIMEDOUT') {
      this.logger.error('OCR service timeout');
      return { error: true, message: 'OCR processing timeout' };
    }
    this.logger.error('OCR processing failed', error);
    return { error: true, message: 'OCR processing failed' };
  }
}
```

## Anti-Pattern 5: Processing Full-Resolution Images

**Problem**: Sending high-resolution images without optimization.

**Example**:
```typescript
// Bad: Processing full resolution
async processImage(imageUrl: string) {
  const image = await this.downloadImage(imageUrl);
  // Process 4000x3000 image directly
  return await this.ocrService.process(image);
}
```

**Why it's bad**:
- Slow processing
- High memory usage
- Network bandwidth waste
- Diminishing accuracy returns

**Solution**:
```typescript
// Good: Optimize image before processing
async processImage(imageUrl: string) {
  const image = await this.downloadImage(imageUrl);
  
  // Resize to optimal dimensions
  const MAX_WIDTH = 2000;
  const MAX_HEIGHT = 2000;
  if (image.width > MAX_WIDTH || image.height > MAX_HEIGHT) {
    const ratio = Math.min(MAX_WIDTH / image.width, MAX_HEIGHT / image.height);
    image = image.resize(
      Math.round(image.width * ratio),
      Math.round(image.height * ratio)
    );
  }
  
  return await this.ocrService.process(image);
}
```

## Anti-Pattern 6: Ignoring OCR Confidence Scores

**Problem**: Using OCR results without checking confidence.

**Example**:
```typescript
// Bad: Ignoring confidence
async processText(image: Image) {
  const results = await this.ocrService.recognize(image);
  return results.map(r => r.text); // No confidence check
}
```

**Why it's bad**:
- Low-quality results accepted
- False positives
- Poor data quality
- Difficult to debug

**Solution**:
```typescript
// Good: Filter by confidence
async processText(image: Image) {
  const results = await this.ocrService.recognize(image);
  const MIN_CONFIDENCE = 0.7;
  
  return results
    .filter(r => r.confidence >= MIN_CONFIDENCE)
    .map(r => ({
      text: r.text,
      confidence: r.confidence,
    }));
}
```

## Anti-Pattern 7: No Logging

**Problem**: No visibility into OCR processing.

**Example**:
```typescript
// Bad: No logging
async detectFrames(body: FrameDetectionRequestDto) {
  const result = await this.ocrService.callOcrDetectionApi(request);
  return result;
}
```

**Why it's bad**:
- Difficult debugging
- No performance tracking
- No error analysis
- Poor observability

**Solution**:
```typescript
// Good: Comprehensive logging
async detectFrames(body: FrameDetectionRequestDto) {
  const traceId = body.traceId || uuidv4();
  
  this.logger.info(`OCR request started`, { traceId, body });
  
  const startTime = Date.now();
  try {
    const result = await this.ocrService.callOcrDetectionApi(request);
    const duration = Date.now() - startTime;
    
    this.logger.info(`OCR request completed`, {
      traceId,
      duration,
      boxCount: result.boundingBoxes?.length,
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    this.logger.error(`OCR request failed`, {
      traceId,
      duration,
      error: error.message,
    });
    throw error;
  }
}
```

## Anti-Pattern 8: Monolithic OCR Service

**Problem**: Single OCR service handles all OCR types.

**Example**:
```typescript
// Bad: Monolithic service
class OcrService {
  async process(request: OcrRequest) {
    // Handles frame detection, text recognition, rotation all in one
    // Difficult to maintain and scale independently
  }
}
```

**Why it's bad**:
- Difficult to scale independently
- Complex codebase
- Hard to test
- Single point of failure

**Solution**:
```typescript
// Good: Specialized services
class FrameDetectionService {
  async detect(request: FrameDetectionRequest) {
    // Specialized for frame detection
  }
}

class TextRecognitionService {
  async recognize(request: TextRecognitionRequest) {
    // Specialized for text recognition
  }
}

class RotationService {
  async detectRotation(request: RotationRequest) {
    // Specialized for rotation detection
  }
}
```

## Anti-Pattern 9: No Rate Limiting

**Problem**: Unlimited OCR requests can overwhelm the service.

**Example**:
```typescript
// Bad: No rate limiting
@Post('/detect')
async detect(@Body() body: DetectionDto) {
  // No rate limit check
  return await this.ocrService.detect(body);
}
```

**Why it's bad**:
- Service overload
- Resource exhaustion
- Poor performance for all users
- Cost overrun

**Solution**:
```typescript
// Good: Rate limiting
@Post('/detect')
@Throttle({ default: { limit: 10, ttl: 60000 } })
async detect(@Body() body: DetectionDto) {
  return await this.ocrService.detect(body);
}
```

## Anti-Pattern 10: Ignoring Image Preprocessing

**Problem**: Sending images without preprocessing adjustments.

**Example**:
```typescript
// Bad: No preprocessing
async detect(imageUrl: string) {
  const image = await this.downloadImage(imageUrl);
  return await this.ocrService.detect(image);
}
```

**Why it's bad**:
- Lower accuracy
- Missed text regions
- Poor bounding boxes
- Wasted processing

**Solution**:
```typescript
// Good: Apply preprocessing
async detect(imageUrl: string, params: ImageParameters) {
  const image = await this.downloadImage(imageUrl);
  
  // Apply rotation
  if (params.rotation) {
    image = image.rotate(parseFloat(params.rotation));
  }
  
  // Apply zoom
  if (params.zoom) {
    const scale = parseFloat(params.zoom) / 100;
    image = image.resize(
      Math.round(image.width * scale),
      Math.round(image.height * scale)
    );
  }
  
  return await this.ocrService.detect(image);
}
```
