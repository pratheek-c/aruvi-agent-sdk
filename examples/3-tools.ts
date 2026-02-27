/**
 * Example 3: Creating and Using Tools
 * Shows how to create custom tools and register them with agents
 */

import { Agent, OpenAIProvider } from "aruvi-agent-sdk";
import type { Tool } from "aruvi-agent-sdk";

// Example 3.1: Calculator Tool
const calculatorTool: Tool = {
  name: "calculator",
  description: "Performs arithmetic operations (add, subtract, multiply, divide)",
  async execute(args: any) {
    const { operation, a, b } = args;

    switch (operation?.toLowerCase()) {
      case "add":
        return (a + b).toString();
      case "subtract":
        return (a - b).toString();
      case "multiply":
        return (a * b).toString();
      case "divide":
        return b !== 0 ? (a / b).toString() : "Division by zero";
      default:
        return "Unknown operation";
    }
  }
};

// Example 3.2: Weather Tool (Mock)
const weatherTool: Tool = {
  name: "get_weather",
  description: "Gets the current weather for a city",
  async execute(args: any) {
    const { city } = args;

    // Mock data
    const weatherData: { [key: string]: string } = {
      "new york": "72°F, Sunny",
      "london": "15°C, Cloudy",
      "tokyo": "28°C, Rainy",
      "paris": "18°C, Clear",
      "sydney": "25°C, Sunny"
    };

    return weatherData[city?.toLowerCase()] || "Weather data not available";
  }
};

// Example 3.3: Timestamp Tool
const timestampTool: Tool = {
  name: "get_timestamp",
  description: "Returns the current Unix timestamp and formatted date",
  async execute() {
    const now = new Date();
    return JSON.stringify({
      timestamp: Math.floor(now.getTime() / 1000),
      formatted: now.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }
};

// Example: Using an agent with tools
async function exampleAgentWithTools() {
  console.log("\n📌 Example 3: Agent with Tools");

  const provider = new OpenAIProvider(
    process.env.OPENAI_API_KEY!,
    "gpt-4o-mini"
  );

  const agent = new Agent(provider, {
    systemPrompt: "You are a helpful assistant that can perform calculations and check weather.",
    maxToolIterations: 5
  });

  // Register tools
  agent.registerTool(calculatorTool);
  agent.registerTool(weatherTool);
  agent.registerTool(timestampTool);

  try {
    console.log("Running agent with query...\n");
    
    const result = await agent.run(
      "What is 45 * 12? Also, what's the weather in Tokyo?"
    );
    
    console.log("Agent Result:", result);
  } catch (error) {
    console.error("Agent error:", error);
  }
}

// Example: Multiple tool usage
async function exampleMultipleTools() {
  console.log("\n📌 Example 3b: Complex Tool Usage");

  const provider = new OpenAIProvider(
    process.env.OPENAI_API_KEY!,
    "gpt-4o-mini"
  );

  const agent = new Agent(provider, {
    systemPrompt: "You are a helpful assistant with access to various tools.",
    maxToolIterations: 8
  });

  agent.registerTool(calculatorTool);
  agent.registerTool(weatherTool);
  agent.registerTool(timestampTool);

  try {
    const result = await agent.run(
      "Calculate 100 / 4, then tell me the weather in London, and finally give me the current time"
    );
    
    console.log("Agent Result:", result);
  } catch (error) {
    console.error("Agent error:", error);
  }
}

// Run examples
async function main() {
  console.log("🚀 Tools and Agents Examples");

  try {
    await exampleAgentWithTools();
  } catch (error) {
    console.error("Error:", error);
  }

  try {
    await exampleMultipleTools();
  } catch (error) {
    console.error("Error:", error);
  }
}

main().catch(console.error);
