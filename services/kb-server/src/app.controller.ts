import { Controller, Get } from '@nestjs/common';
import { Neo4jService } from './neo4j/neo4j.service.js';

@Controller()
export class AppController {
  readonly #neo4j: Neo4jService;

  constructor(neo4j: Neo4jService) {
    this.#neo4j = neo4j;
  }

  @Get('health')
  async health(): Promise<{ status: string; neo4j: boolean }> {
    const neo4jOk = await this.#neo4j.health();
    return { status: neo4jOk ? 'ok' : 'degraded', neo4j: neo4jOk };
  }
}
