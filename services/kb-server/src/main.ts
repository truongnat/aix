import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AuthService } from './auth/auth.service.js';
import { Neo4jService } from './neo4j/neo4j.service.js';

async function bootstrap(): Promise<void> {
  if (!process.env.KB_MASTER_PASSWORD) {
    console.error('[kb-server] FATAL: KB_MASTER_PASSWORD is not set. Refusing to start.');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.enableShutdownHooks();

  // Initialize Neo4j (Memory constraint) + auth schema before serving.
  await app.get(Neo4jService).ensureSchema();
  await app.get(AuthService).ensureSchema();

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`[kb-server] running on http://localhost:${port}`);
}
bootstrap();
