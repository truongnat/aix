---
name: nodejs-backend-patterns
description: Build production-ready Node.js backend services with Express/Fastify, implementing middleware patterns, error handling, authentication, database integration, and API design best practices. Use when creating Node.js servers, REST APIs, GraphQL backends, or microservices architectures.
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "nodejs,backend,api"
  roles: "backend-engineer"
  compatible: "claude,cursor,codex,gemini"

---

# Node.js Backend Patterns

Comprehensive guidance for building scalable, maintainable, and production-ready Node.js backend applications with modern frameworks, architectural patterns, and best practices.

## Boundary

This is a general Node.js backend reference. Use **`sk-nestjs-pro`** for NestJS wiring, **`sk-api-design-pro`** for API contracts, and **`sk-microservices-pro`** for distributed service topology.

## When to Use This Skill

- Building REST APIs or GraphQL servers
- Creating microservices with Node.js
- Implementing authentication and authorization
- Designing scalable backend architectures
- Setting up middleware and error handling
- Integrating databases (SQL and NoSQL)
- Building real-time applications with WebSockets
- Implementing background job processing

## Detailed patterns and worked examples

Detailed pattern documentation lives in `references/details.md`. Read that file when the navigation tier above is insufficient.

## Best Practices

1. **Use TypeScript**: Type safety prevents runtime errors
2. **Implement proper error handling**: Use custom error classes
3. **Validate input**: Use libraries like Zod or Joi
4. **Use environment variables**: Never hardcode secrets
5. **Implement logging**: Use structured logging (Pino, Winston)
6. **Add rate limiting**: Prevent abuse
7. **Use HTTPS**: Always in production
8. **Implement CORS properly**: Don't use `*` in production
9. **Use dependency injection**: Easier testing and maintenance
10. **Write tests**: Unit, integration, and E2E tests
11. **Handle graceful shutdown**: Clean up resources
12. **Use connection pooling**: For databases
13. **Implement health checks**: For monitoring
14. **Use compression**: Reduce response size
15. **Monitor performance**: Use APM tools

## Testing Patterns

See `sk-javascript-testing-patterns` skill for comprehensive testing guidance.

## Output

Produce a Node.js backend implementation or review artifact with runtime choices, module boundaries, API/error contract, security, tests, and operational checks.

## Required inputs

- system context, quality attributes, constraints, current architecture, interfaces, and decision drivers.
- State assumptions explicitly when context, ownership, or evidence is incomplete.

## Cross-skill handoffs

- sk-security-pro for threat controls; sk-testing-pro for verification; sk-deployment-pro for runtime rollout; relevant framework/domain skill for implementation detail.
