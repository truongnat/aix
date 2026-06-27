import { Module } from '@nestjs/common';
import { KbController } from './kb.controller.js';
import { KbService } from './kb.service.js';

@Module({
  controllers: [KbController],
  providers: [KbService],
  exports: [KbService],
})
export class KbModule {}
