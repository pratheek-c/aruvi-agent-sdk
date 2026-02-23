export type Role = "system" | "user" | "assistant";

export interface Message {
  role: Role;
  content: string;
}

export interface Tool {
  name: string;
  description: string;
  execute(args: any): Promise<string>;
}

export interface AgentConfig {
  systemPrompt: string;
  maxToolIterations?: number;
}