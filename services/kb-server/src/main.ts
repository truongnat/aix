import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  if (!process.env.KB_MASTER_PASSWORD) {
    console.error('[kb-server] FATAL: KB_MASTER_PASSWORD is not set. Refusing to start.');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 4000;
  const host = process.env.KB_HOST ?? '127.0.0.1';
  await app.listen(port, host);
  console.log(`[kb-server] running on http://${host.includes(':') ? `[${host}]` : host}:${port}`);
}
bootstrap();
