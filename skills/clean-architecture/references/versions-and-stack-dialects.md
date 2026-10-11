# Versions and stack dialects

Clean Architecture is **concept-stable**; **syntax** differs by ecosystem.

## Packaging

- **Java / Kotlin** — packages + ArchUnit for dependency tests.
- **TypeScript / Node** — path aliases, `eslint-plugin-boundaries`, barrel files (use sparingly — can hide cycles).
- **C#** — assemblies + `InternalsVisibleTo` vs public surface.
- **Go** — package boundaries; avoid `internal` misuse across module boundaries.

## Frameworks

- **NestJS** — modules map to deployable boundaries; keep domain in plain TS classes — **`nestjs-pro`** wires DI.
- **Spring** — domain jar vs infrastructure; avoid `@Entity` in domain if pursuing strict separation.

## Review focus

Pin **language version** only when it affects module visibility (e.g. `package` visibility in Kotlin).

When uncertain, cite **dependency rule** over **folder template** from a blog.
