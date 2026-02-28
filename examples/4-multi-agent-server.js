"use strict";
/**
 * Example 4: Multi-Agent Runtime
 * Shows how to deploy multiple agents in an HTTP server
 */
Object.defineProperty(exports, "__esModule", { value: true });
var aruvi_1 = require("aruvi");
// Create multi-agent runtime
var app = (0, aruvi_1.createMultiAgentRuntime)([
    {
        name: "gpt",
        provider: new aruvi_1.OpenAIProvider(process.env.OPENAI_API_KEY, "gpt-4o-mini"),
        systemPrompt: "You are a helpful OpenAI-powered assistant. Be concise and helpful."
    },
    {
        name: "claude",
        provider: new aruvi_1.ClaudeProvider(process.env.ANTHROPIC_API_KEY, "claude-3-sonnet-20240229"),
        systemPrompt: "You are Claude, an AI assistant by Anthropic. Provide thoughtful and detailed responses."
    },
    {
        name: "local",
        provider: new aruvi_1.OllamaProvider("llama3"),
        systemPrompt: "You are a local AI assistant. Be helpful and accurate."
    }
]);
var port = process.env.PORT || 3000;
console.log("\n\uD83D\uDE80 Multi-Agent Runtime Server Starting\n\nAvailable Agents:\n- GPT (OpenAI): http://localhost:".concat(port, "/chat/gpt\n- Claude (Anthropic): http://localhost:").concat(port, "/chat/claude\n- Local (Ollama): http://localhost:").concat(port, "/chat/local\n\nEndpoints:\n- POST /chat/:agent - Single chat request\n- POST /stream/:agent - Streaming chat request\n\nExample Usage:\ncurl -X POST http://localhost:").concat(port, "/chat/gpt \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"messages\": [{\"role\": \"user\", \"content\": \"Hello!\"}]}'\n\nStreaming:\ncurl -X POST http://localhost:").concat(port, "/stream/gpt \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"messages\": [{\"role\": \"user\", \"content\": \"Write a story\"}]}' --no-buffer\n"));
exports.default = {
    port: port,
    fetch: app.fetch,
};
