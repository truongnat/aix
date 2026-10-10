---
name: repro-steps-verifier
description: Kiểm tra lại các bước tái hiện bug (reproduction steps) đã viết xem có đủ rõ ràng, đủ chi tiết để dev làm theo không, và chỉ ra chỗ mơ hồ/gộp bước. Dùng khi user đã viết steps nhưng muốn chắc chắn dev sẽ không hiểu nhầm hoặc không tái hiện được.
---

# Repro Steps Verifier

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file review repro steps, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/repro-steps-verifier/HHmmss-short-bug-title/
```

Mỗi artifact phải ghi `Session timestamp`, steps gốc, nhận xét từng bước, và steps đề xuất viết lại. Mọi output chính trong chat cũng phải hiển thị `Session timestamp`.

## Mục tiêu
Rà soát một đoạn steps đã viết (không phải viết từ đầu như bug-report-writer) để tìm điểm mơ hồ khiến dev có thể tái hiện sai hoặc không tái hiện được.

## Checklist rà soát

Với mỗi bước trong steps, kiểm tra:

1. **Có gộp nhiều hành động vào 1 bước không?** (VD: "Đăng nhập và vào trang cài đặt" nên tách thành 2 bước riêng)
2. **Có thiếu điều kiện tiền đề không?** (VD: bước 3 giả định user đã ở trạng thái nào đó nhưng không nói rõ từ bước trước)
3. **Có dùng từ mơ hồ không?** (VD: "chọn 1 sản phẩm bất kỳ" — sản phẩm nào, có ảnh hưởng tới việc tái hiện không? Nếu bug chỉ xảy ra với sản phẩm cụ thể, phải nêu rõ)
4. **Có thiếu dữ liệu cụ thể không?** (VD: "nhập số lượng lớn" — lớn là bao nhiêu, cần con số cụ thể)
5. **Thứ tự các bước có logic không?** (bước sau có phụ thuộc bước trước đúng thứ tự thực tế không)
6. **Kết quả mong đợi/thực tế có đính kèm rõ ở bước nào gây ra không?** (không chỉ ghi ở cuối chung chung mà không rõ xảy ra ở bước nào)
7. **Thông tin handoff cho dev đã đủ chưa?** Environment/build, account/role, test data, expected/actual, evidence, tần suất tái hiện

## Quy trình

### Bước 1 — Đọc steps hiện có, đánh số lại nếu chưa được đánh số rõ

### Bước 2 — Với mỗi bước, áp checklist ở trên, đánh dấu:
- OK — đủ rõ, dev có thể làm theo chính xác
- CẦN LÀM RÕ — nêu chính xác chỗ nào mơ hồ và tại sao dev có thể hiểu sai

### Bước 3 — Xuất kết quả

```
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]

Bước 1: [nội dung gốc] → OK / CẦN LÀM RÕ: [lý do + đề xuất viết lại]
Bước 2: ...
...

Thông tin handoff còn thiếu:
- [environment/build/account/test data/evidence/frequency nếu thiếu]

Steps đề xuất viết lại (nếu có bước cần chỉnh):
1. ...
2. ...
```

## Lưu ý
Không viết lại toàn bộ steps nếu phần lớn đã ổn — chỉ đề xuất chỉnh sửa cho đúng những bước bị đánh dấu CẦN LÀM RÕ, để user dễ so sánh trước/sau.
