/**
 * Example 2: Streaming Responses
 * Demonstrates real-time streaming from different providers
 */

import { OpenAIProvider } from "../src/providers/openai.provider";
import { ClaudeProvider } from "../src/providers/claude.provider";
import { OllamaProvider } from "../src/providers/ollama.provider";
import { Message } from "../src/core/types";

// Example 2.1: Stream from OpenAI
async function streamOpenAI() {
  console.log("\n📌 Example 2.1: Streaming from OpenAI");
  
  const provider = new OpenAIProvider(
    process.env.OPENAI_API_KEY!,
    "gpt-4o-mini"
  );

  const messages: Message[] = [
    { role: "user", content: "Write a haiku about technology" }
  ];

  try {
    console.log("Response (streaming): ");
    for await (const chunk of provider.stream!(messages)) {
      process.stdout.write(chunk);
    }
    console.log("\n✓ Streaming completed\n");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 2.2: Stream and collect
async function streamAndCollect() {
  console.log("\n📌 Example 2.2: Stream and Collect Response");
  
  const provider = new ClaudeProvider(
    process.env.ANTHROPIC_API_KEY!,
    "claude-3-sonnet-20240229"
  );

  const messages: Message[] = [
    { role: "user", content: "List 5 programming languages and brief descriptions" }
  ];

  try {
    let fullResponse = "";
    let chunkCount = 0;

    for await (const chunk of provider.stream!(messages)) {
      fullResponse += chunk;
      chunkCount++;
    }

    console.log("Full Response:", fullResponse);
    console.log(`Received ${chunkCount} chunks`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 2.3: Streaming with progress indicator
async function streamWithProgress() {
  console.log("\n📌 Example 2.3: Streaming with Progress");
  
  const provider = new OllamaProvider("llama3");

  const messages: Message[] = [
    { role: "user", content: "Explain quantum computing" }
  ];

  try {
    console.log("Streaming: ");
    let chunkCount = 0;

    for await (const chunk of provider.stream!(messages)) {
      process.stdout.write(chunk);
      chunkCount++;

      // Show progress every 10 chunks
      if (chunkCount % 10 === 0) {
        process.stdout.write(` [${chunkCount} chunks]`);
      }
    }

    console.log(`\n✓ Completed with ${chunkCount} total chunks`);
  } catch (error) {
    console.error("Error (make sure Ollama is running):", error);
  }
}

// Run examples
async function main() {
  console.log("🚀 Streaming Examples");

  try {
    await streamOpenAI();
  } catch (e) {
    console.log("OpenAI streaming example skipped");
  }

  try {
    await streamAndCollect();
  } catch (e) {
    console.log("Collect example skipped");
  }

  try {
    await streamWithProgress();
  } catch (e) {
    console.log("Ollama streaming example skipped");
  }
}

main().catch(console.error);
