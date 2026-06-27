import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service.js';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class MasterGuard implements CanActivate {
  readonly #auth: AuthService;
  readonly #reflector: Reflector;

  constructor(auth: AuthService, reflector: Reflector) {
    this.#auth = auth;
    this.#reflector = reflector;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.#reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<{ headers: Record<string, string> }>();
    const pwd = req.headers['x-master-password'] as string | undefined;
    if (pwd && this.#auth.validateMasterPassword(pwd)) return true;
    const key = req.headers['x-api-key'] as string | undefined;
    if (key) return this.#auth.validateKey(key);
    return false;
  }
}
