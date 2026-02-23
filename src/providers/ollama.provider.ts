import { LLMProvider } from "../core/llm";
import { Message } from "../core/types";

export class OllamaProvider implements LLMProvider {
  name = "ollama";

  constructor(private model: string) {}

  async chat(messages: Message[]): Promise<string> {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages,
      }),
    });

    const data = await response.json();
    return data.message?.content ?? "";
  }
}