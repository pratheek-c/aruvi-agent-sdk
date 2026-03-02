import { Hono } from "hono";
import { Scalar } from "@scalar/hono-api-reference";
import type { StoolapMemory } from "../memory/stoolap-memory.js";
import { openApiSpec } from "./openapi-spec.js";

/**
 * Mount memory inspection REST routes onto a Hono app.
 *
 * Usage:
 *   import { createMemoryApi } from "aruvi-agent-sdk/runtime";
 *   const app  = new Hono();
 *   const mem  = new StoolapMemory({ dbPath: "./my-db" });
 *   await mem.init();
 *   app.route("/memory", createMemoryApi(mem));
 *
 * Endpoints (all relative to the mounted path):
 *
 *   GET  /chats                          list sessions (qs: agent_name, agent_id)
 *   POST /chats                          create a session
 *   GET  /chats/:chatId                  get one session
 *   PUT  /chats/:chatId                  update heading
 *   DELETE /chats/:chatId                delete session + messages
 *
 *   GET  /chats/:chatId/messages         list messages
 *   POST /chats/:chatId/messages         add a message
 *   DELETE /chats/:chatId/messages       clear messages
 *
 *   GET  /embeddings                     list entries (qs: agent_name, agent_id, chat_id)
 *   POST /embeddings                     store an embedding
 *   POST /embeddings/search              cosine similarity search
 *
 *   GET  /health                         liveness check
 */
export function createMemoryApi(memory: StoolapMemory): Hono {
  const api = new Hono();

  // ── Health ─────────────────────────────────────────────────────────────────

  api.get("/health", (c) => c.json({ status: "ok", service: "aruvi-memory" }));

  // ── Chats ──────────────────────────────────────────────────────────────────

  api.get("/chats", async (c) => {
    const agentName = c.req.query("agent_name");
    const agentId = c.req.query("agent_id");
    const chats = await memory.listChats({
      ...(agentName ? { agentName } : {}),
      ...(agentId ? { agentId } : {}),
    });
    return c.json({ chats, count: chats.length });
  });

  api.post("/chats", async (c) => {
    const body = await c.req.json<{
      chatId?: string;
      chatHeading: string;
      agentName: string;
      agentId: string;
    }>();
    if (!body.chatHeading || !body.agentName || !body.agentId) {
      return c.json(
        { error: "chatHeading, agentName and agentId are required" },
        400
      );
    }
    const chatId = await memory.createChat(body);
    const chat = await memory.getChat(chatId);
    return c.json(chat, 201);
  });

  api.get("/chats/:chatId", async (c) => {
    const chat = await memory.getChat(c.req.param("chatId"));
    if (!chat) return c.json({ error: "Chat not found" }, 404);
    return c.json(chat);
  });

  api.put("/chats/:chatId", async (c) => {
    const body = await c.req.json<{ chatHeading: string }>();
    if (!body.chatHeading) {
      return c.json({ error: "chatHeading is required" }, 400);
    }
    await memory.updateChatHeading(c.req.param("chatId"), body.chatHeading);
    const chat = await memory.getChat(c.req.param("chatId"));
    return c.json(chat);
  });

  api.delete("/chats/:chatId", async (c) => {
    await memory.deleteChat(c.req.param("chatId"));
    return c.json({ deleted: true, chatId: c.req.param("chatId") });
  });

  // ── Messages ───────────────────────────────────────────────────────────────

  api.get("/chats/:chatId/messages", async (c) => {
    const messages = await memory.getMessages(c.req.param("chatId"));
    return c.json({ messages, count: messages.length });
  });

  api.post("/chats/:chatId/messages", async (c) => {
    const chatId = c.req.param("chatId");
    const body = await c.req.json<{
      agentName: string;
      agentId: string;
      role: "system" | "user" | "assistant";
      content: string;
    }>();
    if (!body.agentName || !body.agentId || !body.role || !body.content) {
      return c.json(
        { error: "agentName, agentId, role and content are required" },
        400
      );
    }
    const id = await memory.addMessage({ chatId, ...body });
    return c.json({ id }, 201);
  });

  api.delete("/chats/:chatId/messages", async (c) => {
    await memory.clearMessages(c.req.param("chatId"));
    return c.json({ cleared: true, chatId: c.req.param("chatId") });
  });

  // ── Embeddings ─────────────────────────────────────────────────────────────

  api.get("/embeddings", async (c) => {
    const agentName = c.req.query("agent_name");
    const agentId = c.req.query("agent_id");
    const chatId = c.req.query("chat_id");
    const entries = await memory.listEmbeddings({
      ...(agentName ? { agentName } : {}),
      ...(agentId ? { agentId } : {}),
      ...(chatId ? { chatId } : {}),
    });
    return c.json({ embeddings: entries, count: entries.length });
  });

  api.post("/embeddings", async (c) => {
    const body = await c.req.json<{
      chatId: string;
      agentName: string;
      agentId: string;
      content: string;
      embedding: number[];
      metadata?: Record<string, unknown>;
    }>();
    if (
      !body.chatId ||
      !body.agentName ||
      !body.agentId ||
      !body.content ||
      !Array.isArray(body.embedding)
    ) {
      return c.json(
        {
          error:
            "chatId, agentName, agentId, content and embedding (array) are required",
        },
        400
      );
    }
    const id = await memory.addEmbedding(body);
    return c.json({ id }, 201);
  });

  /** POST /embeddings/search  { embedding: number[], topK?: number, agentName?, agentId?, chatId? } */
  api.post("/embeddings/search", async (c) => {
    const body = await c.req.json<{
      embedding: number[];
      topK?: number;
      agentName?: string;
      agentId?: string;
      chatId?: string;
    }>();
    if (!Array.isArray(body.embedding)) {
      return c.json({ error: "embedding (array) is required" }, 400);
    }
    const results = await memory.searchSimilar(
      body.embedding,
      body.topK ?? 5,
      {
        ...(body.agentName ? { agentName: body.agentName } : {}),
        ...(body.agentId ? { agentId: body.agentId } : {}),
        ...(body.chatId ? { chatId: body.chatId } : {}),
      }
    );
    return c.json({ results, count: results.length });
  });

  // ── API Documentation (Scalar) ─────────────────────────────────────────────

  /** GET /openapi.json — raw OpenAPI 3.0 spec */
  api.get("/openapi.json", (c) =>
    c.json(openApiSpec)
  );

  /**
   * GET /api — Interactive Scalar API reference UI.
   *
   * Scalar renders the OpenAPI spec with a full-featured interactive playground:
   * - Try out every endpoint directly from the browser
   * - Inspect request/response schemas
   * - See example payloads
   *
   * When this module is mounted at /memory, the docs live at:
   *   http://localhost:<port>/memory/api
   */
  api.get(
    "/api",
    Scalar({
      url: "./openapi.json",
      theme: "elysiajs",
      pageTitle: "Aruvi Agent SDK — API Reference",
    })
  );

  return api;
}
