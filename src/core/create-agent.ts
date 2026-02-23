import { Agent } from "./agent";
import { AgentConfig } from "./types";
import { MimoProvider } from "../providers/mimo.provider";

export function createMimoAgent(
  config: AgentConfig
) {
  const provider = new MimoProvider(
    Bun.env.MIMO_API_KEY!,
    config.model
  );

  return new Agent(config, provider);
}