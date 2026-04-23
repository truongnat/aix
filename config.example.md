# ⚙️ Cấu hình (ví dụ)

Sao chép file này thành `config.md` và điều chỉnh giá trị.
Thêm `config.md` vào `.gitignore` nếu chứa thông tin nhạy cảm.

---

## Knowledge base (dùng cho `node dist/tools.js build-kb` và `query-kb`)

Tools CLI chỉ đọc **khối machine-readable** bên dưới (giữ nguyên hai dòng marker).
Xem thêm: `scripts/README.md`

```markdown
<!-- kb-config-start -->
documents_path = knowledge-base/documents
embedding_model = sentence-transformers/all-MiniLM-L6-v2
embeddings_path = knowledge-base/embeddings/rag_embeddings.npy
manifest_path = knowledge-base/embeddings/rag_manifest.json
chunk_size = 1000
chunk_overlap = 200
skill_index_path = knowledge-base/embeddings/skill_index.json
skill_embeddings_path = knowledge-base/embeddings/skill_embeddings.npy
<!-- kb-config-end -->
```

---

## Ghi chú

* `documents_path`: thư mục gốc chứa file `.md` để index
* `embedding_model`: tên model từ Hugging Face / sentence-transformers
* `embeddings_path` / `manifest_path`: file sinh ra sau khi build (không commit)
* `chunk_size` / `chunk_overlap`: tham số chia nhỏ tài liệu

---

## Project (tham khảo — không bắt buộc cho script)

| Trường    | Ví dụ      |
| --------- | ---------- |
| Repo name | own-skills |
| Version   | 1.0.0      |

---

