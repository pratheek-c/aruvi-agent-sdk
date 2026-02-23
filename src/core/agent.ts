import { Tool, AgentConfig, Message } from "./types";
import { LLMProvider } from "./llm";

export class Agent {
  private tools: Tool[] = [];
  private maxIterations: number;

  constructor(
    private provider: LLMProvider,
    private config: AgentConfig
  ) {
    this.maxIterations = config.maxToolIterations ?? 3;
  }

  registerTool(tool: Tool) {
    this.tools.push(tool);
  }

  private buildSystemPrompt() {
    const toolDescriptions = this.tools
      .map(
        (t) =>
          `Tool: ${t.name}\nDescription: ${t.description}`
      )
      .join("\n\n");

    return `
${this.config.systemPrompt}

Available Tools:
${toolDescriptions}

If a tool is required, respond ONLY in JSON:

{
  "tool": "tool_name",
  "arguments": { ... }
}
`;
  }

  async run(input: string): Promise<string> {
    let messages: Message[] = [
      { role: "system", content: this.buildSystemPrompt() },
      { role: "user", content: input },
    ];

    for (let i = 0; i < this.maxIterations; i++) {
      const response = await this.provider.chat(messages);

      try {
        const parsed = JSON.parse(response);

        if (parsed.tool) {
          const tool = this.tools.find(
            (t) => t.name === parsed.tool
          );

          if (!tool) return "Tool not found";

          const result = await tool.execute(
            parsed.arguments
          );

          messages.push({
            role: "assistant",
            content: response,
          });

          messages.push({
            role: "user",
            content: `Tool result: ${result}. Provide final answer.`,
          });

          continue;
        }
      } catch {
        return response;
      }

      return response;
    }

    return "Max tool iterations reached.";
  }
}