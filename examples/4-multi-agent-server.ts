/**
 * Example 4: Multi-Agent Runtime
 * Shows how to deploy multiple agents in an HTTP server
 */

import {
  createMultiAgentRuntime,
  OpenAIProvider,
  ClaudeProvider,
  OllamaProvider,
} from "aruvi-agent-sdk";

// Create multi-agent runtime
const app = createMultiAgentRuntime([
  {
    name: "gpt",
    provider: new OpenAIProvider(
      process.env.OPENAI_API_KEY!,
      "gpt-4o-mini"
    ),
    systemPrompt: "You are a helpful OpenAI-powered assistant. Be concise and helpful."
  },
  {
    name: "claude",
    provider: new ClaudeProvider(
      process.env.ANTHROPIC_API_KEY!,
      "claude-3-sonnet-20240229"
    ),
    systemPrompt: "You are Claude, an AI assistant by Anthropic. Provide thoughtful and detailed responses."
  },
  {
    name: "local",
    provider: new OllamaProvider("llama3"),
    systemPrompt: "You are a local AI assistant. Be helpful and accurate."
  }
]);

const port = process.env.PORT || 3000;

console.log(`
🚀 Multi-Agent Runtime Server Starting

Available Agents:
- GPT (OpenAI): http://localhost:${port}/chat/gpt
- Claude (Anthropic): http://localhost:${port}/chat/claude
- Local (Ollama): http://localhost:${port}/chat/local

Endpoints:
- POST /chat/:agent - Single chat request
- POST /stream/:agent - Streaming chat request

Example Usage:
curl -X POST http://localhost:${port}/chat/gpt \\
  -H "Content-Type: application/json" \\
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'

Streaming:
curl -X POST http://localhost:${port}/stream/gpt \\
  -H "Content-Type: application/json" \\
  -d '{"messages": [{"role": "user", "content": "Write a story"}]}' --no-buffer
`);

export default {
  port,
  fetch: app.fetch,
};
