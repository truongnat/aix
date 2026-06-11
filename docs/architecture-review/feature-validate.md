# Feature: `validate` — Đánh giá

> Kiểm tra hợp đồng (contracts) của harness repo và của repo đích: tồn tại file, heading, cấu trúc template, frontmatter worker, schema config, naming command… qua một registry validator có trọng số.
> **Điểm trung bình: 3.0/5** — pattern registry rất hay, nhưng tầng "domain" bị ô nhiễm I/O nặng và interface bị nhân đôi.

## 1. Cấu trúc

```
validate/
├─ domain/
│  ├─ constants.ts      # danh sách file/heading bắt buộc
│  ├─ contracts.ts      # ~1000 dòng assert*  ⚠️ dùng fs + child_process
│  └─ utils.ts          # parse frontmatter, đọc file…  ⚠️ dùng fs
├─ application/
│  ├─ registry.ts       # mảng Validator có weight
│  ├─ runners.ts        # validateHarnessRepository/TargetProfile/TargetGoal
│  ├─ agent-system.ts / hooks-skills.ts / session-start.ts / daily-dev-report.ts
├─ infrastructure/
│  ├─ legacy-deps.ts / pack-root.ts / target.ts
└─ presentation/
   ├─ args.ts           # parse argv
   └─ main.ts           # entry, process.exit
```

## 2. Điểm mạnh ✅

1. **Pattern "validator registry có trọng số" rất tốt** — mỗi rule là `{ run(ctx), weight }`; `runValidators` gom `failures[]`; `countCheckedContracts` cộng weight để báo "đã kiểm N contract" (`registry.ts:81-90`, `runners.ts:20-25,63-66`). Dễ mở rộng, dễ đọc.
2. **Tách 3 chế độ rõ ràng** — `harness-repository`, `target-profile`, `target-goal`; `targetGoal` kế thừa `targetProfile` rồi cộng thêm (`registry.ts:251-310`). Cấu trúc kế thừa validator gọn.
3. **`presentation/main.ts` sạch** — parse args → chọn runner → in lỗi/biên nhận → `process.exit` (đúng chỗ cho entry CLI).
4. **Thông điệp lỗi giàu ngữ cảnh** — mỗi failure nêu rõ path + yêu cầu cụ thể, rất hữu ích cho người sửa.
5. **`assertCodexRuleContractStructure`** kiểm cú pháp execpolicy chặt chẽ (prefix_rule, pattern tokenized, decision hợp lệ…).

## 3. Khoảng trống ⚠️

| ID | Vấn đề | Vị trí | Mức |
|----|--------|--------|-----|
| VA-1 | **Tầng `domain` bị ô nhiễm I/O nặng** — `domain/contracts.ts` import `node:fs`, `node:child_process` (`spawnSync` chạy script!), require `legacy-deps`. Đây thực chất là application/infrastructure, **không phải domain thuần** | `contracts.ts:1-9,353-388` | 🔴 |
| VA-2 | **Interface bị nhân đôi y hệt** — `ValidationContext` và `Validator` định nghĩa lặp ở cả `registry.ts:69-79` lẫn `runners.ts:8-18` | hai file | 🟠 |
| VA-3 | **Coverage = 2/5** — không có test trực tiếp `test/features/validate/*`; logic kiểm hợp đồng phức tạp (~1000 dòng) chủ yếu được kiểm qua chạy CLI | `test/` | 🟠 |
| VA-4 | **`catch (error)` bỏ biến `error`** ở nhiều assert (vd. `must contain valid JSON`) — `@typescript-eslint/no-unused-vars` sẽ cảnh báo nếu lint TS được bật | `contracts.ts:381,476,622` | 🟡 |
| VA-5 | **Hằng số hard-code khổng lồ & trùng với feature khác** — đường dẫn hook `.ai-harness/hooks/core/*.js` lặp lại (cũng có ở `uninstall`), `ACTIVE_COMMAND_NAMING_PATHS`, danh sách heading… nằm rải rác | `contracts.ts:46-64,520-525` | 🟡 |
| VA-6 | **Phụ thuộc vòng `src → lib`** qua `legacy-deps` (workerRegistry, providerRuleRenderer, domainSkillGeneration, runtimeCommandCatalog) | `contracts.ts:4-9`, `runners.ts:44-45` | 🔴 |
| VA-7 | **`countCheckedContracts` chỉ cộng validator của harness-repository** — không phản ánh số contract của chế độ target | `runners.ts:63-66` | 🟢 |

## 4. Khuyến nghị

- **VA-1 (quan trọng):** đổi tên/di chuyển — `contracts.ts` và `utils.ts` (đụng `fs`) thuộc **application/infrastructure**, không phải `domain`. Giữ `domain/` chỉ chứa hằng số + hàm so khớp chuỗi thuần (vd. `hasSubstantiveSectionBody`, regex). Phần đọc file/spawn đẩy xuống infrastructure rồi inject vào validator.
- **VA-2:** đưa `ValidationContext`/`Validator` về **một** nơi (vd. `application/types.ts` hoặc `domain/`), hai file cùng import.
- **VA-3:** vì validator đã là hàm thuần nhận `ctx`, rất dễ test theo bảng: dựng thư mục tạm hợp lệ/khuyết để khẳng định `failures`. Đây là feature **đáng có test nhất** do độ phức tạp cao.
- **VA-5:** gom hằng số dùng chung (đường dẫn hook harness-owned) về `shared/`.
- **VA-6:** sau khi worker-registry/provider-renderer được migrate vào `src/shared`, bỏ `legacy-deps`.

## 5. Kết luận

Kiến trúc validator (registry + weight + context) **đáng học hỏi**. Vấn đề lớn nhất mang tính "ngữ nghĩa tầng": **gọi cả file là `domain` trong khi nó đầy I/O và spawn process**. Sửa nhãn/di chuyển + thêm test bảng + khử trùng lặp interface sẽ nâng feature này lên mức 4+.
