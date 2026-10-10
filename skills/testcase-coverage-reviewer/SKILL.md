---
name: testcase-coverage-reviewer
description: Rà soát bộ test case đã viết sẵn (của user hoặc đồng nghiệp) để tìm case bị bỏ sót, dựa trên cùng bộ tiêu chí với testcase-generator. Dùng khi user đã có bộ test case cũ và muốn kiểm tra độ phủ trước khi test, hoặc trước khi release.
---

# Testcase Coverage Reviewer

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file review, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/testcase-coverage-reviewer/HHmmss-feature-slug/
```

Mỗi artifact phải ghi `Session timestamp`, nguồn bộ test case, ma trận coverage, và danh sách case đề xuất bổ sung. Mọi output chính trong chat cũng phải hiển thị `Session timestamp`.

## Mục tiêu
Nhận một bộ test case đã có (paste vào chat, hoặc file đính kèm), đối chiếu với ma trận tiêu chí chuẩn, và chỉ ra CHÍNH XÁC những case còn thiếu — không viết lại toàn bộ, không đánh giá chung chung "khá đầy đủ" hay "cần bổ sung thêm".

## Script hỗ trợ
Nếu bộ test case đầu vào ở dạng file, ưu tiên chạy `read_excel.py --report` trước với `.csv` hoặc `.xlsx` để xác định sheet, header và sample rows trước khi review coverage.

## Quy trình

### Bước 1 — Đọc bộ test case hiện có
Nếu file đầu vào là `.csv` hoặc `.xlsx`, không đọc mù toàn bộ file trước. Chạy `read_excel.py --report`, xác định sheet phù hợp rồi mới dùng nội dung đó để map coverage.

Xác định: feature đang test là gì, các case hiện có đang cover nhóm nào (dựa theo 4 nhóm chuẩn bên dưới).

### Bước 2 — Đối chiếu với ma trận tiêu chí chuẩn (giống testcase-generator)

- **Nhóm A — Input-based**: Equivalence Partitioning, Boundary Value, Format/Type validation
- **Nhóm B — Business logic**: Decision Table (tổ hợp điều kiện), State Transition
- **Nhóm C — System-level**: Permission/Role, Concurrency, Data persistence, Negative/Error handling, Cross-browser/device
- **Nhóm D — Priority**: mỗi case hiện có đã gắn đúng priority chưa, có case P0 nào đang bị đánh nhầm P2 không

Với mỗi nhóm, liệt kê: nhóm này có áp dụng cho feature không, đã có case nào thuộc nhóm này chưa, nếu có thì case nào, nếu thiếu thì thiếu cụ thể ở điểm gì. Không tính thiếu cho nhóm không áp dụng.

### Bước 3 — Xuất kết quả theo bảng

| Nhóm | Áp dụng? | Đã cover (case ID hiện có) | Thiếu | Đề xuất bổ sung |
|---|---|---|---|---|
| A - Input | Có | TC_001, TC_002 | Chưa test boundary min/max | TC mới: nhập giá trị = 0 và giá trị vượt max |
| B - Business logic | Có/Không | ... | ... | ... |
| C - System-level | Có/Không | (trống) | Toàn bộ nhóm áp dụng này chưa có case nào | Đề xuất 3-5 case cho permission và concurrency |
| D - Priority | Có | ... | Case TC_005 đang P2 nhưng thực chất là luồng chính, nên P0 | ... |

### Bước 4 — Tóm tắt
Kết luận ngắn theo công thức rõ ràng:
- `Coverage score = số checklist áp dụng đã cover / tổng số checklist áp dụng`
- Không dùng phần trăm nếu không xác định được tổng checklist áp dụng.
- Nêu nhóm yếu nhất và 3 bổ sung ưu tiên cao nhất nếu thời gian có hạn.

## Lưu ý
Không đề xuất case trùng lặp với case đã có. Nếu case đã có nhưng viết chưa rõ (step gộp, thiếu expected result), ghi chú riêng ở cột "Đề xuất bổ sung" là "cần viết rõ lại", không tính là thiếu case.
