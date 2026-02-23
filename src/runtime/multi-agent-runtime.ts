import { Hono } from "hono";
import { Agent } from "../core/agent";
import { Tool } from "../core/types";
import { LLMProvider } from "../core/llm";

interface AgentConfig {
  name: string;
  provider: LLMProvider;
  systemPrompt: string;
  tools?: Tool[];
  maxToolIterations?: number;
}

export function createMultiAgentRuntime(configs: AgentConfig[]) {
  const app = new Hono();
  const agents = new Map<string, Agent>();

  // Register agents
  for (const cfg of configs) {
    const agent = new Agent(cfg.provider, {
      systemPrompt: cfg.systemPrompt,
      maxToolIterations: cfg.maxToolIterations,
    });

    cfg.tools?.forEach((tool) => agent.registerTool(tool));

    agents.set(cfg.name, agent);
  }

  // Health
  app.get("/agent/:name/health", (c) => {
    const name = c.req.param("name");
    if (!agents.has(name)) {
      return c.json({ error: "Agent not found" }, 404);
    }

    return c.json({
      status: "ok",
      agent: name,
    });
  });

  // Normal Chat
  app.post("/agent/:name/chat", async (c) => {
    const name = c.req.param("name");
    const agent = agents.get(name);

    if (!agent) {
      return c.json({ error: "Agent not found" }, 404);
    }

    const body = await c.req.json();
    const message = body.message;

    if (!message) {
      return c.json({ error: "message required" }, 400);
    }

    const reply = await agent.run(message);

    return c.json({
      success: true,
      agent: name,
      reply,
    });
  });

  // 🔥 Streaming Chat
  app.post("/agent/:name/stream", async (c) => {
    const name = c.req.param("name");
    const agent = agents.get(name);

    if (!agent) {
      return c.json({ error: "Agent not found" }, 404);
    }

    const body = await c.req.json();
    const message = body.message;

    if (!message) {
      return c.json({ error: "message required" }, 400);
    }

    const provider = (agent as any).provider;

    if (!provider.stream) {
      return c.json(
        { error: "Streaming not supported by provider" },
        400
      );
    }

    const stream = provider.stream([
      { role: "system", content: (agent as any).buildSystemPrompt?.() ?? "" },
      { role: "user", content: message },
    ]);

    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            controller.enqueue(
              new TextEncoder().encode(chunk)
            );
          }
          controller.close();
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain",
          "Transfer-Encoding": "chunked",
        },
      }
    );
  });

  return app;
}