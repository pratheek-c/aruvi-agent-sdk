import { LLMProvider } from "../core/llm";
import { Message } from "../core/types";

export class OpenRouterProvider implements LLMProvider {
  name = "openrouter";

  constructor(
    private apiKey: string,
    private model: string,
    private siteUrl?: string,   // optional but recommended
    private siteName?: string   // optional but recommended
  ) {}

  async chat(messages: Message[]): Promise<string> {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...(this.siteUrl && { "HTTP-Referer": this.siteUrl }),
          ...(this.siteName && { "X-Title": this.siteName }),
        },
        body: JSON.stringify({
          model: this.model,
          messages,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenRouter Error ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    return data.choices?.[0]?.message?.content ?? "";
  }

  async *stream(messages: Message[]): AsyncGenerator<string> {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
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