# Agent Cards and Discovery

## Agent Card structure

```json
{
  "name": "research-agent",
  "version": "1.0.0",
  "endpoint": "https://agents.example.com/research",
  "capabilities": {
    "tools": ["search_web", "read_pdf", "extract_tables"],
    "resources": ["paper://{id}"],
    "prompts": ["summarize_paper"]
  },
  "auth": {
    "type": "oauth2",
    "scopes": ["tools:read", "resources:read"]
  },
  "limitations": {
    "max_file_size_mb": 10,
    "supported_languages": ["en", "es"]
  }
}
```

## Discovery mechanisms

1. **Static registry**: JSON file or API listing all Agent Cards.
2. **DNS-SD**: Service discovery via DNS records.
3. **Decentralized gossip**: Agents announce themselves to peers.
4. **K8s service discovery**: Agent Cards stored as ConfigMaps or CRDs.

## Versioning

- Semantic versioning for agent releases.
- Agent Cards must be updated when capabilities change.
- Backward compatibility: old clients should not break on new minor versions.
