import { LLMProvider } from "../core/llm";

export class MimoProvider implements LLMProvider {
    name = "xiaomi-mimo";
  constructor(
    private apiKey: string,
    private model: string
  ) {}
    

  async chat(messages: any[]): Promise<string> {
    const response = await fetch(
      "https://api.xiaomimimo.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: false,
        }),
      }
    );

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
  }
}