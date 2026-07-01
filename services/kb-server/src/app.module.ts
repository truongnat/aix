import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { SqliteModule } from './sqlite/sqlite.module.js';
import { CacheModule } from './cache/cache.module.js';
import { KbModule } from './kb/kb.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [SqliteModule, CacheModule, KbModule, AuthModule],
  controllers: [AppController],
})
export class AppModule {}

