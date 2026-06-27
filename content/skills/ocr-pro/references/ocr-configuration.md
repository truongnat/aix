# OCR Configuration Management

## Environment Variables

### Backend Configuration

```env
# OCR Service URL
OCR_API_URL=http://paddleocr-local:8000

# OCR Request Timeout (milliseconds)
OCR_TIMEOUT=30000

# Azure Function URL (if using Azure OCR)
OCR_AZURE_FUNCTION_URL=https://your-function.azurewebsites.net
```

### PaddleOCR Local Configuration

```env
# Service Port
PORT=8000

# OCR Language Support
OCR_LANGUAGE=japanese+english

# GPU Acceleration
USE_GPU=false

# Show PaddleOCR Logs
SHOW_LOG=false

# Request Timeout (seconds)
REQUEST_TIMEOUT=60

# CORS Origins
CORS_ORIGINS=*
```

## Docker Compose Configuration

### PaddleOCR Local

```yaml
version: '3.8'

services:
  paddleocr-local:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: paddleocr-local
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
      - OCR_LANGUAGE=japanese+english
      - USE_GPU=false
    volumes:
      # Persist PaddleOCR models
      - paddleocr_models:/root/.paddleocr
      - paddleocr_hub:/root/.paddlehub
    networks:
      - dnp_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  paddleocr_models:
  paddleocr_hub:

networks:
  dnp_network:
    name: appl-rtd2-backend_dnp_network
    external: true
```

### Backend Integration

```yaml
services:
  backend:
    # ... other config
    environment:
      - OCR_API_URL=http://paddleocr-local:8000
      - OCR_TIMEOUT=30000
    depends_on:
      - paddleocr-local
    networks:
      - dnp_network
```

## Backend Configuration (NestJS)

### OCR Config Type

```typescript
// ocr-config.type.ts
export type OcrRequestConfig = {
  apiUrl: string;
  timeout: number;
  azureFunctionUrl: string;
};
```

### OCR Config Module

```typescript
// ocr.config.ts
import { registerAs } from '@nestjs/config';
import { IsOptional, IsInt, IsString } from 'class-validator';

class EnvironmentVariablesValidator {
  @IsString()
  OCR_API_URL: string;

  @IsInt()
  @IsOptional()
  OCR_TIMEOUT: number;

  @IsString()
  OCR_AZURE_FUNCTION_URL: string;
}

export const ocrRequest = registerAs<OcrRequestConfig>('ocrRequest', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    apiUrl: process.env.OCR_API_URL,
    azureFunctionUrl: process.env.OCR_AZURE_FUNCTION_URL,
    timeout: parseInt(process.env.OCR_TIMEOUT, 10) || 30000,
  };
});
```

### OCR Module Registration

```typescript
// ocr.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ocrRequest } from './ocr.config';
import { OcrService } from './services/ocr.service';

@Module({
  imports: [ConfigModule.forFeature(ocrRequest)],
  providers: [OcrService],
  exports: [OcrService],
})
export class OcrModule {}
```

## Configuration Best Practices

### 1. Environment-Specific Configs

```bash
# .env.development
OCR_API_URL=http://paddleocr-local:8000
OCR_TIMEOUT=30000

# .env.production
OCR_API_URL=https://ocr.production.com
OCR_TIMEOUT=60000
```

### 2. Secret Management

- **Local development**: Use `.env` file (gitignored)
- **Production**: Use Azure Key Vault or AWS Secrets Manager
- **CI/CD**: Use encrypted secrets in pipeline

### 3. Validation

Validate configuration on startup:

```typescript
function validateConfig(config: OcrConfig) {
  if (!config.apiUrl) {
    throw new Error('OCR_API_URL is required');
  }
  if (!isValidUrl(config.apiUrl)) {
    throw new Error('OCR_API_URL must be a valid URL');
  }
}
```

### 4. Defaults

Provide sensible defaults for optional settings:

```typescript
timeout: parseInt(process.env.OCR_TIMEOUT, 10) || 30000,
```

### 5. Documentation

Document all configuration options in:

- README.md
- .env.example file
- Configuration reference docs

## Common Configuration Issues

### Issue 1: OCR_API_URL Not Set

**Symptoms**: Backend throws error on startup or OCR calls fail

**Solution**:
```bash
# Check environment variable
echo $OCR_API_URL

# Set in .env file
OCR_API_URL=http://paddleocr-local:8000

# Restart backend
```

### Issue 2: Wrong Docker Network

**Symptoms**: Backend cannot reach OCR service

**Solution**:
```bash
# Check both services are on same network
docker network inspect dnp_network

# Add backend to network
docker network connect dnp_network backend-container
```

### Issue 3: Timeout Too Short

**Symptoms**: OCR requests fail with timeout errors

**Solution**:
```bash
# Increase timeout
OCR_TIMEOUT=60000
```

### Issue 4: CORS Issues

**Symptoms**: Browser blocks OCR requests

**Solution**:
```bash
# Set CORS origins in OCR service
CORS_ORIGINS=http://localhost:3000,http://localhost:3010
```

## Configuration Validation Checklist

- [ ] OCR_API_URL is set and valid
- [ ] OCR_TIMEOUT is set (default: 30000ms)
- [ ] OCR service is running and accessible
- [ ] Docker network configuration is correct
- [ ] CORS origins are configured
- [ ] Health check endpoint is accessible
- [ ] Environment-specific configs are separate
- [ ] Secrets are properly managed
- [ ] Configuration is validated on startup
- [ ] Documentation is up to date
