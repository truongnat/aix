import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service.js';
import { MasterGuard } from './master.guard.js';

@Module({
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: MasterGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
