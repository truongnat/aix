---
name: prisma-postgres
description: Prisma Postgres setup and operations guidance across Console, create-db CLI, Management API, and Management API SDK. Use when creating Prisma Postgres databases, working in Prisma Console, provisioning with create-db/create-pg/create-postgres, or integrating programmatic provisioning with service tokens or OAuth.
license: MIT
metadata:
  author: prisma
  version: "1.0.0"
  short-description: "Prisma Postgres — setup, Console, provisioning, Management API"
---

## Boundary

This skill provides guidance for creating, managing, and integrating Prisma Postgres across Console, create-db CLI, Management API, and Management API SDK. It focuses on Prisma Postgres-specific operations, provisioning, and authentication. It does NOT cover general PostgreSQL patterns (use postgres-patterns skill), general Prisma ORM usage (use database-specific skills), or other database systems.

## When to use

Use this skill when:
- Setting up Prisma Postgres from Prisma Console
- Provisioning instant temporary databases with `create-db`
- Managing Prisma Postgres resources via Management API
- Using `@prisma/management-api-sdk` in TypeScript/JavaScript
- Handling claim URLs, connection strings, regions, and auth flows
- Integrating programmatic provisioning with service tokens or OAuth

DO NOT use this skill for:
- General PostgreSQL patterns (use postgres-patterns skill)
- General Prisma ORM usage (use database-specific skills)
- Other database systems (MySQL, MongoDB, etc.)
- Non-Prisma database operations

## Workflow

1. **Choose provisioning method** (Console, create-db CLI, Management API, SDK)
2. **Configure authentication** (service token, OAuth)
3. **Create or manage database** using selected method
4. **Obtain connection string** or claim URL
5. **Configure application** to use the database
6. **Test connection** and validate setup
7. **Manage lifecycle** (create, delete, scale)

### Operating principles

- **CLI Provisioning**: Use `create-db` for instant temporary databases (CRITICAL priority)
- **Management API**: Use Management API for programmatic resource management (CRITICAL priority)
- **SDK Integration**: Use `@prisma/management-api-sdk` for TypeScript/JavaScript (HIGH priority)
- **Console**: Use Prisma Console for interactive management (HIGH priority)
- **Authentication**: Use service tokens or OAuth for API access
- **Connection Security**: Use TLS and secure connection strings
- **Region Selection**: Choose appropriate region for latency and compliance
- **Resource Cleanup**: Delete temporary databases after use

## Suggested response format

```
Provisioning Method: [Console / create-db CLI / Management API / SDK]
Database: [database name]
Region: [region]
Status: [success/failed]
Connection String: [or claim URL]
Details: [provisioning details, configuration steps]
Next steps: [follow-up actions if any]
```

## Resources in this skill

- **Provisioning Methods**: Console, create-db CLI, Management API, Management API SDK
- **Authentication**: Service tokens, OAuth flows
- **Operations**: Create, delete, list, scale databases
- **Connection**: Connection strings, claim URLs, TLS
- **SDK**: `@prisma/management-api-sdk` for TypeScript/JavaScript

## Quick example

**Create a temporary database with create-db CLI:**

```
1. Install create-db CLI
2. Authenticate with service token
3. Run: create-db --name mydb --region us-east-1
4. Obtain connection string or claim URL
5. Configure application to use database
6. Test connection
```

## Checklist before calling the skill done

- [ ] Prisma account is configured
- [ ] Authentication method is selected (service token or OAuth)
- [ ] Provisioning method is chosen (Console, CLI, API, SDK)
- [ ] Region requirements are understood
- [ ] Database naming conventions are defined
- [ ] Connection security requirements are identified
- [ ] Lifecycle management strategy is planned
- [ ] Cleanup procedures are defined (for temporary databases)

---

# Prisma Postgres

Guidance for creating, managing, and integrating Prisma Postgres across interactive and programmatic workflows.

## When to Apply

Reference this skill when:
- Setting up Prisma Postgres from Prisma Console
- Provisioning instant temporary databases with `create-db`
- Managing Prisma Postgres resources via Management API
- Using `@prisma/management-api-sdk` in TypeScript/JavaScript
- Handling claim URLs, connection strings, regions, and auth flows

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | CLI Provisioning | CRITICAL | `create-db-cli` |
| 2 | Management API | CRITICAL | `management-api` |
| 3 | Management API SDK | HIGH | `management-api-sdk` |
| 4 | Console and Connections | HIGH | `console-and-connections` |

## Quick Reference

- `create-db-cli` - instant databases and CLI options
- `management-api` - service token and OAuth API workflows
- `management-api-sdk` - typed SDK usage with token storage
- `console-and-connections` - Console operations and connection setup

## Core Workflows

### 1. Console-first workflow

Use Prisma Console for manual setup and operations:

- Open `https://console.prisma.io`
- Create/select workspace and project
- Use Studio in the project sidebar to view/edit data
- Retrieve direct connection details from the project UI

### 2. Quick provisioning with create-db

Use `create-db` when you need a database immediately:

```bash
npx create-db@latest
```

Aliases:

```bash
npx create-pg@latest
npx create-postgres@latest
```

For app integrations, you can also use the programmatic API (`create()` / `regions()`) from the `create-db` npm package.

Temporary databases auto-delete after ~24 hours unless claimed.

### 3. Programmatic provisioning with Management API

Use API endpoints on:

```text
https://api.prisma.io/v1
```

Explore the schema and endpoints using:

- OpenAPI docs: `https://api.prisma.io/v1/doc`
- Swagger Editor: `https://api.prisma.io/v1/swagger-editor`

Auth options:

- Service token (workspace server-to-server)
- OAuth 2.0 (act on behalf of users)

### 4. Type-safe integration with Management API SDK

Install and use:

```bash
npm install @prisma/management-api-sdk
```

Use `createManagementApiClient` for existing tokens, or `createManagementApiSdk` for OAuth + token refresh.

## Rule Files

Detailed guidance lives in:

```
references/console-and-connections.md
references/create-db-cli.md
references/management-api.md
references/management-api-sdk.md
```

## How to Use

Start with `references/create-db-cli.md` for fast setup, then switch to `references/management-api.md` or `references/management-api-sdk.md` when you need programmatic provisioning.
