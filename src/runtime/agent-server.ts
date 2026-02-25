import { ExecutionContext, Hono } from "hono";
import { Agent } from "../core/agent";
import { Tool } from "../core/types";
import { LLMProvider } from "../core/llm";

interface ServerConfig {
  provider: LLMProvider;
  systemPrompt: string;
  tools?: Tool[];
  maxToolIterations?: number;
}

export function createAgentServer(config: ServerConfig) {
  const agent = new Agent(config.provider, {
    systemPrompt: config.systemPrompt,
    maxToolIterations: config.maxToolIterations,
  });

  // Auto-register tools
  config.tools?.forEach((tool) => agent.registerTool(tool));

  const app = new Hono();

  // Health check
  app.get("/health", (c) =>
    c.json({ status: "ok", provider: config.provider.name })
  );

  // Generic agent endpoint
  app.post("/agent/chat", async (c) => {
    try {
      const body = await c.req.json();
      const message = body.message;

      if (!message) {
        return c.json({ error: "message is required" }, 400);
      }

      const result = await agent.run(message);

      return c.json({
        success: true,
        provider: config.provider.name,
        reply: result,
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

  return {
    app,
    start(port: number) {
      serve({ fetch: app.fetch, port });
      console.log(
        `🚀 Agent Server running on http://localhost:${port}`
      );
    },
  };
}

function serve(arg0: { fetch: (request: Request, Env?: unknown, executionCtx?: ExecutionContext) => Response | Promise<Response>; port: number; }) {
    throw new Error("Function not implemented.");
}
