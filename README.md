# 🧠 Aruvi Agent SDK

A lightweight, provider-agnostic AI agent framework written in TypeScript. No vendor SDKs — pure `fetch`, fully typed, Bun-native.

```bash
npm install aruvi-agent-sdk
# or
bun add aruvi-agent-sdk
```

---

## Features

| Capability | Status |
|---|---|
| 6 LLM providers (OpenAI, Claude, Azure, Ollama, OpenRouter, Mimo) | ✅ |
| Streaming (Server-Sent Events) | ✅ |
| Tool calling with auto-loop | ✅ |
| Multi-agent Hono runtime | ✅ |
| Persistent memory (Stoolap embedded SQL) | ✅ |
| Vector store + HNSW cosine similarity search | ✅ |
| REST API for memory inspection | ✅ |
| Interactive API docs (Scalar) | ✅ |
| Zero vendor SDK dependencies | ✅ |

---

## Project Structure

```
src/
├── core/
│   ├── agent.ts          — Agent class (tool loop, multi-turn)
│   ├── types.ts          — Shared types (Message, Tool, AgentConfig)
│   └── llm.ts            — LLMProvider interface
│
├── providers/
│   ├── openai.provider.ts
│   ├── claude.provider.ts
│   ├── azure.provider.ts
│   ├── ollama.provider.ts
│   ├── openrouter.provider.ts
│   └── mimo.provider.ts
│
├── memory/
│   ├── stoolap-memory.ts — Persistent memory + vector store
│   ├── types.ts          — Memory types
│   └── index.ts
│
├── runtime/
│   ├── multi-agent-runtime.ts — Multi-agent Hono server
│   ├── hono-adapter.ts        — Single-agent Hono wrapper
│   ├── memory-api.ts          — Memory REST API + Scalar docs
│   └── openapi-spec.ts        — OpenAPI 3.0 specification
│
└── docs-server.ts        — Standalone API docs server
```

---

## Quick Start

```ts
import { OpenAIProvider, Agent } from "aruvi-agent-sdk";

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",
});

const agent = new Agent(provider, {
  systemPrompt: "You are a helpful assistant.",
});

const reply = await agent.run("Hello, who are you?");
console.log(reply);
```

---

## Providers

All providers implement the same `LLMProvider` interface and work identically with `Agent`.

### OpenAI

```ts
import { OpenAIProvider } from "aruvi-agent-sdk";

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",           // or "gpt-4o-mini", "gpt-3.5-turbo", etc.
});
```

Endpoint: `https://api.openai.com/v1/chat/completions`

---

### Claude (Anthropic)

```ts
import { ClaudeProvider } from "aruvi-agent-sdk";

const provider = new ClaudeProvider({
  apiKey: process.env.CLAUDE_API_KEY!,
  model: "claude-3-5-sonnet-20241022",
});
```

Endpoint: `https://api.anthropic.com/v1/messages`

---

### Azure OpenAI

```ts
import { AzureProvider } from "aruvi-agent-sdk";

const provider = new AzureProvider({
  apiKey: process.env.AZURE_API_KEY!,
  endpoint: "https://your-resource.openai.azure.com",
  deployment: "gpt-4-deployment",
  apiVersion: "2024-02-15-preview",
});
```

---

### Ollama (local)

```ts
import { OllamaProvider } from "aruvi-agent-sdk";

const provider = new OllamaProvider({
  model: "llama3",
  // baseUrl defaults to http://localhost:11434
});
```

Run Ollama locally: `ollama serve`

---

### OpenRouter

```ts
import { OpenRouterProvider } from "aruvi-agent-sdk";

const provider = new OpenRouterProvider({
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: "openai/gpt-4o",
  siteUrl: "https://yoursite.com",   // optional
  siteName: "My App",                // optional
});
```

Endpoint: `https://openrouter.ai/api/v1/chat/completions`

---

### Mimo

```ts
import { MimoProvider } from "aruvi-agent-sdk";

const provider = new MimoProvider({
  apiKey: process.env.MIMO_API_KEY!,
  model: "mimo-default",
});
```

Endpoint: `https://api.xiaomimimo.com/v1/chat/completions`

---

## Agent

### Basic usage

```ts
import { Agent } from "aruvi-agent-sdk";

const agent = new Agent(provider, {
  systemPrompt: "You are a travel advisor.",
  maxToolIterations: 5,   // default: 10
});

const reply = await agent.run("Plan a 3-day trip to Tokyo.");
console.log(reply);
```

### Tool calling

Register tools that the agent can invoke automatically:

```ts
agent.registerTool({
  name: "get_weather",
  description: "Returns the current weather for a city",
  async execute({ city }) {
    const data = await fetchWeather(city);
    return `${data.temp}°C, ${data.condition}`;
  },
});

agent.registerTool({
  name: "calculator",
  description: "Evaluates a math expression and returns the result",
  async execute({ expression }) {
    return String(eval(expression));
  },
});

const reply = await agent.run("What's the weather in Paris and what is 42 * 7?");
```

**Tool calling flow:**
1. Agent sends system prompt + tool descriptions to the LLM
2. LLM responds with a JSON tool call: `{ "tool": "get_weather", "arguments": { "city": "Paris" } }`
3. Agent executes the tool and feeds the result back to the LLM
4. Loop continues until the LLM gives a plain text answer (up to `maxToolIterations`)

---

## Streaming

Every provider has a `stream()` method that yields text chunks as an `AsyncGenerator<string>`:

```ts
const stream = provider.stream([
  { role: "user", content: "Tell me a story about a robot." },
]);

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

### Streaming with Hono (SSE)

```ts
import { Hono } from "hono";

const app = new Hono();

app.post("/chat/stream", async (c) => {
  const { message } = await c.req.json();

  return new Response(
    new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        for await (const chunk of provider.stream([{ role: "user", content: message }])) {
          controller.enqueue(enc.encode(`data: ${chunk}\n\n`));
        }
        controller.enqueue(enc.encode("data: [DONE]\n\n"));
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/event-stream" } }
  );
});
```

---

## Multi-Agent Runtime

Deploy multiple named agents behind a single Hono server:

```ts
import { createMultiAgentRuntime, OpenAIProvider, ClaudeProvider } from "aruvi-agent-sdk";

const app = createMultiAgentRuntime([
  {
    name: "support",
    provider: new OpenAIProvider({ apiKey: "...", model: "gpt-4o" }),
    systemPrompt: "You are a customer support agent.",
  },
  {
    name: "coder",
    provider: new ClaudeProvider({ apiKey: "...", model: "claude-3-5-sonnet-20241022" }),
    systemPrompt: "You are an expert software engineer.",
    tools: [myCodeTool],
    maxToolIterations: 8,
  },
]);

export default { port: 3000, fetch: app.fetch };
```

**Auto-generated routes per agent:**

| Method | Route | Description |
|---|---|---|
| `GET` | `/agent/:name/health` | Liveness check |
| `POST` | `/agent/:name/chat` | Single-turn chat |
| `POST` | `/agent/:name/stream` | Streaming chat (SSE) |

**Chat request:**
```bash
curl -X POST http://localhost:3000/agent/support/chat \
  -H "Content-Type: application/json" \
  -d '{ "message": "My order is delayed." }'
```

**Chat response:**
```json
{ "success": true, "agent": "support", "reply": "I apologize for the delay..." }
```

---

## Persistent Memory (`StoolapMemory`)

`StoolapMemory` uses [`@stoolap/node`](https://www.npmjs.com/package/@stoolap/node) — a pure-Rust embedded SQL database with native VECTOR and HNSW support. All data is persisted locally on disk (or in-memory for testing).

### Three tables are created automatically

| Table | Purpose |
|---|---|
| `chats` | One row per conversation session keyed by `agent_name`, `agent_id`, `chat_id` |
| `messages` | Chat history (role / content) linked to a session |
| `embeddings` | Vector store with HNSW cosine index for similarity search |

### Setup

```ts
import { StoolapMemory } from "aruvi-agent-sdk";

const memory = new StoolapMemory({
  dbPath: "./aruvi-memory",   // persistent file; use ':memory:' for in-memory
  vectorDimensions: 1536,     // must match your embedding model (default: 1536)
});

await memory.init();   // creates tables + indexes on first run
```

### Chat sessions

```ts
// Create a session
const chatId = await memory.createChat({
  chatHeading: "Support request #42",
  agentName: "support-bot",
  agentId: "agent-001",
  // chatId: "custom-uuid"   // optional — auto-generated UUID if omitted
});

// Get one session
const session = await memory.getChat(chatId);

// List sessions (optionally filtered)
const all    = await memory.listChats();
const byName = await memory.listChats({ agentName: "support-bot" });
const byId   = await memory.listChats({ agentId: "agent-001" });

// Update the heading
await memory.updateChatHeading(chatId, "Billing issue — resolved");

// Delete session + all messages + all embeddings
await memory.deleteChat(chatId);
```

### Messages

```ts
// Append a message
await memory.addMessage({
  chatId,
  agentName: "support-bot",
  agentId: "agent-001",
  role: "user",           // "user" | "assistant" | "system"
  content: "My order hasn't arrived.",
});

await memory.addMessage({
  chatId,
  agentName: "support-bot",
  agentId: "agent-001",
  role: "assistant",
  content: "I'll look into that for you right away.",
});

// Retrieve full history (oldest first)
const messages = await memory.getMessages(chatId);

// Clear history (keeps the session row)
await memory.clearMessages(chatId);
```

### Integrate memory with an Agent

```ts
const chatId = await memory.createChat({
  chatHeading: "Session 1",
  agentName: "bot",
  agentId: "a1",
});

// Store the user message
await memory.addMessage({ chatId, agentName: "bot", agentId: "a1", role: "user", content: userInput });

// Run the agent
const reply = await agent.run(userInput);

// Store the agent reply
await memory.addMessage({ chatId, agentName: "bot", agentId: "a1", role: "assistant", content: reply });

// Retrieve full conversation later
const history = await memory.getMessages(chatId);
```

---

## Vector Store & Embeddings

Store float32 embeddings and search by cosine similarity using the built-in HNSW index.

### Store an embedding

```ts
// Generate embedding from your model (OpenAI, local model, etc.)
const embedding = await getEmbedding("My order hasn't arrived.");  // float[]

await memory.addEmbedding({
  chatId,
  agentName: "support-bot",
  agentId: "agent-001",
  content: "My order hasn't arrived.",   // source text for the vector
  embedding,                             // float32 array, length = vectorDimensions
  metadata: { source: "user-message", turn: 3 },  // optional JSON
});
```

### Cosine similarity search (RAG)

```ts
const queryEmbedding = await getEmbedding("shipping delay");

const results = await memory.searchSimilar(
  queryEmbedding,
  5,                            // topK — number of results
  { agentName: "support-bot" }  // optional filters: agentName, agentId, chatId
);

// results: MemorySearchResult[]
for (const r of results) {
  console.log(r.score, r.content, r.metadata);
  // score = cosine distance (lower = more similar)
}
```

### List embeddings (no vector computation)

```ts
const entries = await memory.listEmbeddings({ agentId: "agent-001" });
```

### Close the database

```ts
await memory.close();
```

---

## Memory REST API

Mount the memory REST API onto any Hono app. Exposes full CRUD for sessions, messages, and embeddings — plus an interactive Scalar docs UI.

```ts
import { Hono } from "hono";
import { createMemoryApi, StoolapMemory } from "aruvi-agent-sdk";

const app    = new Hono();
const memory = new StoolapMemory({ dbPath: "./aruvi-memory" });
await memory.init();

app.route("/memory", createMemoryApi(memory));

export default { port: 3000, fetch: app.fetch };
```

### Endpoints (relative to mount point)

| Method | Path | Description |
|---|---|---|
| `GET` | `/memory/health` | Liveness check |
| `GET` | `/memory/chats` | List sessions (`?agent_name=&agent_id=`) |
| `POST` | `/memory/chats` | Create session |
| `GET` | `/memory/chats/:chatId` | Get one session |
| `PUT` | `/memory/chats/:chatId` | Update heading |
| `DELETE` | `/memory/chats/:chatId` | Delete session + messages + embeddings |
| `GET` | `/memory/chats/:chatId/messages` | Get messages (oldest first) |
| `POST` | `/memory/chats/:chatId/messages` | Add a message |
| `DELETE` | `/memory/chats/:chatId/messages` | Clear all messages |
| `GET` | `/memory/embeddings` | List embeddings (`?agent_name=&agent_id=&chat_id=`) |
| `POST` | `/memory/embeddings` | Store an embedding |
| `POST` | `/memory/embeddings/search` | Cosine similarity search |
| `GET` | `/memory/openapi.json` | Raw OpenAPI 3.0 spec |
| `GET` | `/memory/api` | Interactive Scalar API reference UI |

### Example requests

```bash
# Create a chat session
curl -X POST http://localhost:3000/memory/chats \
  -H "Content-Type: application/json" \
  -d '{ "chatHeading": "Support #42", "agentName": "bot", "agentId": "a1" }'

# Add a message
curl -X POST http://localhost:3000/memory/chats/<chatId>/messages \
  -H "Content-Type: application/json" \
  -d '{ "agentName": "bot", "agentId": "a1", "role": "user", "content": "Hello" }'

# Vector similarity search
curl -X POST http://localhost:3000/memory/embeddings/search \
  -H "Content-Type: application/json" \
  -d '{ "embedding": [0.021, -0.014, ...], "topK": 5, "agentName": "bot" }'
```

---

## API Documentation (Scalar)

### Standalone docs server

```bash
bun run docs              # default port 4000
PORT=8080 bun run docs   # custom port
```

Open **http://localhost:4000/api** — full interactive Scalar API reference with:
- Request / response schemas for every endpoint
- Inline examples
- Live **Try it out** playground

Raw OpenAPI JSON spec: **http://localhost:4000/openapi.json**

### Embedded docs

When `createMemoryApi()` is mounted, docs are automatically available at:
- **`/memory/api`** — Scalar interactive UI
- **`/memory/openapi.json`** — raw spec

### Export the spec programmatically

```ts
import { openApiSpec } from "aruvi-agent-sdk";
app.get("/openapi.json", (c) => c.json(openApiSpec));
```

---

## TypeScript Types

```ts
import type {
  LLMProvider, Message, Role, Tool, AgentConfig,
  MemoryConfig, ChatSession, ChatMessage,
  VectorEntry, MemorySearchResult, CreateChatOptions,
} from "aruvi-agent-sdk";
```

### `LLMProvider`

```ts
interface LLMProvider {
  name: string;
  chat(messages: Message[]): Promise<string>;
  stream?(messages: Message[]): AsyncGenerator<string>;
}
```

### `Tool`

```ts
interface Tool {
  name: string;
  description: string;
  execute(args: Record<string, unknown>): Promise<string>;
}
```

---

## Adding a Custom Provider

```ts
import type { LLMProvider, Message } from "aruvi-agent-sdk";

export class MyProvider implements LLMProvider {
  name = "my-provider";

  async chat(messages: Message[]): Promise<string> {
    const res  = await fetch("https://api.example.com/v1/chat", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const data = await res.json();
    return data.choices[0].message.content;
  }

  async *stream(messages: Message[]): AsyncGenerator<string> {
    const res = await fetch("https://api.example.com/v1/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, stream: true }),
    });
    const reader = res.body!.getReader();
    const dec    = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of dec.decode(value).split("\n")) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          const text = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content;
          if (text) yield text;
        }
      }
    }
  }
}
```

No changes needed in `Agent` — it accepts any `LLMProvider`.

---

## Package Exports

```ts
import { Agent, OpenAIProvider, ... }    from "aruvi-agent-sdk";           // everything
import { OpenAIProvider }                from "aruvi-agent-sdk/providers";  // all providers
import { OpenAIProvider }                from "aruvi-agent-sdk/providers/openai";
import { Agent }                         from "aruvi-agent-sdk/agents";
import type { LLMProvider }              from "aruvi-agent-sdk/llm";
import { StoolapMemory }                 from "aruvi-agent-sdk/memory";
import { createMultiAgentRuntime }       from "aruvi-agent-sdk/runtime";
import { createMemoryApi }               from "aruvi-agent-sdk/runtime/memory-api";
```

---

## Environment Variables

```env
# LLM Providers
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=sk-ant-...
AZURE_API_KEY=...
OPENROUTER_API_KEY=sk-or-...
MIMO_API_KEY=...

# Docs server (optional, default 4000)
PORT=4000
```

---

## Running Scripts

| Command | Description |
|---|---|
| `bun run build` | Compile TypeScript → `dist/` |
| `bun run dev` | Run with hot-reload |
| `bun run docs` | Start the API docs server (port 4000) |
| `bun run type-check` | Type-check without emitting |

---

## Why No Vendor SDK?

Using raw `fetch`:
- Zero extra dependencies
- No breaking SDK updates to absorb
- Works in Bun, Node, Edge, Deno
- Full control over request/response shape
- Easier to debug and audit
- Clean abstraction — swap providers without touching business logic

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Add your provider or feature
4. Submit a PR

---

## License

MIT © Pratheek
