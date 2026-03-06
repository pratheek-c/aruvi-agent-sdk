import { Database } from "@stoolap/node";
import { randomUUID } from "crypto";
import type {
  MemoryConfig,
  ChatSession,
  ChatMessage,
  VectorEntry,
  MemorySearchResult,
  CreateChatOptions,
} from "./types.js";

/**
 * StoolapMemory — persistent agent memory backed by @stoolap/node.
 *
 * Tables
 * ──────
 *  chats      — one row per conversation session
 *  messages   — chat history (role / content)
 *  embeddings — vector store with HNSW similarity search
 */
export class StoolapMemory {
  private db!: InstanceType<typeof Database>;
  private readonly dbPath: string;
  private readonly vectorDimensions: number;
  private initialized = false;

  constructor(config: MemoryConfig = {}) {
    this.dbPath = config.dbPath ?? "./aruvi-memory";
    this.vectorDimensions = config.vectorDimensions ?? 1536;
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  /** Open the database and run schema migrations. Must be awaited before use. */
  async init(): Promise<void> {
    if (this.initialized) return;
    this.db = await Database.open(this.dbPath);
    await this._createSchema();
    this.initialized = true;
  }

  /** Close the database connection. */
  async close(): Promise<void> {
    if (this.initialized) {
      await this.db.close();
      this.initialized = false;
    }
  }

  // ─── Schema ─────────────────────────────────────────────────────────────────

  private async _createSchema(): Promise<void> {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS chats (
        id           INTEGER   PRIMARY KEY AUTOINCREMENT,
        chat_id      TEXT      NOT NULL UNIQUE,
        chat_heading TEXT      NOT NULL,
        agent_name   TEXT      NOT NULL,
        agent_id     TEXT      NOT NULL,
        created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_chats_agent
        ON chats (agent_name, agent_id);

      CREATE TABLE IF NOT EXISTS messages (
        id           INTEGER   PRIMARY KEY AUTOINCREMENT,
        chat_id      TEXT      NOT NULL,
        agent_name   TEXT      NOT NULL,
        agent_id     TEXT      NOT NULL,
        role         TEXT      NOT NULL CHECK (role IN ('system','user','assistant')),
        content      TEXT      NOT NULL,
        created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_messages_chat
        ON messages (chat_id);

      CREATE TABLE IF NOT EXISTS embeddings (
        id           INTEGER          PRIMARY KEY AUTOINCREMENT,
        chat_id      TEXT             NOT NULL,
        agent_name   TEXT             NOT NULL,
        agent_id     TEXT             NOT NULL,
        content      TEXT             NOT NULL,
        embedding    VECTOR(${this.vectorDimensions}) NOT NULL,
        metadata     TEXT             NOT NULL DEFAULT '{}',
        created_at   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_embeddings_hnsw
        ON embeddings (embedding) USING HNSW WITH (metric = 'cosine');

      CREATE INDEX IF NOT EXISTS idx_embeddings_agent
        ON embeddings (agent_name, agent_id);
    `);
  }

  // ─── Chat sessions ───────────────────────────────────────────────────────────

  /**
   * Create a new chat session. Returns the generated (or supplied) chatId.
   */
  async createChat(options: CreateChatOptions): Promise<string> {
    this._assertReady();
    const chatId = options.chatId ?? randomUUID();
    await this.db.execute(
      `INSERT INTO chats (chat_id, chat_heading, agent_name, agent_id)
       VALUES ($1, $2, $3, $4)`,
      [chatId, options.chatHeading, options.agentName, options.agentId]
    );
    return chatId;
  }

  /** Retrieve a single chat session by ID. */
  async getChat(chatId: string): Promise<ChatSession | null> {
    this._assertReady();
    const row = await this.db.queryOne(
      `SELECT chat_id, chat_heading, agent_name, agent_id, created_at, updated_at
       FROM chats WHERE chat_id = $1`,
      [chatId]
    );
    return row ? this._rowToChat(row) : null;
  }

  /** List all chat sessions, optionally filtered by agent. */
  async listChats(filters?: {
    agentName?: string;
    agentId?: string;
  }): Promise<ChatSession[]> {
    this._assertReady();
    const conditions: string[] = [];
    const params: string[] = [];

    if (filters?.agentName) {
      conditions.push(`agent_name = $${params.length + 1}`);
      params.push(filters.agentName);
    }
    if (filters?.agentId) {
      conditions.push(`agent_id = $${params.length + 1}`);
      params.push(filters.agentId);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = await this.db.query(
      `SELECT chat_id, chat_heading, agent_name, agent_id, created_at, updated_at
       FROM chats ${where} ORDER BY updated_at DESC`,
      params
    );
    return (rows as unknown[]).map((r) => this._rowToChat(r as Record<string, unknown>));
  }

  /** Update the heading of a chat session. */
  async updateChatHeading(chatId: string, heading: string): Promise<void> {
    this._assertReady();
    await this.db.execute(
      `UPDATE chats SET chat_heading = $1, updated_at = CURRENT_TIMESTAMP
       WHERE chat_id = $2`,
      [heading, chatId]
    );
  }

  /** Delete a chat session and all its messages. */
  async deleteChat(chatId: string): Promise<void> {
    this._assertReady();
    await this.db.execute(`DELETE FROM messages  WHERE chat_id = $1`, [chatId]);
    await this.db.execute(`DELETE FROM embeddings WHERE chat_id = $1`, [chatId]);
    await this.db.execute(`DELETE FROM chats     WHERE chat_id = $1`, [chatId]);
  }

  // ─── Messages ────────────────────────────────────────────────────────────────

  /** Append a message to a chat session. */
  async addMessage(message: ChatMessage): Promise<number> {
    this._assertReady();
    const result = await this.db.execute(
      `INSERT INTO messages (chat_id, agent_name, agent_id, role, content)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        message.chatId,
        message.agentName,
        message.agentId,
        message.role,
        message.content,
      ]
    );
    // Touch parent chat timestamp
    await this.db.execute(
      `UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE chat_id = $1`,
      [message.chatId]
    );
    return (result as { lastInsertId?: number }).lastInsertId ?? 0;
  }

  /** Return all messages for a chat, oldest first. */
  async getMessages(chatId: string): Promise<ChatMessage[]> {
    this._assertReady();
    const rows = await this.db.query(
      `SELECT id, chat_id, agent_name, agent_id, role, content, created_at
       FROM messages WHERE chat_id = $1 ORDER BY id ASC`,
      [chatId]
    );
    return (rows as unknown[]).map((r) => this._rowToMessage(r as Record<string, unknown>));
  }

  /** Delete all messages for a chat (keeps the session row intact). */
  async clearMessages(chatId: string): Promise<void> {
    this._assertReady();
    await this.db.execute(`DELETE FROM messages WHERE chat_id = $1`, [chatId]);
  }

  // ─── Vector embeddings ───────────────────────────────────────────────────────

  /**
   * Store a vector embedding.
   * `entry.embedding` must have exactly `vectorDimensions` elements.
   */
  async addEmbedding(entry: VectorEntry): Promise<number> {
    this._assertReady();
    const metadata = JSON.stringify(entry.metadata ?? {});
    const vectorLiteral = `[${entry.embedding.join(",")}]`;
    const result = await this.db.execute(
      `INSERT INTO embeddings (chat_id, agent_name, agent_id, content, embedding, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        entry.chatId,
        entry.agentName,
        entry.agentId,
        entry.content,
        vectorLiteral,
        metadata,
      ]
    );
    return (result as { lastInsertId?: number }).lastInsertId ?? 0;
  }

  /**
   * Find the `topK` most similar embeddings using cosine similarity.
   *
   * @param queryEmbedding  float array of length `vectorDimensions`
   * @param topK            number of results to return (default 5)
   * @param filters         optional agent_name / agent_id / chat_id filters
   */
  async searchSimilar(
    queryEmbedding: number[],
    topK = 5,
    filters?: { agentName?: string; agentId?: string; chatId?: string }
  ): Promise<MemorySearchResult[]> {
    this._assertReady();

    const vectorLiteral = `[${queryEmbedding.join(",")}]`;
    const conditions: string[] = [];
    const params: string[] = [vectorLiteral];

    if (filters?.agentName) {
      conditions.push(`agent_name = $${params.length + 1}`);
      params.push(filters.agentName);
    }
    if (filters?.agentId) {
      conditions.push(`agent_id = $${params.length + 1}`);
      params.push(filters.agentId);
    }
    if (filters?.chatId) {
      conditions.push(`chat_id = $${params.length + 1}`);
      params.push(filters.chatId);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await this.db.query(
      `SELECT id, chat_id, agent_name, agent_id, content, metadata, created_at,
              VEC_DISTANCE_COSINE(embedding, $1) AS score
       FROM   embeddings
       ${where}
       ORDER  BY score ASC
       LIMIT  ${topK}`,
      params
    );

    return (rows as unknown[]).map((r) =>
      this._rowToSearchResult(r as Record<string, unknown>)
    );
  }

  /** List embeddings with optional filters (no vector computation). */
  async listEmbeddings(filters?: {
    agentName?: string;
    agentId?: string;
    chatId?: string;
  }): Promise<Omit<VectorEntry, "embedding">[]> {
    this._assertReady();

    const conditions: string[] = [];
    const params: string[] = [];

    if (filters?.agentName) {
      conditions.push(`agent_name = $${params.length + 1}`);
      params.push(filters.agentName);
    }
    if (filters?.agentId) {
      conditions.push(`agent_id = $${params.length + 1}`);
      params.push(filters.agentId);
    }
    if (filters?.chatId) {
      conditions.push(`chat_id = $${params.length + 1}`);
      params.push(filters.chatId);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = await this.db.query(
      `SELECT id, chat_id, agent_name, agent_id, content, metadata, created_at
       FROM embeddings ${where} ORDER BY id DESC`,
      params
    );

    return (rows as unknown[]).map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: row.id as number,
        chatId: row.chat_id as string,
        agentName: row.agent_name as string,
        agentId: row.agent_id as string,
        content: row.content as string,
        metadata: JSON.parse((row.metadata as string) || "{}") as Record<
          string,
          unknown
        >,
        createdAt: row.created_at as string,
      };
    });
  }

  // ─── Row mappers ─────────────────────────────────────────────────────────────

  private _rowToChat(row: Record<string, unknown>): ChatSession {
    return {
      chatId: row.chat_id as string,
      chatHeading: row.chat_heading as string,
      agentName: row.agent_name as string,
      agentId: row.agent_id as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private _rowToMessage(row: Record<string, unknown>): ChatMessage {
    return {
      id: row.id as number,
      chatId: row.chat_id as string,
      agentName: row.agent_name as string,
      agentId: row.agent_id as string,
      role: row.role as "system" | "user" | "assistant",
      content: row.content as string,
      createdAt: row.created_at as string,
    };
  }

  private _rowToSearchResult(row: Record<string, unknown>): MemorySearchResult {
    return {
      id: row.id as number,
      chatId: row.chat_id as string,
      agentName: row.agent_name as string,
      agentId: row.agent_id as string,
      content: row.content as string,
      metadata: JSON.parse((row.metadata as string) || "{}") as Record<
        string,
        unknown
      >,
      score: row.score as number,
      createdAt: row.created_at as string,
    };
  }

  private _assertReady(): void {
    if (!this.initialized) {
      throw new Error(
        "StoolapMemory is not initialized. Call await memory.init() first."
      );
    }
  }
}
