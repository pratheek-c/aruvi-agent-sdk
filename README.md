# 🧠 Generic Multi-Provider AI Agent Framework

A lightweight, provider-agnostic AI Agent framework built in TypeScript.

- ✅ No SDK dependencies
- ✅ Raw HTTP only (fetch)
- ✅ Multi-provider support
- ✅ Tool calling system
- ✅ Streaming support
- ✅ Multi-agent routing
- ✅ Hono-based runtime
- ✅ Bun native compatible
- ✅ Vendor-neutral architecture

---
Supports:

- OpenAI
- Azure OpenAI
- Ollama (local)
- Claude (Anthropic)
- Easily extensible to other providers

---

# 🚀 Architecture

```
src/
├── core/
│     agent.ts
│     types.ts
│     llm.ts
│
├── providers/
│     openai.provider.ts
│     azure.provider.ts
│     ollama.provider.ts
│     claude.provider.ts
│     openrouter.provider.ts
│
├── runtime/
│     hono-adapter.ts
│     multi-agent-runtime.ts

````

Design Philosophy:

- Agent is provider-agnostic
- Providers implement a shared interface
- Runtime is separated from core logic
- Tools are pluggable
- No SDK lock-in
- Streaming-first design

---

# 📦 Installation

```bash
bun install
# or
npm install
````

No external SDKs required.

---

---

# 🔌 Supported Providers

| Provider     | SDK Used | Raw HTTP | Streaming |
| ------------ | -------- | -------- | --------- |
| OpenAI       | ❌        | ✅        | ✅         |
| Azure OpenAI | ❌        | ✅        | Optional  |
| Ollama       | ❌        | ✅        | ✅         |
| Claude       | ❌        | ✅        | Optional  |
| OpenRouter   | ❌        | ✅        | ✅         |

---

## 1️⃣ OpenAI

```ts
import { OpenAIProvider } from "./providers/openai.provider";

const provider = new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  "gpt-4o-mini"
);
```

Uses:

```
https://api.openai.com/v1/chat/completions
```

---

## 2️⃣ Azure OpenAI

```ts
import { AzureProvider } from "./providers/azure.provider";

const provider = new AzureProvider(
  process.env.AZURE_API_KEY!,
  "https://your-resource.openai.azure.com",
  "gpt-4-deployment",
  "2024-02-15-preview"
);
```

---

## 3️⃣ Ollama (Local)

```ts
import { OllamaProvider } from "./providers/ollama.provider";

const provider = new OllamaProvider("llama3");
```

Requires:

```
http://localhost:11434
```

---

## 4️⃣ Claude (Anthropic)

```ts
import { ClaudeProvider } from "./providers/claude.provider";

const provider = new ClaudeProvider(
  process.env.CLAUDE_API_KEY!,
  "claude-3-sonnet-20240229"
);
```

---

# 🧠 Creating an Agent

```ts
import { Agent } from "./core/agent";

const agent = new Agent(provider, {
  systemPrompt: "You are a helpful AI assistant.",
  maxToolIterations: 3
});
```

---

# 🛠 Registering Tools

```ts
agent.registerTool({
  name: "calculator",
  description: "Evaluate math expression",
  async execute({ expression }) {
    return eval(expression).toString();
  }
});
```

---

# ▶️ Running the Agent

```ts
const result = await agent.run("What is 12 * 8?");
console.log(result);
```

---

# 🔄 Tool Calling Flow

1. Agent sends system prompt + tool descriptions
2. LLM decides whether tool is required
3. If tool needed → LLM responds with JSON:

```json
{
  "tool": "calculator",
  "arguments": { "expression": "12 * 8" }
}
```

4. Agent executes tool
5. Tool result is sent back to LLM
6. LLM produces final answer

Max iterations are configurable to prevent infinite loops.

---

# 🧱 Core Interfaces

## LLMProvider

```ts
export interface LLMProvider {
  name: string;
  chat(messages: Message[]): Promise<string>;
  stream?(messages: Message[]): AsyncGenerator<string>;
}
```

Streaming is optional per provider.

---

## Tool

```ts
export interface Tool {
  name: string;
  description: string;
  execute(args: any): Promise<string>;
}
```

---

# 🌍 Adding a New Provider

To add a new LLM:

1. Create a new provider file
2. Implement `LLMProvider`
3. Use raw HTTP `fetch`
4. Normalize response to return `string`

Example:

```ts
export class CustomProvider implements LLMProvider {
  name = "custom";

  async chat(messages: Message[]): Promise<string> {
    const res = await fetch("API_URL", {...});
    const data = await res.json();
    return data.response;
  }
}
```

Done.

No changes required in Agent.

---

# 🔐 Environment Variables

Example `.env`:

```
OPENAI_API_KEY=...
AZURE_API_KEY=...
CLAUDE_API_KEY=...
```

---

# 🧩 Extending the Framework

Possible upgrades:

* Streaming abstraction
* Memory adapters (Redis / DB)
* Middleware pipeline
* Observability hooks
* Retry logic
* Tool schema validation (Zod)
* Multi-agent orchestration
* Rate limiting layer
* Logging & tracing
* OpenTelemetry integration

---

# 🏗 Why No SDK?

Using raw HTTP:

* Reduces dependency surface
* Avoids breaking SDK changes
* Full control over request structure
* Works in Bun, Node, Edge, Deno
* Easier debugging
* Cleaner abstraction layer
---

# 🌐 API Endpoints

## Health Check

```
GET /agent/:name/health
```

Example:

```
GET /agent/router/health
```

---

## Standard Chat

```
POST /agent/:name/chat
```

Body:

```json
{
  "message": "What is 12 * 9?"
}
```

---

## 🔥 Streaming Chat

```
POST /agent/:name/stream
```

Returns streamed response (chunked).

Works with providers implementing `stream()`.

---

# 🟢 Bun Native Runtime

No `@hono/node-server` required.

```ts
export default {
  port: 3000,
  fetch: app.fetch,
};
```

Run:

```bash
bun run index.ts
```

---
# 🏗 Extending the Framework

Possible enhancements:

* SSE streaming parser
* Provider failover
* Middleware pipeline
* Redis memory adapter
* Agent orchestration engine
* Tool schema validation (Zod)
* Observability hooks
* Cost tracking
* OpenTelemetry support

---

# 🤝 Contributing

1. Fork
2. Create feature branch
3. Add provider or feature
4. Submit PR

---

# 💡 Philosophy

This project treats LLMs as infrastructure.

Not SDK-bound utilities.

It provides:

* Clean separation
* Vendor neutrality
* Pluggable architecture
* Production-grade runtime
* Multi-agent support
* Streaming-first design

---

# 🧠 Why No SDK?

Using raw HTTP:

* Reduces dependency surface
* Avoids breaking SDK updates
* Works in Bun, Node, Edge, Deno
* Easier debugging
* Fully controlled abstraction layer

---

Built for serious AI infrastructure development.

---
