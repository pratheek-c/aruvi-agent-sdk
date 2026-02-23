import { createMultiAgentRuntime } from "./runtime/multi-agent-runtime";
import { OpenRouterProvider } from "./providers/openrouter.provider";
import { OllamaProvider } from "./providers/ollama.provider";

const app = createMultiAgentRuntime([
  {
    name: "router",
    provider: new OpenRouterProvider(
      process.env.OPENROUTER_API_KEY!,
      "openai/gpt-4o-mini"
    ),
    systemPrompt: "You are a helpful assistant.",
  },
  {
    name: "local",
    provider: new OllamaProvider("llama3"),
    systemPrompt: "You are a local AI.",
  },
]);

export default {
  port: 3000,
  fetch: app.fetch,
};

console.log("🚀 Multi-Agent Runtime running on port 3000");