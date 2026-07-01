import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { KbService } from './kb.service.js';
import type { KbRecord } from '../sqlite/sqlite.service.js';

@Controller('api/v1/memory')
export class KbController {
  readonly #kb: KbService;

  constructor(kb: KbService) {
    this.#kb = kb;
  }

  @Post()
  async push(@Body() rec: KbRecord): Promise<{ ok: true }> {
    await this.#kb.push(rec);
    return { ok: true };
  }

  @Get('search')
  async search(@Query('q') q: string, @Query('k') k?: string): Promise<KbRecord[]> {
    return this.#kb.search(q, k ? Number(k) : 10);
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<KbRecord | null> {
    return this.#kb.get(id);
  }

  @Get()
  async list(@Query('kind') kind?: string): Promise<KbRecord[]> {
    return this.#kb.list(kind);
  }
}
