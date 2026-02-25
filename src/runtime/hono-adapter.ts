import { Hono } from "hono";
import { Agent } from "../core/agent";
import { Tool } from "../core/types";
import { LLMProvider } from "../core/llm";

export interface HonoAgentConfig {
  provider: LLMProvider;
  systemPrompt: string;
  tools?: Tool[];
  maxToolIterations?: number;
  basePath?: string; // optional route prefix
}

export function createHonoAgentApp(config: HonoAgentConfig) {
  const agent = new Agent(config.provider, {
    systemPrompt: config.systemPrompt,
    maxToolIterations: config.maxToolIterations,
  });

  config.tools?.forEach((tool) => agent.registerTool(tool));

  const app = new Hono();
  const base = config.basePath ?? "/agent";

  // Health
  app.get(`${base}/health`, (c) =>
    c.json({
      status: "ok",
      provider: config.provider.name,
    })
  );

  // Chat
  app.post(`${base}/chat`, async (c) => {
    try {
      const body = await c.req.json();
      const message = body.message;

      if (!message) {
        return c.json(
          { success: false, error: "message is required" },
          400
        );
      }

      const reply = await agent.run(message);

      return c.json({
        success: true,
        provider: config.provider.name,
        reply,
      });
    } catch (err: any) {
      return c.json(
        {
          success: false,
          error: err.message,
        },
        500
      );
    }
  });

  return app;
}