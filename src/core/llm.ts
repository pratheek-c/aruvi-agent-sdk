import { Message } from "./types";

export interface LLMProvider {
  name: string;

  chat(messages: Message[]): Promise<string>;

  // NEW: Optional streaming
  stream?(messages: Message[]): AsyncGenerator<string>;
}