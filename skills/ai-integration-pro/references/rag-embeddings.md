# AI Integration — RAG and embeddings

For **ingestion, ACL, staleness, re-indexing**, and chunk lifecycle see **`rag-ingestion-and-freshness.md`**.

## RAG pipeline overview

```
Documents → Chunk → Embed → Store (vector DB)
                                    ↓
User query → Embed → Similarity search → Top-K chunks
                                              ↓
[System prompt] + [Retrieved chunks] + [User query] → LLM → Answer
```

## Document chunking strategies

```ts
function chunkText(text: string, maxTokens = 512, overlap = 64): string[] {
  // Simple paragraph-based chunking
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + para).length > maxTokens * 4) { // rough token estimate
      if (current) chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? '\n\n' : '') + para;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}
```

## OpenAI embeddings

```ts
import OpenAI from 'openai';

const client = new OpenAI();

async function embed(texts: string[]): Promise<number[][]> {
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',  // 1536 dims, cheap
    input: texts,
  });
  return response.data.map(d => d.embedding);
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (normA * normB);
}
```

## pgvector (Postgres) storage

```sql
CREATE EXTENSION vector;

CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Query top-5 similar
SELECT content, metadata,
       1 - (embedding <=> $1::vector) AS similarity
FROM documents
ORDER BY embedding <=> $1::vector
LIMIT 5;
```

## RAG prompt construction

```ts
async function ragQuery(userQuery: string): Promise<string> {
  // 1. Embed query
  const queryEmbedding = (await embed([userQuery]))[0];

  // 2. Retrieve relevant chunks
  const chunks = await db.query(
    `SELECT content FROM documents ORDER BY embedding <=> $1::vector LIMIT 5`,
    [JSON.stringify(queryEmbedding)]
  );

  // 3. Build augmented prompt
  const context = chunks.rows.map((r, i) => `[${i + 1}] ${r.content}`).join('\n\n');

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: `You are a helpful assistant. Answer based on the provided context only.
If the context doesn't contain enough information, say so.

Context:
${context}`,
    messages: [{ role: 'user', content: userQuery }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
```

## Embedding model comparison

| Model | Dims | Cost | Quality |
|-------|------|------|---------|
| `text-embedding-3-small` | 1536 | Low | Good |
| `text-embedding-3-large` | 3072 | Medium | Best OpenAI |
| `voyage-3` | 1024 | Low | Best for Claude |
| `all-MiniLM-L6-v2` | 384 | Free (local) | Decent |
