import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Injectable()
export class MasterGuard implements CanActivate {
  readonly #auth: AuthService;

  constructor(auth: AuthService) {
    this.#auth = auth;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string> }>();
    const pwd = req.headers['x-master-password'] as string | undefined;
    if (pwd && this.#auth.validateMasterPassword(pwd)) return true;
    const key = req.headers['x-api-key'] as string | undefined;
    if (key) return this.#auth.validateKey(key);
    return false;
  }
}
