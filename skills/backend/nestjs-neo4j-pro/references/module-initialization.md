# Module Initialization

## The critical rule

**ALL Neo4j constraints and indexes must be created in ONE place: `Neo4jService.onModuleInit()`.**

No other service should implement `onModuleInit()` for database schema setup. This prevents race conditions where multiple services try to create constraints simultaneously during application startup.

## The pattern

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Session } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Neo4jService.name);
  private driver: Driver;

  constructor(private readonly config: ConfigService) {
    this.driver = neo4j.driver(
      this.config.getOrThrow<string>('NEO4J_URI'),
      neo4j.auth.basic(
        this.config.getOrThrow<string>('NEO4J_USER'),
        this.config.getOrThrow<string>('NEO4J_PASSWORD'),
      ),
      {
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 30000,
        connectionTimeout: 5000,
      },
    );
  }

  async onModuleInit() {
    // Step 1: Verify connectivity before anything else
    await this.driver.verifyConnectivity();
    this.logger.log('Neo4j connection verified');

    // Step 2: Create all constraints and indexes
    await this.createConstraints();
    this.logger.log('Neo4j constraints and indexes created');
  }

  private async createConstraints() {
    const session = this.driver.session();
    try {
      // Uniqueness constraints (these also create indexes)
      const constraints = [
        'CREATE CONSTRAINT solution_id IF NOT EXISTS FOR (s:Solution) REQUIRE s.id IS UNIQUE',
        'CREATE CONSTRAINT tag_name IF NOT EXISTS FOR (t:Tag) REQUIRE t.name IS UNIQUE',
        'CREATE CONSTRAINT project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE',
        'CREATE CONSTRAINT technology_name IF NOT EXISTS FOR (t:Technology) REQUIRE t.name IS UNIQUE',
      ];

      // Additional indexes for common queries
      const indexes = [
        'CREATE INDEX solution_created IF NOT EXISTS FOR (s:Solution) ON (s.createdAt)',
        'CREATE INDEX solution_status IF NOT EXISTS FOR (s:Solution) ON (s.status)',
      ];

      for (const statement of [...constraints, ...indexes]) {
        await session.run(statement);
      }
    } finally {
      await session.close();
    }
  }

  getSession(mode: 'READ' | 'WRITE' = 'WRITE'): Session {
    return this.driver.session({
      defaultAccessMode:
        mode === 'READ' ? neo4j.session.READ : neo4j.session.WRITE,
    });
  }

  getDriver(): Driver {
    return this.driver;
  }

  async onModuleDestroy() {
    await this.driver.close();
    this.logger.log('Neo4j driver closed');
  }
}
```

## Why centralization matters

### The race condition problem

If `SolutionService` and `TagService` both implement `onModuleInit()` to create their respective constraints:

1. NestJS calls both `onModuleInit()` hooks concurrently (within the same module)
2. Both services open sessions and run CREATE CONSTRAINT
3. One may fail with a transient error if the other is mid-creation
4. On some Neo4j versions, concurrent schema modifications can deadlock

### The solution

- `Neo4jService` owns ALL schema modifications
- Other services inject `Neo4jService` and trust that constraints exist when they run
- NestJS guarantees `onModuleInit()` completes before the module is marked ready

## driver.verifyConnectivity() pattern

```typescript
async onModuleInit() {
  try {
    await this.driver.verifyConnectivity();
  } catch (error) {
    this.logger.error('Failed to connect to Neo4j', error.message);
    throw error; // Let NestJS fail startup — don't silently continue
  }
}
```

**Why throw?** A silent failure means the app starts but every query fails. Fail fast at startup so deployment orchestrators can detect and retry.

## Module registration

```typescript
// neo4j.module.ts
import { Global, Module } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';

@Global() // Makes Neo4jService available everywhere without importing Neo4jModule
@Module({
  providers: [Neo4jService],
  exports: [Neo4jService],
})
export class Neo4jModule {}
```

```typescript
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    Neo4jModule, // Imported once, available globally
    SolutionModule,
    TagModule,
  ],
})
export class AppModule {}
```

## Startup order guarantee

NestJS module initialization order:
1. `ConfigModule` resolves (env vars available)
2. `Neo4jModule.onModuleInit()` runs (driver connects, constraints created)
3. Other modules' `onModuleInit()` runs (constraints are guaranteed to exist)

This ordering is guaranteed because `Neo4jModule` is imported before feature modules in `AppModule.imports[]`.

## Health check integration

```typescript
// neo4j.health.ts
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class Neo4jHealthIndicator extends HealthIndicator {
  constructor(private neo4j: Neo4jService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const session = this.neo4j.getSession('READ');
    try {
      await session.run('RETURN 1');
      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, { message: error.message });
    } finally {
      await session.close();
    }
  }
}
```
