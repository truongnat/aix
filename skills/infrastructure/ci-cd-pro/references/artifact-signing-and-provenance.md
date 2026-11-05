# Artifact signing and provenance (supply chain)

CI produces **binaries images** consumed by humans and clusters — treat as **release artifacts**.

## Digest-addressed deploys

- Push `**image@sha256:…`** to deploy — not floating `**latest**` in Kubernetes — `**docker-pro**`.
- CI outputs **immutable reference** as job output for CD.

## Signing (concepts)

- **Cosign** / **Notation** attach signatures to images; verify in admission controller.
- **SBOM** generation in pipeline — link to `**security-pro`** policy for license/known-vuln gates.

## Provenance (SLSA-oriented)

- **Build** identifies **builder id**, **source repo + commit**, **entry workflow**.
- GitHub **artifact attestations** / OIDC-bound provenance — follow vendor docs for your stack.

## Anti-pattern

- Unsigned artifacts from anonymous build — anyone with push can replace binary without traceability.