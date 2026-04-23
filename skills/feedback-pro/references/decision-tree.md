# Feedback — decision trees (support tier)

## Block merge vs follow-up ticket

```
Finding is exploitable in production or causes data loss/corruption?
├── Yes → Block merge (or hold release) until fixed or risk explicitly accepted by owner
└── No → May merge with follow-up if severity documented and ticket filed
```

## Severity calibration

```
Who is harmed and how fast?
├── End users / production data — bias toward High/Critical
├── Internal only / dev experience — often Medium/Low
└── Style only — Low; batch or defer
```

## When to request changes vs comment

```
Policy requires “request changes” for security issues?
├── Yes → Use request changes + clear must-fix list
└── No → Comment with severity; still block verbally if team norm requires
```

## Async vs synchronous discussion

```
Disagreement on architecture or product?
├── Yes → Short sync or RFC; avoid long comment threads without decision maker
└── No → Resolve in PR with concrete examples
```

**Timezone / distributed teams:** Prefer a **sticky PR summary** (merge gate + owner questions) so async readers see state without reading full thread — **`review-feedback-system-model.md`**.

## When NOT to give deep feedback

- **Auto-generated** or **vendor** code you cannot maintain — flag upstream or wrap; do not nitpick generated lines.
