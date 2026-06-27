import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  readonly #auth: AuthService;

  constructor(auth: AuthService) {
    this.#auth = auth;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string> }>();
    const key = req.headers['x-api-key'] as string | undefined;
    if (!key) return false;
    return this.#auth.validateKey(key);
  }
}
