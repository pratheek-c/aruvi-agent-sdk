# 🧠 Aruvi Agent SDK - Usage Examples

Complete guide with practical examples for using the Aruvi Agent Framework.

---

## Table of Contents

1. [Basic Chat with Different Providers](#basic-chat)
2. [Streaming Responses](#streaming)
3. [Creating Custom Tools](#custom-tools)
4. [Agent with Tool Calling](#agent-with-tools)
5. [Multi-Agent Runtime](#multi-agent-runtime)
6. [Advanced Examples](#advanced-examples)

---

## Basic Chat

### OpenAI Provider

```typescript
import { OpenAIProvider } from "./src/providers/openai.provider";

const provider = new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  "gpt-4o-mini"
);

const messages = [
  { role: "user" as const, content: "What is TypeScript?" }
];

const response = await provider.chat(messages);
console.log(response);
```

### Azure OpenAI Provider

```typescript
import { AzureProvider } from "./src/providers/azure.provider";

const provider = new AzureProvider(
  process.env.AZURE_API_KEY!,
  "https://your-resource.openai.azure.com",
  "your-deployment-name",
  "2023-05-15"
);

const messages = [
  { role: "user" as const, content: "Hello, Azure!" }
];

const response = await provider.chat(messages);
console.log(response);
```

### Claude (Anthropic) Provider

```typescript
import { ClaudeProvider } from "./src/providers/claude.provider";

const provider = new ClaudeProvider(
  process.env.ANTHROPIC_API_KEY!,
  "claude-3-sonnet-20240229"
);

const messages = [
  { role: "user" as const, content: "Explain quantum computing" }
];

const response = await provider.chat(messages);
console.log(response);
```

### OpenRouter Provider

```typescript
import { OpenRouterProvider } from "./src/providers/openrouter.provider";

const provider = new OpenRouterProvider(
  process.env.OPENROUTER_API_KEY!,
  "openai/gpt-4o-mini",
  "https://myapp.com",  // optional site URL
  "My App"              // optional site name
);

const messages = [
  { role: "user" as const, content: "What models do you support?" }
];

const response = await provider.chat(messages);
console.log(response);
```

### Ollama (Local) Provider

```typescript
import { OllamaProvider } from "./src/providers/ollama.provider";

// Make sure Ollama is running: ollama serve
const provider = new OllamaProvider("llama3");

const messages = [
  { role: "user" as const, content: "What is AI?" }
];

const response = await provider.chat(messages);
console.log(response);
```

### Mimo (Xiaomi) Provider

```typescript
import { MimoProvider } from "./src/providers/mimo.provider";

const provider = new MimoProvider(
  process.env.MIMO_API_KEY!,
  "mimo-model-v1"
);

const messages = [
  { role: "user" as const, content: "Hello Mimo!" }
];

const response = await provider.chat(messages);
console.log(response);
```

---

## Streaming

All providers support streaming responses in real-time.

### Basic Streaming

```typescript
import { OpenAIProvider } from "./src/providers/openai.provider";

const provider = new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  "gpt-4o-mini"
);

const messages = [
  { role: "user" as const, content: "Write a short poem about AI" }
];

// Use stream() for real-time responses
for await (const chunk of provider.stream(messages)) {
  process.stdout.write(chunk);
}
```

### Streaming with Claude

```typescript
import { ClaudeProvider } from "./src/providers/claude.provider";

const provider = new ClaudeProvider(
  process.env.ANTHROPIC_API_KEY!,
  "claude-3-sonnet-20240229"
);

const messages = [
  { role: "user" as const, content: "Explain machine learning" }
];

for await (const chunk of provider.stream(messages)) {
  process.stdout.write(chunk);
}
console.log("\n✓ Streaming completed");
```

### Collecting Streamed Response

```typescript
async function streamToString(provider: LLMProvider, messages: Message[]) {
  let result = "";
  
  if (!provider.stream) {
    return provider.chat(messages);
  }
  
  for await (const chunk of provider.stream(messages)) {
    result += chunk;
  }
  
  return result;
}

const response = await streamToString(provider, messages);
console.log(response);
```

---

## Custom Tools

Create reusable tools for agents to use.

### Simple Calculator Tool

```typescript
import { Tool } from "./src/core/types";

const calculatorTool: Tool = {
  name: "calculator",
  description: "Performs basic arithmetic operations (add, subtract, multiply, divide)",
  async execute(args: { operation: string; a: number; b: number }) {
    const { operation, a, b } = args;
    
    switch (operation.toLowerCase()) {
      case "add":
        return (a + b).toString();
      case "subtract":
        return (a - b).toString();
      case "multiply":
        return (a * b).toString();
      case "divide":
        return (a / b).toString();
      default:
        return "Unknown operation";
    }
  }
};
```

### Weather Tool

```typescript
const weatherTool: Tool = {
  name: "get_weather",
  description: "Gets the current weather for a specified city",
  async execute(args: { city: string }) {
    const { city } = args;
    
    // Mock weather data - replace with real API call
    const weatherData: { [key: string]: string } = {
      "new york": "72°F, Sunny",
      "london": "15°C, Cloudy",
      "tokyo": "28°C, Rainy"
    };
    
    return weatherData[city.toLowerCase()] || "Weather data not available";
  }
};
```

### Database Query Tool

```typescript
const databaseTool: Tool = {
  name: "query_database",
  description: "Executes database queries to fetch user information",
  async execute(args: { query: string; user_id?: string }) {
    const { query, user_id } = args;
    
    // Mock database query - replace with real database
    if (user_id) {
      return JSON.stringify({
        id: user_id,
        name: "John Doe",
        email: "john@example.com",
        created_at: "2023-01-15"
      });
    }
    
    return "Query executed";
  }
};
```

### Web Search Tool

```typescript
const searchTool: Tool = {
  name: "web_search",
  description: "Searches the web for information about a topic",
  async execute(args: { query: string; max_results?: number }) {
    const { query, max_results = 5 } = args;
    
    // Mock search results - replace with actual search API (e.g., SerpAPI, Bing)
    return JSON.stringify([
      { title: `Result about ${query}`, url: "https://example.com" },
      { title: `More info on ${query}`, url: "https://example2.com" }
    ]);
  }
};
```

---

## Agent with Tools

Create an intelligent agent that can use tools to solve problems.

### Basic Agent Setup

```typescript
import { Agent } from "./src/core/agent";
import { OpenAIProvider } from "./src/providers/openai.provider";

const provider = new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  "gpt-4o-mini"
);

const agent = new Agent(provider, {
  systemPrompt: "You are a helpful assistant that can perform calculations and answer questions.",
  maxToolIterations: 5
});

// Register tools
agent.registerTool(calculatorTool);
agent.registerTool(weatherTool);

// Run agent
const result = await agent.run("What is 15 + 27? And what's the weather in New York?");
console.log(result);
```

### Research Agent

```typescript
const researchAgent = new Agent(provider, {
  systemPrompt: `You are a research assistant. Use available tools to gather information,
  search the web, and provide comprehensive answers to research queries.`,
  maxToolIterations: 10
});

researchAgent.registerTool(searchTool);
researchAgent.registerTool(databaseTool);

const research = await researchAgent.run(
  "Research the latest developments in AI and provide a summary with sources"
);
console.log(research);
```

### Data Analysis Agent

```typescript
const analysisAgent = new Agent(provider, {
  systemPrompt: "You are a data analyst. Extract insights from data and provide statistics.",
  maxToolIterations: 8
});

analysisAgent.registerTool(databaseTool);
analysisAgent.registerTool(calculatorTool);

const analysis = await analysisAgent.run(
  "Analyze the sales data for Q1 and calculate the average revenue per transaction"
);
console.log(analysis);
```

---

## Multi-Agent Runtime

Deploy multiple agents in a Hono-based HTTP server.

### Basic Multi-Agent Runtime

```typescript
import { createMultiAgentRuntime } from "./src/runtime/multi-agent-runtime";
import { OpenAIProvider } from "./src/providers/openai.provider";
import { OllamaProvider } from "./src/providers/ollama.provider";

const app = createMultiAgentRuntime([
  {
    name: "gpt",
    provider: new OpenAIProvider(
      process.env.OPENAI_API_KEY!,
      "gpt-4o-mini"
    ),
    systemPrompt: "You are a helpful OpenAI-powered assistant."
  },
  {
    name: "local",
    provider: new OllamaProvider("llama3"),
    systemPrompt: "You are a local Ollama-based assistant."
  },
  {
    name: "claude",
    provider: new ClaudeProvider(
      process.env.ANTHROPIC_API_KEY!,
      "claude-3-sonnet-20240229"
    ),
    systemPrompt: "You are Claude, an AI assistant by Anthropic."
  }
]);

export default {
  port: 3000,
  fetch: app.fetch,
};

console.log("🚀 Multi-Agent Runtime running on port 3000");
```

### Querying Multi-Agent Runtime

```bash
# Query the GPT agent
curl -X POST http://localhost:3000/chat/gpt \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "What is TypeScript?"}]}'

# Query the local agent
curl -X POST http://localhost:3000/chat/local \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "What is AI?"}]}'

# Stream from Claude agent
curl -X POST http://localhost:3000/stream/claude \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Write a poem"}]}'
```

---

## Advanced Examples

### Multi-Turn Conversation

```typescript
import { Message } from "./src/core/types";
import { OpenAIProvider } from "./src/providers/openai.provider";

const provider = new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  "gpt-4o-mini"
);

const messages: Message[] = [
  { role: "system", content: "You are a helpful assistant." }
];

// Turn 1
messages.push({ role: "user", content: "What is the capital of France?" });
let response = await provider.chat(messages);
console.log("Assistant:", response);
messages.push({ role: "assistant", content: response });

// Turn 2
messages.push({ role: "user", content: "What is its population?" });
response = await provider.chat(messages);
console.log("Assistant:", response);
messages.push({ role: "assistant", content: response });

// Turn 3
messages.push({ role: "user", content: "What language is spoken there?" });
response = await provider.chat(messages);
console.log("Assistant:", response);
```

### Provider Fallback Pattern

```typescript
import { LLMProvider } from "./src/core/llm";

async function chatWithFallback(
  primaryProvider: LLMProvider,
  fallbackProvider: LLMProvider,
  messages: Message[]
): Promise<string> {
  try {
    return await primaryProvider.chat(messages);
  } catch (error) {
    console.log(`${primaryProvider.name} failed, using ${fallbackProvider.name}`);
    return await fallbackProvider.chat(messages);
  }
}

// Usage
const primary = new OpenAIProvider(process.env.OPENAI_API_KEY!, "gpt-4o-mini");
const fallback = new OllamaProvider("llama3");

const response = await chatWithFallback(
  primary,
  fallback,
  [{ role: "user" as const, content: "Hello!" }]
);
console.log(response);
```

### Load Balancing Between Providers

```typescript
async function chatWithLoadBalancing(
  providers: LLMProvider[],
  messages: Message[]
): Promise<string> {
  // Round-robin selection
  const selectedProvider = providers[Math.floor(Math.random() * providers.length)];
  console.log(`Using provider: ${selectedProvider.name}`);
  
  return await selectedProvider.chat(messages);
}

// Usage
const providers = [
  new OpenAIProvider(process.env.OPENAI_API_KEY!, "gpt-4o-mini"),
  new ClaudeProvider(process.env.ANTHROPIC_API_KEY!, "claude-3-sonnet-20240229"),
  new OllamaProvider("llama3")
];

const response = await chatWithLoadBalancing(
  providers,
  [{ role: "user" as const, content: "Which provider answered?" }]
);
console.log(response);
```

### Streaming with Progress Tracking

```typescript
async function streamWithProgress(
  provider: LLMProvider,
  messages: Message[]
): Promise<string> {
  if (!provider.stream) {
    return provider.chat(messages);
  }
  
  let result = "";
  let chunkCount = 0;
  
  for await (const chunk of provider.stream(messages)) {
    result += chunk;
    chunkCount++;
    
    // Progress indicator
    if (chunkCount % 10 === 0) {
      process.stdout.write(".");
    }
  }
  
  console.log(`\n✓ Received ${chunkCount} chunks`);
  return result;
}

const response = await streamWithProgress(provider, messages);
console.log("\nFinal response:", response);
```

### Parallel Requests

```typescript
async function parallelChat(
  providers: LLMProvider[],
  userQuery: string
): Promise<Map<string, string>> {
  const messages: Message[] = [
    { role: "user" as const, content: userQuery }
  ];
  
  const results = new Map<string, string>();
  
  const promises = providers.map(async (provider) => {
    try {
      const response = await provider.chat(messages);
      results.set(provider.name, response);
    } catch (error) {
      console.error(`Error with ${provider.name}:`, error);
    }
  });
  
  await Promise.all(promises);
  return results;
}

// Usage
const providers = [
  new OpenAIProvider(process.env.OPENAI_API_KEY!, "gpt-4o-mini"),
  new ClaudeProvider(process.env.ANTHROPIC_API_KEY!, "claude-3-sonnet-20240229"),
  new OllamaProvider("llama3")
];

const results = await parallelChat(
  providers,
  "What makes a good programming language?"
);

results.forEach((response, provider) => {
  console.log(`\n${provider}:\n${response}`);
});
```

### Custom Provider Implementation

```typescript
import { LLMProvider } from "./src/core/llm";
import { Message } from "./src/core/types";

export class CustomProvider implements LLMProvider {
  name = "custom";

  constructor(
    private apiKey: string,
    private model: string
  ) {}

  async chat(messages: Message[]): Promise<string> {
    const response = await fetch("https://your-api.com/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages,
      }),
    });

    const data = await response.json();
    return data.response ?? "";
  }

  async *stream(messages: Message[]): AsyncGenerator<string> {
    const response = await fetch("https://your-api.com/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
      }),
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      yield chunk;
    }
  }
}

// Usage
const customProvider = new CustomProvider(
  process.env.CUSTOM_API_KEY!,
  "custom-model"
);

const response = await customProvider.chat(messages);
console.log(response);
```

---

## Running Examples

### With Node.js

```bash
npm install
npm run build
node dist/examples/your-example.js
```

### With Bun

```bash
bun install
bun src/examples/your-example.ts
```

### With TypeScript

```bash
npx ts-node src/examples/your-example.ts
```

---

## Environment Variables

Create a `.env` file in the root:

```env
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
OPENROUTER_API_KEY=your-openrouter-key
AZURE_API_KEY=your-azure-key
MIMO_API_KEY=your-mimo-key
```

---

## Best Practices

- ✅ Always handle errors from API calls
- ✅ Use streaming for long responses to improve UX
- ✅ Implement rate limiting for production use
- ✅ Cache API responses when appropriate
- ✅ Use fallback providers for reliability
- ✅ Set reasonable `maxToolIterations` to prevent infinite loops
- ✅ Validate tool arguments before execution
- ✅ Use environment variables for sensitive data
- ✅ Test agents thoroughly before production deployment

---

For more information, see [README.md](./README.md)
