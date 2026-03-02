/**
 * OpenAPI 3.0 specification for the Aruvi Agent SDK.
 *
 * Covers:
 *   - Multi-agent runtime  (/agent/:name/*)
 *   - Memory API           (/memory/*)
 */

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Aruvi Agent SDK",
    version: "1.0.1",
    description: `
## Overview

**Aruvi Agent SDK** is a provider-agnostic AI agent framework with built-in persistent memory and vector search.

### Features
- 🤖 **Multi-provider LLM** — OpenAI, Claude, Azure, Ollama, OpenRouter, Mimo
- 🔄 **Streaming** — Server-Sent Events for real-time responses
- 🛠 **Tool Calling** — Register custom tools that agents can invoke
- 🧠 **Persistent Memory** — Stoolap-backed SQL + vector store
- 🔍 **Vector Search** — HNSW cosine similarity via \`@stoolap/node\`

### Quick Start

\`\`\`ts
import { OpenAIProvider, Agent, StoolapMemory } from "aruvi-agent-sdk";

const provider = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY!, model: "gpt-4o" });
const agent    = new Agent(provider, { systemPrompt: "You are a helpful assistant." });

const mem = new StoolapMemory({ dbPath: "./my-db" });
await mem.init();

const chatId = await mem.createChat({ chatHeading: "First session", agentName: "bot", agentId: "1" });
const reply  = await agent.run("Hello!");
await mem.addMessage({ chatId, agentName: "bot", agentId: "1", role: "assistant", content: reply });
\`\`\`
    `.trim(),
    contact: {
      name: "Pratheek",
      url: "https://github.com/pratheek-c/aruvi-agent-sdk",
    },
    license: { name: "MIT" },
  },

  servers: [
    { url: "http://localhost:3000", description: "Local development server" },
  ],

  tags: [
    {
      name: "Agent",
      description:
        "Interact with named AI agents — single turn chat and streaming responses.",
    },
    {
      name: "Memory · Chats",
      description:
        "Manage chat sessions keyed by agent name / agent ID. Each session stores a heading and timestamps.",
    },
    {
      name: "Memory · Messages",
      description: "Store and retrieve per-session chat history.",
    },
    {
      name: "Memory · Embeddings",
      description:
        "Vector store endpoints. Push float32 embeddings and run cosine similarity search via HNSW.",
    },
    { name: "Health", description: "Liveness probes." },
  ],

  paths: {
    // ── Agent ────────────────────────────────────────────────────────────────
    "/agent/{name}/health": {
      get: {
        tags: ["Agent"],
        summary: "Agent health check",
        description: "Returns `200 ok` when the named agent is registered.",
        operationId: "agentHealth",
        parameters: [{ $ref: "#/components/parameters/agentName" }],
        responses: {
          "200": {
            description: "Agent is healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
                example: { status: "ok", agent: "my-agent" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    "/agent/{name}/chat": {
      post: {
        tags: ["Agent"],
        summary: "Single-turn chat",
        description:
          "Send a message to a named agent and receive a complete text response. The agent resolves tool calls internally before returning.",
        operationId: "agentChat",
        parameters: [{ $ref: "#/components/parameters/agentName" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChatRequest" },
              example: { message: "What is the capital of France?" },
            },
          },
        },
        responses: {
          "200": {
            description: "Agent reply",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChatResponse" },
                example: {
                  success: true,
                  agent: "my-agent",
                  reply: "The capital of France is Paris.",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    "/agent/{name}/stream": {
      post: {
        tags: ["Agent"],
        summary: "Streaming chat (SSE)",
        description:
          "Stream the agent response token-by-token using Server-Sent Events. Each event contains a `data` field with a text chunk. The stream ends with `data: [DONE]`.",
        operationId: "agentStream",
        parameters: [{ $ref: "#/components/parameters/agentName" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChatRequest" },
              example: { message: "Tell me a short story." },
            },
          },
        },
        responses: {
          "200": {
            description: "SSE stream of text chunks",
            content: {
              "text/event-stream": {
                schema: { type: "string" },
                example: "data: Once upon a time...\n\ndata: [DONE]\n\n",
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    // ── Memory health ────────────────────────────────────────────────────────
    "/memory/health": {
      get: {
        tags: ["Health"],
        summary: "Memory API health check",
        operationId: "memoryHealth",
        responses: {
          "200": {
            description: "Memory service is healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
                example: { status: "ok", service: "aruvi-memory" },
              },
            },
          },
        },
      },
    },

    // ── Chats ────────────────────────────────────────────────────────────────
    "/memory/chats": {
      get: {
        tags: ["Memory · Chats"],
        summary: "List chat sessions",
        description:
          "Returns all chat sessions. Filter by `agent_name` and/or `agent_id` via query params.",
        operationId: "listChats",
        parameters: [
          {
            name: "agent_name",
            in: "query",
            schema: { type: "string" },
            example: "customer-support",
          },
          {
            name: "agent_id",
            in: "query",
            schema: { type: "string" },
            example: "agent-001",
          },
        ],
        responses: {
          "200": {
            description: "List of chat sessions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    chats: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ChatSession" },
                    },
                    count: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Memory · Chats"],
        summary: "Create a chat session",
        description:
          "Opens a new conversation session. Optionally supply a `chatId` (UUID); one is generated if omitted.",
        operationId: "createChat",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateChatRequest" },
              example: {
                chatHeading: "Support request #42",
                agentName: "support-bot",
                agentId: "agent-001",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created session",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChatSession" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },

    "/memory/chats/{chatId}": {
      get: {
        tags: ["Memory · Chats"],
        summary: "Get one chat session",
        operationId: "getChat",
        parameters: [{ $ref: "#/components/parameters/chatId" }],
        responses: {
          "200": {
            description: "Chat session",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChatSession" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        tags: ["Memory · Chats"],
        summary: "Update chat heading",
        operationId: "updateChat",
        parameters: [{ $ref: "#/components/parameters/chatId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["chatHeading"],
                properties: { chatHeading: { type: "string" } },
              },
              example: { chatHeading: "Billing issue — resolved" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated session",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChatSession" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
      delete: {
        tags: ["Memory · Chats"],
        summary: "Delete chat session",
        description: "Deletes the session, all its messages, and all its embeddings.",
        operationId: "deleteChat",
        parameters: [{ $ref: "#/components/parameters/chatId" }],
        responses: {
          "200": {
            description: "Deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    deleted: { type: "boolean" },
                    chatId: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Messages ─────────────────────────────────────────────────────────────
    "/memory/chats/{chatId}/messages": {
      get: {
        tags: ["Memory · Messages"],
        summary: "Get messages in a chat",
        description:
          "Returns all messages for the given chat in chronological order (oldest first).",
        operationId: "getMessages",
        parameters: [{ $ref: "#/components/parameters/chatId" }],
        responses: {
          "200": {
            description: "Messages",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    messages: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ChatMessage" },
                    },
                    count: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Memory · Messages"],
        summary: "Add a message",
        operationId: "addMessage",
        parameters: [{ $ref: "#/components/parameters/chatId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddMessageRequest" },
              example: {
                agentName: "support-bot",
                agentId: "agent-001",
                role: "user",
                content: "My order hasn't arrived.",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Inserted row ID",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { id: { type: "integer" } },
                },
                example: { id: 7 },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
      delete: {
        tags: ["Memory · Messages"],
        summary: "Clear all messages in a chat",
        operationId: "clearMessages",
        parameters: [{ $ref: "#/components/parameters/chatId" }],
        responses: {
          "200": {
            description: "Cleared",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    cleared: { type: "boolean" },
                    chatId: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Embeddings ───────────────────────────────────────────────────────────
    "/memory/embeddings": {
      get: {
        tags: ["Memory · Embeddings"],
        summary: "List embeddings",
        description: "Returns embedding metadata without the raw vector array. Filter by `agent_name`, `agent_id`, or `chat_id`.",
        operationId: "listEmbeddings",
        parameters: [
          {
            name: "agent_name",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "agent_id",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "chat_id",
            in: "query",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Embedding list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    embeddings: {
                      type: "array",
                      items: { $ref: "#/components/schemas/EmbeddingMeta" },
                    },
                    count: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Memory · Embeddings"],
        summary: "Store an embedding",
        description:
          "Persist a float32 vector alongside its source text. The `embedding` array length must match the `vectorDimensions` you configured (default 1536).",
        operationId: "addEmbedding",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddEmbeddingRequest" },
              example: {
                chatId: "chat-uuid-here",
                agentName: "support-bot",
                agentId: "agent-001",
                content: "My order hasn't arrived.",
                embedding: [0.021, -0.014, 0.009],
                metadata: { source: "user-message", turn: 3 },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Inserted row ID",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { id: { type: "integer" } },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },

    "/memory/embeddings/search": {
      post: {
        tags: ["Memory · Embeddings"],
        summary: "Vector similarity search",
        description:
          "Performs cosine similarity search using the HNSW index. Returns the `topK` most similar entries. Lower `score` = more similar (cosine distance).",
        operationId: "searchEmbeddings",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SearchRequest" },
              example: {
                embedding: [0.021, -0.014, 0.009],
                topK: 5,
                agentName: "support-bot",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Similarity search results",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    results: {
                      type: "array",
                      items: { $ref: "#/components/schemas/SearchResult" },
                    },
                    count: { type: "integer" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
  },

  components: {
    parameters: {
      agentName: {
        name: "name",
        in: "path",
        required: true,
        description: "The registered agent name",
        schema: { type: "string" },
        example: "my-agent",
      },
      chatId: {
        name: "chatId",
        in: "path",
        required: true,
        description: "UUID of the chat session",
        schema: { type: "string" },
        example: "550e8400-e29b-41d4-a716-446655440000",
      },
    },

    responses: {
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { error: "Agent not found" },
          },
        },
      },
      BadRequest: {
        description: "Validation error — required field missing",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { error: "message required" },
          },
        },
      },
    },

    schemas: {
      ErrorResponse: {
        type: "object",
        properties: { error: { type: "string" } },
        required: ["error"],
      },
      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
          agent: { type: "string" },
          service: { type: "string" },
        },
      },
      ChatRequest: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            description: "The user message to send to the agent",
          },
        },
      },
      ChatResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          agent: { type: "string" },
          reply: { type: "string" },
        },
      },
      ChatSession: {
        type: "object",
        properties: {
          chatId: { type: "string" },
          chatHeading: { type: "string" },
          agentName: { type: "string" },
          agentId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateChatRequest: {
        type: "object",
        required: ["chatHeading", "agentName", "agentId"],
        properties: {
          chatId: {
            type: "string",
            description: "Optional UUID. Auto-generated if omitted.",
          },
          chatHeading: { type: "string" },
          agentName: { type: "string" },
          agentId: { type: "string" },
        },
      },
      ChatMessage: {
        type: "object",
        properties: {
          id: { type: "integer" },
          chatId: { type: "string" },
          agentName: { type: "string" },
          agentId: { type: "string" },
          role: {
            type: "string",
            enum: ["system", "user", "assistant"],
          },
          content: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AddMessageRequest: {
        type: "object",
        required: ["agentName", "agentId", "role", "content"],
        properties: {
          agentName: { type: "string" },
          agentId: { type: "string" },
          role: { type: "string", enum: ["system", "user", "assistant"] },
          content: { type: "string" },
        },
      },
      EmbeddingMeta: {
        type: "object",
        properties: {
          id: { type: "integer" },
          chatId: { type: "string" },
          agentName: { type: "string" },
          agentId: { type: "string" },
          content: { type: "string" },
          metadata: { type: "object" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AddEmbeddingRequest: {
        type: "object",
        required: ["chatId", "agentName", "agentId", "content", "embedding"],
        properties: {
          chatId: { type: "string" },
          agentName: { type: "string" },
          agentId: { type: "string" },
          content: {
            type: "string",
            description: "The source text this vector was computed from",
          },
          embedding: {
            type: "array",
            items: { type: "number" },
            description: "Float32 embedding vector",
          },
          metadata: {
            type: "object",
            description: "Arbitrary key/value pairs stored alongside the vector",
          },
        },
      },
      SearchRequest: {
        type: "object",
        required: ["embedding"],
        properties: {
          embedding: {
            type: "array",
            items: { type: "number" },
            description: "Query vector for similarity search",
          },
          topK: {
            type: "integer",
            default: 5,
            description: "Number of results to return",
          },
          agentName: {
            type: "string",
            description: "Restrict search to a specific agent name",
          },
          agentId: {
            type: "string",
            description: "Restrict search to a specific agent ID",
          },
          chatId: {
            type: "string",
            description: "Restrict search to a specific chat session",
          },
        },
      },
      SearchResult: {
        type: "object",
        properties: {
          id: { type: "integer" },
          chatId: { type: "string" },
          agentName: { type: "string" },
          agentId: { type: "string" },
          content: { type: "string" },
          metadata: { type: "object" },
          score: {
            type: "number",
            description:
              "Cosine distance (0 = identical, 2 = opposite). Lower is more similar.",
          },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
};
