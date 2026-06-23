## Command Naming

Canonical command IDs use hyphen form.

Correct:

- harness-plan
- harness-run
- harness-verify
- harness-ship

Native slash invocation is provider-specific. Do not assume every provider exposes `/harness-*`.

Incorrect:

- harness:plan
- /harness:plan
- harness_plan
