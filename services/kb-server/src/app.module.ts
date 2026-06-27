import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { Neo4jModule } from './neo4j/neo4j.module.js';
import { KbModule } from './kb/kb.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [Neo4jModule, KbModule, AuthModule],
  controllers: [AppController],
})
export class AppModule {}
