# Project Review — ai-engineering-harness

> Ngày review: 2026-06-07 · Phiên bản: v1.0.1 · Branch: `main`
> Phạm vi: kiến trúc, code (`lib/`, `aih.sh`, hooks), eval/insights/policy subsystems, CI/CD, docs, security, đa nền tảng.
> Trạng thái hiện tại được xác nhận bằng `npm test`, `npm run test:coverage`, `npm run validate`, và `git diff --check`.

## 1. Tóm tắt điều hành

`ai-engineering-harness` hiện ở trạng thái tốt hơn nhiều so với bản review ban đầu. Các gap “đỏ” đã được dọn:

- CI đã trỏ về `node bin/validate.js`.
- Coverage gate đang pass.
- Policy engine đã được provision và wire vào guard hook khi `.harness/policies.json` tồn tại.
- Eval reports tách bạch synthetic mặc định và live-provider-command opt-in.

Phần còn lại chủ yếu là dọn archive docs nếu muốn tiếp tục GC.

## 2. Trạng thái xác nhận

| Hạng mục | Trạng thái |
| --- | --- |
| Build / Typecheck | ✅ Pass |
| Test suite | ✅ Pass (`208` pass, `2` skipped) |
| Coverage gate | ✅ Pass (`74.13%` stmts, `70.1%` funcs) |
| CI workflow | ✅ Trỏ về `node bin/validate.js` |
| Eval A/B | ✅ Synthetic mặc định, live provider command opt-in |
| Policy engine | ✅ Wired qua guard hook + `.harness/policies.json` |
| Runtime dependency | ✅ Chỉ 1 (`@clack/prompts`) |
| Đa nền tảng | ⚠️ Windows vẫn phụ thuộc Git Bash/WSL |

## 3. Điểm đã hoàn tất

- Root shim removal đã hoàn tất: `validate.js`, `install.js`, `install-cache.js`, `install-runtime.js` đã bị xóa khỏi root.
- `.harness/policies.json` được provision trong init/install path.
- `guard-phase.js` có đường policy-engine runtime.
- `aih eval run` hỗ trợ:
  - deterministic synthetic baseline
  - live provider command qua `--live-provider-command "<cmd>"` hoặc `EVAL_PROVIDER_COMMAND`
- README và `docs/evals.md` đã ghi rõ evidence kind:
  - `synthetic-fixture`
  - `live-provider-command`

## 4. Còn lại

### P3 / Docs & hygiene

- archive docs vẫn còn nhiều file lịch sử, nhưng không chặn runtime hiện tại

## 5. Bằng chứng

- `npm test` → pass
- `npm run test:coverage` → pass
- `npm run validate` → `Harness validation passed. Checked 450 required files/contracts.`
- `git diff --check` → sạch
- `node --test test/cli-tests.js test/evals/ab-runner.test.js` → pass, gồm live provider command path

## 6. Nhận định

Nếu mục tiêu là “không còn gap runtime lớn”, thì trạng thái hiện tại đã gần xong. Nếu mục tiêu là “nâng sản phẩm lên moat mạnh hơn”, thì phần còn lại chủ yếu là archive/history cleanup và ops, không còn là CI/hook plumbing hay ingest backend cơ bản.
