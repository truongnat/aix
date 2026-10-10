# NestJS — version notes

Confirm **`@nestjs/core`** and **`@nestjs/common`** versions from `package.json`. Behavior and decorators evolve across majors — always check the official [migration guides](https://docs.nestjs.com/migration-guide) for your jump.

| Area | What to verify across majors |
|------|------------------------------|
| **Node.js** | Supported Node range per Nest release; drop EOL Node first |
| **Fastify vs Express** | Adapter APIs and middleware ordering differ |
| **ValidationPipe / class-validator** | Major bumps may change default options |
| **Swagger / OpenAPI** | Plugin package names and `DocumentBuilder` options |
| **GraphQL** | Code-first vs schema-first tooling versions |
| **Microservices** | Transport-specific option shapes (Kafka, NATS, Redis) |
| **Testing** | `TestingModule` and Jest preset compatibility |

| Feature | Typical introduction | Migration note |
|---------|---------------------|----------------|
| **Configurable modules** | Early Nest | Prefer `registerAsync` + factory for secrets |
| **ESM / type module** | Varies by ecosystem | Align `tsconfig` `module` with Node and Nest CLI |
| **SWC builder** | Optional faster builds | Verify decorator metadata if switching from `tsc` |

**When NOT to upgrade blindly:** Large jumps during a release freeze — schedule Nest upgrades with full e2e and contract tests.
