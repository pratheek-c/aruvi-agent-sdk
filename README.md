# 🧠 Generic Multi-Provider AI Agent Framework

A lightweight, provider-agnostic AI Agent framework built in TypeScript.

- ✅ No SDK dependencies
- ✅ Raw HTTP only (fetch)
- ✅ Pluggable LLM providers
- ✅ Tool calling support
- ✅ Multi-provider architecture
- ✅ Production-ready structure

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

````

### Design Principles

- Agent is provider-agnostic
- Providers implement a common interface
- Tools are dynamically registered
- No vendor lock-in
- Fully extensible

---

# 📦 Installation

```bash
bun install
# or
npm install
````

No external SDKs required.

---

# 🔌 Supported Providers

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
}
```

Any provider must implement this interface.

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

# 📜 License

MIT

---

# 🤝 Contributing

1. Fork
2. Create feature branch
3. Add provider or feature
4. Submit PR

---

# 💡 Philosophy

This project treats LLMs as infrastructure.

Not as SDK-locked black boxes.

The Agent is:

* Portable
* Modular
* Vendor-neutral
* Extensible
* Production-oriented

---

# 🧠 Future Roadmap

* Unified streaming API
* Function calling normalization layer
* Memory abstraction
* Agent orchestration engine
* Plugin ecosystem
* CLI tool
* Distributed agent runtime

---

Built for serious AI infrastructure development.

---
