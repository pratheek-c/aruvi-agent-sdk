# 🚀 Quick Start Guide

Get started with Aruvi Agent SDK in 5 minutes!

## 1. Installation

```bash
npm install
# or with Bun
bun install
```

## 2. Setup Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your API keys
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# etc.
```

## 3. Choose Your First Example

### Option A: Basic Chat (Fastest)
```bash
bun examples/1-basic-chat.ts
```

### Option B: Streaming
```bash
bun examples/2-streaming.ts
```

### Option C: Tools & Agents
```bash
bun examples/3-tools.ts
```

### Option D: Multi-Agent Server
```bash
bun examples/4-multi-agent-server.ts
```

### Option E: Advanced Patterns
```bash
bun examples/5-advanced-patterns.ts
```

## 4. Create Your Own

```typescript
import { OpenAIProvider } from "aruvi";
import type { Message } from "aruvi";

const provider = new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  "gpt-4o-mini"
);

const response = await provider.chat([
  { role: "user", content: "Hello!" }
]);

console.log(response);
```

## 5. Learn More

- 📖 [Full Examples Guide](./examples/README.md)
- 📚 [Detailed Documentation](./EXAMPLES.md)
- 📋 [Architecture](./README.md)

## Common Use Cases

### Stream a response
```typescript
import { OpenAIProvider } from "aruvi";

for await (const chunk of provider.stream(messages)) {
  process.stdout.write(chunk);
}
```

### Create an agent with tools
```typescript
import { Agent, OpenAIProvider } from "aruvi";
import type { Tool } from "aruvi";

const agent = new Agent(provider, config);
agent.registerTool(myTool);
const result = await agent.run("Do something");
```

### Use multiple providers
```typescript
import {
  OpenAIProvider,
  ClaudeProvider,
  OllamaProvider,
} from "aruvi";

const openai = new OpenAIProvider(...);
const claude = new ClaudeProvider(...);
const ollama = new OllamaProvider(...);
```

### Deploy a server
```bash
bun examples/4-multi-agent-server.ts
curl http://localhost:3000/chat/gpt -d '...'
```

## Supported Providers

- ✅ OpenAI (GPT-4, GPT-3.5, etc.)
- ✅ Claude (Anthropic)
- ✅ Azure OpenAI
- ✅ OpenRouter (100+ models)
- ✅ Ollama (Local)
- ✅ Mimo (Xiaomi)

## Key Features

✨ **No dependencies** - Just fetch API calls
✨ **Type-safe** - Full TypeScript support
✨ **Streaming** - Real-time responses
✨ **Multi-agent** - Deploy multiple agents
✨ **Tools** - Agent tool calling
✨ **Production-ready** - Error handling, fallbacks, load balancing

## Next Steps

1. Run an example
2. Check out the framework features
3. Create your own tools
4. Deploy a multi-agent service

Happy building! 🧠✨
