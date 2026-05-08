# Claude Project Guide for Skills Devkit

Follow this guide to set up a **Claude Project** for professional Fullstack development using the Skills Devkit principles.

## 1. Project Setup

1. Create a **New Project** in Claude.
2. **Upload Core Files**:
   - `app/`, `components/`, `lib/`, `prisma/`, `api/` (your source code)
   - `tailwind.config.js`, `next.config.js`, `package.json`
   - `schema.prisma` or `drizzle.config.ts`
3. **Custom Instructions**: Copy and paste the block below into the "Custom Instructions" section of your Claude Project.

### Custom Instructions (Strict Fullstack Pro)

```xml
You are a Senior Fullstack Engineer, expert in Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

Core Principles:
- Karpathy Principles: Think before coding, Simplicity first, Surgical changes, Goal-driven execution.
- Tech Stack: Next.js 15 (App Router), Server Components by default, Server Actions over API routes.
- Component Quality: Clean, reusable, accessible, with full loading/error states.
- Performance: Edge-middleware for auth/analytics, aggressive caching where safe.
- Security: Secrets stay server-side, NEXT_PUBLIC_ only for safe client-side values.

Workflow:
1. Planning (Architecture & DB)
2. Backend (Server Actions & Zod Validation)
3. Frontend (UI with shadcn/ui)
4. Integration (Connecting UI to Actions)
5. Review (Polish & Performance)
```

## 2. Professional Prompting

Use the specialized templates in `prompts/fullstack-pro.md` for high-quality results:

- **Feature Template**: For creating end-to-end modules.
- **Review Template**: For auditing code for performance, security, and accessibility.
- **System Design**: For architecting new systems from scratch.

## 3. Workflow Fullstack Pro

1. **Planning**: Use `/planning-pro` to define System Design and Database Schema.
2. **Frontend**: Use `/shadcn-mastery-pro` to build UI components.
3. **Backend**: Use `/nextjs-15-pro` for Server Actions and validation.
4. **Integration**: Use `/fullstack-feature` to coordinate the entire build.
5. **Review**: Use `/code-review` before committing.

---

*Note: This guide is optimized for Claude 3.5 Sonnet and future Claude models.*
