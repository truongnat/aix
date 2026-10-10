# Debugging incident evidence matrix

| Phase | Required evidence |
|---|---|
| Detect | Symptom, first observed time, scope, affected user/request, alert/source |
| Reproduce | Minimal input, environment, version, deterministic reproduction rate |
| Localize | Hypothesis, instrument/log/trace evidence, ruled-out causes |
| Mitigate | Safe change, blast radius, rollback trigger, owner |
| Verify | Regression test, before/after metric, adjacent failure cases |
| Learn | Root cause, contributing factors, missing guard, follow-up owner/date |

Prefer a falsifiable hypothesis over a list of guesses. Preserve timestamps and correlation IDs; do not paste secrets or raw personal data into incident notes.
