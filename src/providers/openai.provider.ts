import { LLMProvider } from "../core/llm";
import { Message } from "../core/types";

export class OpenAIProvider implements LLMProvider {
  name = "openai";

  constructor(
    private apiKey: string,
    private model: string
  ) {}

  async chat(messages: Message[]): Promise<string> {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages,
        }),
      }
    );

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
  }

  async *stream(messages: Message[]): AsyncGenerator<string> {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
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