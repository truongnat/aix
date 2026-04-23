# Supply chain and provenance hooks

Packaging touches **supply chain**: what gets built and **who** attests it.

## Python / PyPI

- **Trusted publishing** — OIDC from GitHub → PyPI; no stored API token — **`security-pro`** for trust policy.
- **Sigstore / attestations** — Follow PyPI/GitHub docs for your pipeline generation.

## Containers

- **SBOM** generation (Syft, etc.) as CI artifact — gate known vulns — **`security-pro`**.
- **Sign images** (Cosign) before prod promotion — **`deployment-pro`** may enforce verification.

## npm

- **`npm audit`** in CI; **provenance** statements when publishing — enable per org policy.

## Boundary

Cryptographic detail and threat models live in **`security-pro`** — this skill wires **where** hooks sit in **build/publish** jobs.
