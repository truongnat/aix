# AI Integration — Tool use / function calling

## Anthropic tool use (TypeScript)

```ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: 'get_weather',
    description: 'Get current weather for a city. Use this when the user asks about weather conditions.',
    input_schema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City name, e.g. "London"' },
        unit: { type: 'string', enum: ['celsius', 'fahrenheit'], default: 'celsius' },
      },
      required: ['city'],
    },
  },
];

async function runWithTools(userMessage: string) {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage },
  ];

  while (true) {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      tools,
      messages,
    });

    // Add assistant response to history
    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'end_turn') {
      // Extract text response
      return response.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('');
    }

    if (response.stop_reason === 'tool_use') {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;

        // Validate and execute tool
        let result: string;
        try {
          result = await executeTool(block.name, block.input);
        } catch (err) {
          result = `Error: ${(err as Error).message}`;
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });
      }

      messages.push({ role: 'user', content: toolResults });
    }
  }
}

async function executeTool(name: string, input: unknown): Promise<string> {
  // Always validate input before execution
  if (name === 'get_weather') {
    const { city, unit = 'celsius' } = input as { city: string; unit?: string };
    // Call real weather API
    return JSON.stringify({ city, temp: 22, unit });
  }
  throw new Error(`Unknown tool: ${name}`);
}
```

## OpenAI function calling

```ts
import OpenAI from 'openai';

const client = new OpenAI();

const tools: OpenAI.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get current weather for a city',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string' },
        },
        required: ['city'],
      },
    },
  },
];

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Weather in Paris?' }],
  tools,
  tool_choice: 'auto',
});

// Handle tool calls
for (const choice of response.choices) {
  if (choice.finish_reason === 'tool_calls') {
    for (const toolCall of choice.message.tool_calls ?? []) {
      const args = JSON.parse(toolCall.function.arguments);
      const result = await executeTool(toolCall.function.name, args);
      // Add to messages and continue...
    }
  }
}
```
