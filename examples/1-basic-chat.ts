/**
 * Example 1: Basic Chat with Different Providers
 * Shows how to use each provider for simple chat interactions
 */

import { OpenAIProvider, ClaudeProvider, OllamaProvider } from "aruvi";
import type { Message } from "aruvi";

// Example 1.1: OpenAI
async function exampleOpenAI() {
  console.log("\n📌 Example 1.1: OpenAI Provider");
  
  const provider = new OpenAIProvider(
    process.env.OPENAI_API_KEY!,
    "gpt-4o-mini"
  );

  const messages: Message[] = [
    { role: "user", content: "What is TypeScript in one sentence?" }
  ];

  try {
    const response = await provider.chat(messages);
    console.log("Response:", response);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 1.2: Claude
async function exampleClaude() {
  console.log("\n📌 Example 1.2: Claude Provider");
  
  const provider = new ClaudeProvider(
    process.env.ANTHROPIC_API_KEY!,
    "claude-3-sonnet-20240229"
  );

  const messages: Message[] = [
    { role: "user", content: "Explain AI in simple terms" }
  ];

  try {
    const response = await provider.chat(messages);
    console.log("Response:", response);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 1.3: Ollama (Local)
async function exampleOllama() {
  console.log("\n📌 Example 1.3: Ollama Provider (Local)");
  
  const provider = new OllamaProvider("llama3");

  const messages: Message[] = [
    { role: "user", content: "What are the benefits of open source?" }
  ];

  try {
    const response = await provider.chat(messages);
    console.log("Response:", response);
  } catch (error) {
    console.error("Error (Make sure Ollama is running):", error);
  }
}

// Run examples
async function main() {
  console.log("🚀 Basic Chat Examples");
  
  try {
    await exampleOpenAI();
  } catch (e) {
    console.log("OpenAI example skipped");
  }

  try {
    await exampleClaude();
  } catch (e) {
    console.log("Claude example skipped");
  }

  try {
    await exampleOllama();
  } catch (e) {
    console.log("Ollama example skipped");
  }
}

main().catch(console.error);
