# 🧠 Aruvi Agent SDK - Examples

Complete, runnable examples demonstrating all features of the Aruvi Agent Framework.

## Quick Start

### 1. Setup

```bash
# Build the SDK
npm run build

# Install dependencies
npm install
```

### 2. Run Examples

With Bun:
```bash
bun examples/1-basic-chat.ts
```

With Node.js:
```bash
npm run build
node dist/examples/your-example.js
```

With ts-node:
```bash
npx ts-node examples/1-basic-chat.ts
```

**Note:** The package name is `aruvi-agent-sdk`, installed locally. For this to work:
- Make sure to run `npm run build` first
- Examples import from `'aruvi-agent-sdk'` (the package name)
- The built dist/ folder must exist

For more info on local setup, see [LOCAL-SETUP.md](../LOCAL-SETUP.md)

---

## Examples Overview

### 1️⃣ Basic Chat (`1-basic-chat.ts`)

Learn how to use different providers for simple chat interactions.

**Topics covered:**
- OpenAI Provider
- Claude Provider  
- Ollama Provider
- Basic message formatting

**Run:**
```bash
bun examples/1-basic-chat.ts
```

**Key concepts:**
```typescript
import { OpenAIProvider } from "aruvi";
import type { Message } from "aruvi";

const provider = new OpenAIProvider(apiKey, model);
const response = await provider.chat([
  { role: "user", content: "Your question" }
]);
```

---

### 2️⃣ Streaming (`2-streaming.ts`)

Real-time streaming responses from all providers.

**Topics covered:**
- Streaming from OpenAI
- Streaming from Claude
- Streaming from Ollama
- Collecting streamed responses
- Adding progress indicators

**Run:**
```bash
bun examples/2-streaming.ts
```

**Key concepts:**
```typescript
import { OpenAIProvider } from "aruvi";

for await (const chunk of provider.stream(messages)) {
  process.stdout.write(chunk);
}
```

---

### 3️⃣ Tools & Agents (`3-tools.ts`)

Create intelligent agents with custom tools.

**Topics covered:**
- Creating custom tools
- Registering tools with agents
- Tool execution
- Multi-tool agents

**Tools in example:**
- Calculator (arithmetic operations)
- Weather (get current weather)
- Timestamp (get current time)

**Run:**
```bash
bun examples/3-tools.ts
```

import { Agent, OpenAIProvider } from "aruvi";
import type { Tool } from "aruvi";

**Key concepts:**
```typescript
const tool: Tool = {
  name: "calculator",
  description: "Performs arithmetic",
  async execute(args: any) {
    // Tool implementation
  }
};

const agent = new Agent(provider, config);
agent.registerTool(tool);
const result = await agent.run("Do something");
```

---

### 4️⃣ Multi-Agent Server (`4-multi-agent-server.ts`)

Deploy multiple agents in a production HTTP server.

**Topics covered:**
- Creating multi-agent runtime
- HTTP server with Hono
- Multiple agent endpoints
- Streaming over HTTP

**Agents in example:**
- GPT (OpenAI)
- Claude (Anthropic)
- Local (Ollama)

**Run:**
```bash
bun examples/4-multi-agent-server.ts
```

**Usage:**
```bash
# Chat endpoint
curl -X POST http://localhost:3000/chat/gpt \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'

# Streaming endpoint
curl -X POST http://localhost:3000/stream/claude \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Write a poem"}]}'
```

---

### 5️⃣ Advanced Patterns (`5-advanced-patterns.ts`)

Production-ready patterns for complex scenarios.

**Topics covered:**
- Provider fallback (graceful degradation)
- Load balancing across providers
- Multi-turn conversations (context management)
- Parallel requests
- Streaming with progress tracking

**Run:**
```bash
bun examples/5-advanced-patterns.ts
```

**Key patterns:**

**Fallback:**
```typescript
try {
  return await primaryProvider.chat(messages);
} catch {
  return await fallbackProvider.chat(messages);
}
```

**Load Balancing:**
```typescript
const provider = providers[Math.random() * providers.length];
```

**Multi-Turn:**
```typescript
messages.push({ role: "user", content: "Turn 1" });
let response = await provider.chat(messages);
messages.push({ role: "assistant", content: response });

messages.push({ role: "user", content: "Turn 2" });
response = await provider.chat(messages);
```

---

## Environment Setup

Create `.env` file with API keys:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# OpenRouter
OPENROUTER_API_KEY=sk-or-...

# Azure
AZURE_API_KEY=...
AZURE_ENDPOINT=https://...

# Xiaomi Mimo
MIMO_API_KEY=...

# Port for server
PORT=3000
```

## Prerequisites

### For OpenAI
```bash
# Get key from https://platform.openai.com/api-keys
```

### For Claude
```bash
# Get key from https://console.anthropic.com
```

### For Ollama (Local)
```bash
# Install Ollama from https://ollama.ai
ollama pull llama3
ollama serve
```

### For OpenRouter
```bash
# Get key from https://openrouter.ai
```

### For Azure
```bash
# Setup Azure OpenAI from Azure portal
```

---

## Running Different Ways

### Node.js
```bash
npm run build
node dist/examples/1-basic-chat.js
```

### Bun (Recommended)
```bash
bun examples/1-basic-chat.ts
```

### TypeScript
```bash
npx ts-node examples/1-basic-chat.ts
```

### Deno (with TypeScript support)
```bash
deno run --allow-net examples/1-basic-chat.ts
```

---

## Common Tasks

### Chat with different providers
See `1-basic-chat.ts`

### Stream responses in real-time
See `2-streaming.ts`

### Use tools with agents
See `3-tools.ts`

### Deploy multi-agent service
See `4-multi-agent-server.ts`

### Implement fallback/load-balancing
See `5-advanced-patterns.ts`

---

## Best Practices

✅ **Use streaming for long responses**
```typescript
for await (const chunk of provider.stream(messages)) {
  process.stdout.write(chunk);
}
```

✅ **Implement error handling**
```typescript
try {
  const response = await provider.chat(messages);
} catch (error) {
  console.error("API Error:", error);
}
```

✅ **Use environment variables for secrets**
```typescript
const apiKey = process.env.OPENAI_API_KEY!;
```

✅ **Set reasonable tool iteration limits**
```typescript
const agent = new Agent(provider, {
  systemPrompt: "...",
  maxToolIterations: 5  // Prevent infinite loops
});
```

✅ **Validate tool arguments**
```typescript
async execute(args: any) {
  if (!args.city) return "City is required";
  // ...
}
```

✅ **Use fallback providers**
```typescript
try {
  return await primaryProvider.chat(messages);
} catch {
  return await fallbackProvider.chat(messages);
}
```

✅ **Parallelize independent requests**
```typescript
const results = await Promise.all([
  provider1.chat(messages),
  provider2.chat(messages),
  provider3.chat(messages)
]);
```

---

## Troubleshooting

### "API Key not found"
Make sure your `.env` file has the required keys:
```bash
echo "OPENAI_API_KEY=your-key" >> .env
```

### "Module not found"
Install dependencies:
```bash
npm install
```

### "Connection refused"
For Ollama examples, make sure Ollama is running:
```bash
ollama serve
```

### "Port 3000 in use"
Use a different port:
```bash
PORT=3001 bun examples/4-multi-agent-server.ts
```

### Rate limiting
API providers have rate limits. Use delays or fallbacks:
```typescript
await new Promise(resolve => setTimeout(resolve, 1000));
```

---

## Creating Custom Examples

Create a new file in `examples/` directory:

```typescript
import { OpenAIProvider } from "../src/providers/openai.provider";
import { Message } from "../src/core/types";

async function myExample() {
  const provider = new OpenAIProvider(
    process.env.OPENAI_API_KEY!,
    "gpt-4o-mini"
  );

  const messages: Message[] = [
    { role: "user", content: "Your question" }
  ];

  const response = await provider.chat(messages);
  console.log(response);
}

myExample().catch(console.error);
```

Run it:
```bash
bun examples/my-example.ts
```

---

## Next Steps

1. ✅ Run the basic examples
2. 📚 Read [EXAMPLES.md](../EXAMPLES.md) for detailed documentation
3. 🔧 Implement your own tools
4. 🚀 Deploy a multi-agent service
5. 🧪 Create custom providers

---

## Additional Resources

- [Main README](../README.md)
- [Full Examples Guide](../EXAMPLES.md)
- [Architecture Doc](../README.md#-architecture)
- [OpenAI Docs](https://platform.openai.com/docs)
- [Anthropic Claude Docs](https://docs.anthropic.com)
- [Ollama Docs](https://github.com/ollama/ollama)

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review example code
3. Check provider documentation
4. Submit an issue on GitHub

Happy building! 🚀
