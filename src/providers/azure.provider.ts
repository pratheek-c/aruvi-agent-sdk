import { LLMProvider } from "../core/llm";
import { Message } from "../core/types";

export class AzureProvider implements LLMProvider {
  name = "azure";

  constructor(
    private apiKey: string,
    private endpoint: string,
    private deployment: string,
    private apiVersion: string
  ) {}

  async chat(messages: Message[]): Promise<string> {
    const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
  }
}