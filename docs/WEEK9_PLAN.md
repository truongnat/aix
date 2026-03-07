# Week 9: Skill Governance Enhancement (Gap #6)

**Date:** 2026-03-07  
**Priority:** 🟠 High  
**Status:** In Progress (50% → 100%)

---

## 📋 Overview

**Gap #6:** Skill Import Governance

**Problem:**
- Import từ arbitrary GitHub URL → supply chain risk
- Lock file chỉ pin commit, không có cryptographic verification
- Không có signature validation

**Current Status:**
- ✅ Skill sandboxing implemented (via Gap #2)
- ✅ TrustTier system implemented
- ✅ Resource limits enforced
- ❌ No cryptographic verification
- ❌ No signature validation
- ❌ No trusted skill registry

**Goal:** Add cryptographic verification and signature validation for imported skills

---

## 🎯 Objectives

### 1. Cryptographic Verification System
- [ ] Implement skill signature generation
- [ ] Implement skill signature verification
- [ ] Add public key management
- [ ] Add signature storage in lock file

### 2. Trusted Skill Registry
- [ ] Define trusted skill sources
- [ ] Implement registry configuration
- [ ] Add registry validation

### 3. Audit Logging
- [ ] Log skill imports
- [ ] Log signature verifications
- [ ] Log trust decisions

---

## 🏗️ Architecture

### Components

```
src/engine/skill_governance/
├── mod.rs              # Module exports
├── types.rs            # Core types (Signature, PublicKey, etc.)
├── crypto.rs           # Cryptographic operations
├── registry.rs         # Trusted skill registry
├── verifier.rs         # Signature verification
└── audit.rs            # Audit logging
```

### Data Flow

```
1. Import Skill
   ↓
2. Check Registry (trusted source?)
   ↓
3. Verify Signature (if available)
   ↓
4. Check TrustTier
   ↓
5. Execute in Sandbox
   ↓
6. Audit Log
```

---

## 📝 Implementation Plan

### Phase 1: Core Crypto (2 hours)

**Files to create:**
- `src/engine/skill_governance/mod.rs`
- `src/engine/skill_governance/types.rs`
- `src/engine/skill_governance/crypto.rs`

**Features:**
- Ed25519 signature generation
- Ed25519 signature verification
- Public key management
- Key pair generation

**Dependencies:**
- `ed25519-dalek` - Ed25519 signatures
- `sha2` - SHA-256 hashing
- `base64` - Encoding

---

### Phase 2: Registry & Verification (2 hours)

**Files to create:**
- `src/engine/skill_governance/registry.rs`
- `src/engine/skill_governance/verifier.rs`

**Features:**
- Trusted source configuration
- Registry validation
- Signature verification workflow
- Trust decision logic

**Configuration:**
```toml
[skill_governance]
trusted_sources = [
    "github.com/your-org/*",
    "github.com/trusted-user/skills"
]
require_signatures = true
allow_unsigned_local = true
```

---

### Phase 3: Audit Logging (1 hour)

**Files to create:**
- `src/engine/skill_governance/audit.rs`

**Features:**
- Import event logging
- Verification event logging
- Trust decision logging
- Audit trail storage

**Log Format:**
```json
{
  "timestamp": "2026-03-07T10:00:00Z",
  "event": "skill_import",
  "skill_id": "github.com/user/repo/skill.md",
  "source": "github.com/user/repo",
  "signature_valid": true,
  "trust_tier": "Constrained",
  "decision": "allowed"
}
```

---

### Phase 4: Integration (1 hour)

**Files to modify:**
- `src/skill/loader.rs` - Add verification before loading
- `src/engine/mod.rs` - Export skill_governance module
- `Cargo.toml` - Add crypto dependencies

**Integration Points:**
1. Skill import → verify signature
2. Skill load → check registry
3. Skill execute → audit log

---

### Phase 5: Testing (2 hours)

**Tests to add:**
- Signature generation/verification
- Registry validation
- Audit logging
- Integration tests

**Test Coverage:**
- Valid signatures pass
- Invalid signatures fail
- Trusted sources allowed
- Untrusted sources require signatures
- Audit logs created

---

## 🔐 Security Considerations

### Signature Format

```
Skill Signature v1
---
skill_id: github.com/user/repo/skill.md
content_hash: sha256:abc123...
timestamp: 2026-03-07T10:00:00Z
signer: user@example.com
---
signature: base64(ed25519_sign(content))
```

### Trust Model

1. **Trusted Sources** - No signature required
   - Local skills (`.agents/skills/`)
   - Configured trusted repos

2. **Signed Skills** - Signature required
   - External GitHub repos
   - Community skills

3. **Untrusted Skills** - Sandbox + signature required
   - Unknown sources
   - No signature → reject or warn

### Key Management

- Public keys stored in `.agents/trusted_keys/`
- Private keys NOT stored in repo
- Key rotation supported
- Multiple signers supported

---

## 📊 Success Metrics

### Functionality
- [ ] Signatures can be generated
- [ ] Signatures can be verified
- [ ] Invalid signatures rejected
- [ ] Trusted sources bypass signature check
- [ ] Audit logs created

### Security
- [ ] Supply chain attacks prevented
- [ ] Tampered skills detected
- [ ] Audit trail complete

### Performance
- [ ] Verification < 10ms per skill
- [ ] No impact on execution time

---

## 🚀 Deliverables

### Code
- 6 new files (~1,000 lines)
- 15+ tests
- Integration with skill loader

### Documentation
- Signature generation guide
- Key management guide
- Registry configuration guide
- Security best practices

### Examples
- Generate skill signature
- Verify skill signature
- Configure trusted registry
- Audit log analysis

---

## 📅 Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Core Crypto | 2h | Signature generation/verification |
| 2. Registry | 2h | Trusted source validation |
| 3. Audit | 1h | Audit logging |
| 4. Integration | 1h | Skill loader integration |
| 5. Testing | 2h | 15+ tests |
| **Total** | **8h** | **Complete Gap #6** |

---

## 🎯 Acceptance Criteria

### Must Have
- ✅ Ed25519 signature generation works
- ✅ Signature verification works
- ✅ Invalid signatures rejected
- ✅ Trusted registry configuration
- ✅ Audit logging implemented
- ✅ Integration with skill loader
- ✅ 15+ tests passing

### Nice to Have
- ⏳ Multiple signature algorithms
- ⏳ Key rotation automation
- ⏳ Signature expiration
- ⏳ Revocation list

---

## 🔄 Dependencies

### Cargo Dependencies
```toml
[dependencies]
ed25519-dalek = "2.1"
sha2 = "0.10"
base64 = "0.22"
```

### Existing Code
- `src/skill/loader.rs` - Skill loading
- `src/engine/sandbox/` - Sandboxing
- `src/skill/capability.rs` - TrustTier

---

## 📚 References

- [Ed25519 Signatures](https://ed25519.cr.yp.to/)
- [Supply Chain Security](https://slsa.dev/)
- [Sigstore](https://www.sigstore.dev/)

---

**Version:** 1.0  
**Date:** 2026-03-07  
**Status:** Planning Complete → Ready for Implementation

