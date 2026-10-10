# OCR Edge Cases

## Image-Related Edge Cases

### Empty or Null Image

```typescript
if (!request.imagePath || request.imagePath.trim() === '') {
  throw new BadRequestException('imagePath is required');
}
```

### Corrupted Image

```typescript
try {
  const image = await this.downloadImage(request.imagePath);
} catch (error) {
  throw new BadRequestException('Failed to download image');
}
```

### Unsupported Image Format

```typescript
const supportedFormats = ['jpg', 'jpeg', 'png', 'bmp', 'tiff'];
const extension = request.imagePath.split('.').pop().toLowerCase();
if (!supportedFormats.includes(extension)) {
  throw new BadRequestException(`Unsupported image format: ${extension}`);
}
```

### Extremely Large Image

```typescript
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const imageSize = await this.getImageSize(request.imagePath);
if (imageSize > MAX_IMAGE_SIZE) {
  throw new BadRequestException('Image too large');
}
```

### Extremely Small Image

```typescript
const MIN_DIMENSION = 100;
if (image.width < MIN_DIMENSION || image.height < MIN_DIMENSION) {
  throw new BadRequestException('Image too small for OCR');
}
```

## Text-Related Edge Cases

### Empty Text Region

```typescript
if (!result.text || result.text.trim() === '') {
  this.logger.warn('Empty text result', { boundingBoxId });
}
```

### Very Low Confidence

```typescript
const MIN_CONFIDENCE = 0.3;
if (result.confidence < MIN_CONFIDENCE) {
  this.logger.warn('Low confidence result');
}
```

### Mixed Languages

```typescript
const hasJapanese = /[あ-んア-ン]/.test(text);
const hasEnglish = /[a-zA-Z]/.test(text);
if (hasJapanese && hasEnglish) {
  this.logger.info('Mixed language detected');
}
```

## Bounding Box Edge Cases

### Overlapping Boxes

```typescript
function boxesOverlap(box1, box2) {
  return !(box1.x + box1.w < box2.x || box2.x + box2.w < box1.x);
}
```

### Boxes Outside Image

```typescript
if (box.x < 0 || box.y < 0) {
  throw new BadRequestException('Bounding box outside image');
}
```

### Zero-Size Boxes

```typescript
if (box.w === 0 || box.h === 0) {
  throw new BadRequestException('Bounding box has zero size');
}
```

## Network Edge Cases

### Slow Network

```typescript
const DOWNLOAD_TIMEOUT = 30000;
```

### Network Interruption

```typescript
if (error.code === 'ECONNRESET) {
  throw new ServiceUnavailableException('Network interruption');
}
```

## Service Edge Cases

### OCR Service Down

```typescript
const healthCheck = await this.checkHealth(ocrApiUrl);
if (!healthCheck.healthy) {
  throw new ServiceUnavailableException('OCR service unavailable');
}
```

## Data Edge Cases

### Duplicate Requests

```typescript
const cacheKey = `ocr:${hash(request)}`;
const cached = await this.cache.get(cacheKey);
if (cached) return cached;
```

## Configuration Edge Cases

### Missing Configuration

```typescript
if (!process.env.OCR_API_URL) {
  throw new Error('OCR_API_URL is required');
}
```
