import { Module, Global } from '@nestjs/common';
import { SqliteService } from './sqlite.service.js';

@Global()
@Module({
  providers: [SqliteService],
  exports: [SqliteService],
})
export class SqliteModule {}
