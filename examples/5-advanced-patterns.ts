/**
 * Example 5: Advanced Patterns
 * Shows fallback providers, load balancing, and multi-turn conversations
 */

import { OpenAIProvider, ClaudeProvider, OllamaProvider } from "aruvi-agent-sdk";
import type { LLMProvider, Message } from "aruvi-agent-sdk";

// Example 5.1: Provider Fallback Pattern
async function exampleFallback() {
  console.log("\n📌 Example 5.1: Provider Fallback");

  const primaryProvider = new OpenAIProvider(
    process.env.OPENAI_API_KEY!,
    "gpt-4o-mini"
  );

  const fallbackProvider = new OllamaProvider("llama3");

  async function chatWithFallback(messages: Message[]): Promise<string> {
    try {
      console.log("Trying primary provider (OpenAI)...");
      return await primaryProvider.chat(messages);
    } catch (error) {
      console.log("Primary failed, using fallback (Ollama)...");
      return await fallbackProvider.chat(messages);
    }
  }

  try {
    const response = await chatWithFallback([
      { role: "user", content: "Hello!" }
    ]);
    console.log("Response:", response);
  } catch (error) {
    console.error("Both providers failed");
  }
}

// Example 5.2: Load Balancing
async function exampleLoadBalancing() {
  console.log("\n📌 Example 5.2: Load Balancing");

  const providers: LLMProvider[] = [
    new OpenAIProvider(
      process.env.OPENAI_API_KEY!,
      "gpt-4o-mini"
    ),
    new ClaudeProvider(
      process.env.ANTHROPIC_API_KEY!,
      "claude-3-sonnet-20240229"
    ),
    new OllamaProvider("llama3")
  ];

  function selectProvider(): LLMProvider {
    return providers[Math.floor(Math.random() * providers.length)];
  }

  try {
    for (let i = 0; i < 3; i++) {
      const provider = selectProvider();
      console.log(`Request ${i + 1}: Using ${provider.name}`);

      const response = await provider.chat([
        { role: "user", content: "What model are you?" }
      ]);
      
      console.log(`Response: ${response.substring(0, 100)}...`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 5.3: Multi-Turn Conversation
async function exampleMultiTurn() {
  console.log("\n📌 Example 5.3: Multi-Turn Conversation");

  const provider = new OpenAIProvider(
    process.env.OPENAI_API_KEY!,
    "gpt-4o-mini"
  );

  const messages: Message[] = [
    { role: "system", content: "You are a helpful assistant that knows about programming." }
  ];

  const conversations = [
    "What is TypeScript?",
    "How is it different from JavaScript?",
    "Can you give me a code example?"
  ];

  try {
    for (const userMessage of conversations) {
      console.log(`\nUser: ${userMessage}`);

      // Add user message
      messages.push({ role: "user", content: userMessage });

      // Get response
      const response = await provider.chat(messages);
      console.log(`Assistant: ${response}`);

      // Add assistant response
      messages.push({ role: "assistant", content: response });
    }

    console.log("\n✓ Conversation completed");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 5.4: Parallel Requests
async function exampleParallel() {
  console.log("\n📌 Example 5.4: Parallel Requests");

  const providers = [
    new OpenAIProvider(
      process.env.OPENAI_API_KEY!,
      "gpt-4o-mini"
    ),
    new ClaudeProvider(
      process.env.ANTHROPIC_API_KEY!,
      "claude-3-sonnet-20240229"
    )
  ];

  const messages: Message[] = [
    { role: "user", content: "What makes a good programming language? (One sentence)" }
  ];

  try {
    console.log("Sending requests to multiple providers in parallel...\n");

    const results = await Promise.all(
      providers.map(async (provider) => ({
        provider: provider.name,
        response: await provider.chat(messages)
      }))
    );

    results.forEach(({ provider, response }) => {
      console.log(`${provider}:`);
      console.log(`  ${response}\n`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 5.5: Streaming with Chunking
async function exampleStreamingChunks() {
  console.log("\n📌 Example 5.5: Streaming with Chunking");

  const provider = new OpenAIProvider(
    process.env.OPENAI_API_KEY!,
    "gpt-4o-mini"
  );

  const messages: Message[] = [
    { role: "user", content: "Write a short poem about coding (3 lines)" }
  ];

  try {
    console.log("Poem:\n");
    let totalContent = "";

    for await (const chunk of provider.stream!(messages)) {
      totalContent += chunk;
      process.stdout.write(chunk);
    }

    console.log("\n\n✓ Streaming completed");
    console.log(`Total characters: ${totalContent.length}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run examples
async function main() {
  console.log("🚀 Advanced Pattern Examples");

  try {
    await exampleFallback();
  } catch (e) {
    console.log("Fallback example skipped");
  }

  try {
    await exampleLoadBalancing();
  } catch (e) {
    console.log("Load balancing example skipped");
  }

  try {
    await exampleMultiTurn();
  } catch (e) {
    console.log("Multi-turn example skipped");
  }

  try {
    await exampleParallel();
  } catch (e) {
    console.log("Parallel example skipped");
  }

  try {
    await exampleStreamingChunks();
  } catch (e) {
    console.log("Streaming example skipped");
  }
}

main().catch(console.error);
