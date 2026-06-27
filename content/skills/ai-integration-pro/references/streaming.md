# AI Integration — Streaming responses

## Anthropic streaming (TypeScript)

```ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Express SSE endpoint
app.get('/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: req.query.message as string }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: (err as Error).message })}\n\n`);
    res.end();
  }
});
```

## Streaming with tool use (buffer tools, stream text)

```ts
const stream = client.messages.stream({ model, max_tokens, tools, messages });

let toolUseBlocks: Anthropic.ToolUseBlock[] = [];

for await (const event of stream) {
  switch (event.type) {
    case 'content_block_start':
      if (event.content_block.type === 'tool_use') {
        toolUseBlocks.push({ ...event.content_block, input: '' });
      }
      break;

    case 'content_block_delta':
      if (event.delta.type === 'text_delta') {
        // Stream text to client immediately
        sendToClient(event.delta.text);
      }
      if (event.delta.type === 'input_json_delta') {
        // Buffer tool input — never partial-execute
        const last = toolUseBlocks.at(-1);
        if (last) last.input += event.delta.partial_json;
      }
      break;

    case 'message_stop':
      // Parse and execute buffered tool inputs
      for (const tool of toolUseBlocks) {
        tool.input = JSON.parse(tool.input as string);
      }
      break;
  }
}
```

## OpenAI streaming

```ts
const stream = await client.chat.completions.create({
  model: 'gpt-4o',
  messages,
  stream: true,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content;
  if (delta) process.stdout.write(delta);
}
```

## Frontend SSE consumption

```ts
const source = new EventSource('/chat?message=' + encodeURIComponent(msg));

source.onmessage = (e) => {
  if (e.data === '[DONE]') { source.close(); return; }
  const { text, error } = JSON.parse(e.data);
  if (error) { showError(error); source.close(); return; }
  appendToChat(text);
};

source.onerror = () => source.close();
```
