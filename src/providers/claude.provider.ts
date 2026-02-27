import { LLMProvider } from "../core/llm";
import { Message } from "../core/types";

export class ClaudeProvider implements LLMProvider {
  name = "claude";

  constructor(
    private apiKey: string,
    private model: string
  ) {}

  async chat(messages: Message[]): Promise<string> {
    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1024,
          messages,
        }),
      }
    );

    const data = await response.json();
    return data.content?.[0]?.text ?? "";
  }

  async *stream(messages: Message[]): AsyncGenerator<string> {
    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1024,
          messages,
          stream: true,
        }),
      }
    );

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