/**
 * Tests for StoolapMemory
 *
 * @stoolap/node is mocked with a pure-JS in-memory implementation so tests
 * run without touching the native module (which crashes on Windows/Bun due to
 * a Bun NAPI bug in the async NAPI callbacks).
 *
 * The mock faithfully implements every SQL pattern that StoolapMemory uses,
 * including cosine distance for vector search.
 */
import { describe, it, expect, beforeEach, mock } from "bun:test";

// ─── Mock @stoolap/node ───────────────────────────────────────────────────────

interface ChatRow {
  id: number; chat_id: string; chat_heading: string;
  agent_name: string; agent_id: string;
  created_at: string; updated_at: string;
}
interface MsgRow {
  id: number; chat_id: string; agent_name: string; agent_id: string;
  role: string; content: string; created_at: string;
}
interface EmbRow {
  id: number; chat_id: string; agent_name: string; agent_id: string;
  content: string; embedding: number[]; metadata: string; created_at: string;
}

function cosineDistance(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 1 : 1 - dot / denom;
}

function parseVector(literal: string): number[] {
  return JSON.parse(literal) as number[];
}

function now(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 23);
}

class MockDatabase {
  private chats: ChatRow[] = [];
  private messages: MsgRow[] = [];
  private embeddings: EmbRow[] = [];
  private chatSeq = 0;
  private msgSeq = 0;
  private embSeq = 0;

  static open(_path: string): Promise<MockDatabase> {
    return Promise.resolve(new MockDatabase());
  }

  exec(_sql: string): Promise<void> {
    // DDL (CREATE TABLE / CREATE INDEX) — no-op
    return Promise.resolve();
  }

  execute(sql: string, params: unknown[] = []): Promise<{ lastInsertId?: number; changes: number }> {
    const s = sql.trim().toLowerCase().replace(/\s+/g, " ");
    const table = (s.match(/(?:insert\s+into|update|delete\s+from)\s+(\w+)/) ?? [])[1];

    if (table === "chats") {
      if (s.startsWith("insert")) {
        const [chatId, chatHeading, agentName, agentId] = params as string[];
        const id = ++this.chatSeq;
        const ts = now();
        this.chats.push({ id, chat_id: chatId, chat_heading: chatHeading, agent_name: agentName, agent_id: agentId, created_at: ts, updated_at: ts });
        return Promise.resolve({ lastInsertId: id, changes: 1 });
      }
      if (s.startsWith("update") && s.includes("chat_heading")) {
        const [heading, chatId] = params as string[];
        const row = this.chats.find(c => c.chat_id === chatId);
        if (row) { row.chat_heading = heading; row.updated_at = now(); }
        return Promise.resolve({ changes: row ? 1 : 0 });
      }
      if (s.startsWith("update") && s.includes("updated_at")) {
        const [chatId] = params as string[];
        const row = this.chats.find(c => c.chat_id === chatId);
        if (row) row.updated_at = now();
        return Promise.resolve({ changes: row ? 1 : 0 });
      }
      if (s.startsWith("delete")) {
        const [chatId] = params as string[];
        const before = this.chats.length;
        this.chats = this.chats.filter(c => c.chat_id !== chatId);
        return Promise.resolve({ changes: before - this.chats.length });
      }
    }

    if (table === "messages") {
      if (s.startsWith("insert")) {
        const [chatId, agentName, agentId, role, content] = params as string[];
        const id = ++this.msgSeq;
        this.messages.push({ id, chat_id: chatId, agent_name: agentName, agent_id: agentId, role, content, created_at: now() });
        return Promise.resolve({ lastInsertId: id, changes: 1 });
      }
      if (s.startsWith("delete")) {
        const [chatId] = params as string[];
        const before = this.messages.length;
        this.messages = this.messages.filter(m => m.chat_id !== chatId);
        return Promise.resolve({ changes: before - this.messages.length });
      }
    }

    if (table === "embeddings") {
      if (s.startsWith("insert")) {
        const [chatId, agentName, agentId, content, vectorLiteral, metadata] = params as string[];
        const id = ++this.embSeq;
        this.embeddings.push({ id, chat_id: chatId, agent_name: agentName, agent_id: agentId, content, embedding: parseVector(vectorLiteral), metadata: metadata ?? "{}", created_at: now() });
        return Promise.resolve({ lastInsertId: id, changes: 1 });
      }
      if (s.startsWith("delete")) {
        const [chatId] = params as string[];
        const before = this.embeddings.length;
        this.embeddings = this.embeddings.filter(e => e.chat_id !== chatId);
        return Promise.resolve({ changes: before - this.embeddings.length });
      }
    }

    return Promise.resolve({ changes: 0 });
  }

  query(sql: string, params: unknown[] = []): Promise<Record<string, unknown>[]> {
    const s = sql.trim().toLowerCase().replace(/\s+/g, " ");
    // Identify FROM table
    const fromTable = (s.match(/from\s+(\w+)/) ?? [])[1];

    /**
     * Parse WHERE conditions like `agent_name = $2` from the SQL and return
     * a filter predicate builder. Using positional $N indices avoids any
     * ambiguity with column names appearing in the SELECT clause.
     */
    function applyWhere<T extends Record<string, unknown>>(
      rows: T[],
      colMap: Partial<Record<string, keyof T>>
    ): T[] {
      const conds = [...s.matchAll(/\b(agent_name|agent_id|chat_id)\s*=\s*\$(\d+)/g)];
      for (const [, col, idxStr] of conds) {
        const key = colMap[col];
        if (!key) continue;
        const val = params[parseInt(idxStr, 10) - 1];
        rows = rows.filter(r => r[key] === val);
      }
      return rows;
    }

    if (fromTable === "chats") {
      let rows = applyWhere([...this.chats], { agent_name: "agent_name", agent_id: "agent_id" });
      rows.sort((a, b) => (a.updated_at > b.updated_at ? -1 : 1));
      return Promise.resolve(rows.map(c => ({ chat_id: c.chat_id, chat_heading: c.chat_heading, agent_name: c.agent_name, agent_id: c.agent_id, created_at: c.created_at, updated_at: c.updated_at })));
    }

    if (fromTable === "messages") {
      const [chatId] = params as string[];
      const rows = this.messages.filter(m => m.chat_id === chatId).sort((a, b) => a.id - b.id);
      return Promise.resolve(rows.map(m => ({ id: m.id, chat_id: m.chat_id, agent_name: m.agent_name, agent_id: m.agent_id, role: m.role, content: m.content, created_at: m.created_at })));
    }

    if (fromTable === "embeddings") {
      // Vector search
      if (s.includes("vec_distance_cosine")) {
        const queryVec = parseVector(params[0] as string);
        const limitMatch = s.match(/limit (\d+)/);
        const topK = limitMatch ? parseInt(limitMatch[1], 10) : 5;
        let rows = applyWhere([...this.embeddings], { agent_name: "agent_name", agent_id: "agent_id", chat_id: "chat_id" });
        const scored = rows
          .map(e => ({ ...e, score: cosineDistance(e.embedding, queryVec) }))
          .sort((a, b) => a.score - b.score)
          .slice(0, topK);
        return Promise.resolve(scored.map(e => ({ id: e.id, chat_id: e.chat_id, agent_name: e.agent_name, agent_id: e.agent_id, content: e.content, metadata: e.metadata, created_at: e.created_at, score: e.score })));
      }
      // List embeddings
      let rows = applyWhere([...this.embeddings], { agent_name: "agent_name", agent_id: "agent_id", chat_id: "chat_id" });
      rows.sort((a, b) => b.id - a.id);
      return Promise.resolve(rows.map(e => ({ id: e.id, chat_id: e.chat_id, agent_name: e.agent_name, agent_id: e.agent_id, content: e.content, metadata: e.metadata, created_at: e.created_at })));
    }

    return Promise.resolve([]);
  }

  queryOne(sql: string, params: unknown[] = []): Promise<Record<string, unknown> | null> {
    const s = sql.trim().toLowerCase().replace(/\s+/g, " ");
    if (s.includes("from chats") && s.includes("chat_id = ")) {
      const [chatId] = params as string[];
      const row = this.chats.find(c => c.chat_id === chatId);
      if (!row) return Promise.resolve(null);
      return Promise.resolve({ chat_id: row.chat_id, chat_heading: row.chat_heading, agent_name: row.agent_name, agent_id: row.agent_id, created_at: row.created_at, updated_at: row.updated_at });
    }
    return this.query(sql, params).then(rows => rows[0] ?? null);
  }

  close(): Promise<void> {
    return Promise.resolve();
  }
}

// Register the mock BEFORE importing StoolapMemory
await mock.module("@stoolap/node", () => ({ Database: MockDatabase }));

// Now import the module under test
const { StoolapMemory } = await import("../src/memory/stoolap-memory.js");

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function createMemory(vectorDimensions = 3) {
  const m = new StoolapMemory({ dbPath: ":memory:", vectorDimensions });
  await m.init();
  return m;
}

function unitVec(dims = 3): number[] {
  const v = 1 / Math.sqrt(dims);
  return Array.from({ length: dims }, () => v);
}

function perturbedVec(dims = 3, delta = 0.1): number[] {
  const base = unitVec(dims);
  base[0] += delta;
  return base;
}

// ─── Reset memory before each test ───────────────────────────────────────────

let memory: InstanceType<typeof StoolapMemory>;

beforeEach(async () => {
  memory = await createMemory();
});

// ═════════════════════════════════════════════════════════════════════════════
// Lifecycle
// ═════════════════════════════════════════════════════════════════════════════

describe("StoolapMemory – lifecycle", () => {
  it("init() resolves without error", async () => {
    await expect(memory.init()).resolves.toBeUndefined();
  });

  it("init() is idempotent — calling it twice is safe", async () => {
    await memory.init();
    await expect(memory.init()).resolves.toBeUndefined();
  });

  it("throws when a method is called before init()", async () => {
    const uninit = new StoolapMemory({ dbPath: ":memory:" });
    await expect(uninit.listChats()).rejects.toThrow("StoolapMemory is not initialized");
  });

  it("close() resolves without error", async () => {
    await expect(memory.close()).resolves.toBeUndefined();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Chat sessions
// ═════════════════════════════════════════════════════════════════════════════

describe("StoolapMemory – createChat", () => {
  it("returns a non-empty string ID", async () => {
    const id = await memory.createChat({ chatHeading: "Hello", agentName: "bot", agentId: "a1" });
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("respects a caller-supplied chatId", async () => {
    const id = await memory.createChat({ chatId: "my-id", chatHeading: "X", agentName: "bot", agentId: "a1" });
    expect(id).toBe("my-id");
  });

  it("auto-generates unique IDs on successive calls", async () => {
    const id1 = await memory.createChat({ chatHeading: "A", agentName: "bot", agentId: "a1" });
    const id2 = await memory.createChat({ chatHeading: "B", agentName: "bot", agentId: "a1" });
    expect(id1).not.toBe(id2);
  });
});

describe("StoolapMemory – getChat", () => {
  it("returns the persisted session with all fields", async () => {
    const id = await memory.createChat({ chatHeading: "My Chat", agentName: "bot", agentId: "a1" });
    const s = await memory.getChat(id);
    expect(s).not.toBeNull();
    expect(s!.chatId).toBe(id);
    expect(s!.chatHeading).toBe("My Chat");
    expect(s!.agentName).toBe("bot");
    expect(s!.agentId).toBe("a1");
    expect(typeof s!.createdAt).toBe("string");
    expect(typeof s!.updatedAt).toBe("string");
  });

  it("returns null for an unknown ID", async () => {
    expect(await memory.getChat("no-such-id")).toBeNull();
  });
});

describe("StoolapMemory – listChats", () => {
  it("returns every session when no filter given", async () => {
    await memory.createChat({ chatHeading: "A", agentName: "bot", agentId: "1" });
    await memory.createChat({ chatHeading: "B", agentName: "bot", agentId: "1" });
    expect((await memory.listChats()).length).toBe(2);
  });

  it("returns empty array when no sessions exist", async () => {
    expect(await memory.listChats()).toEqual([]);
  });

  it("filters by agentName", async () => {
    await memory.createChat({ chatHeading: "A", agentName: "alpha", agentId: "1" });
    await memory.createChat({ chatHeading: "B", agentName: "beta",  agentId: "1" });
    const chats = await memory.listChats({ agentName: "alpha" });
    expect(chats.length).toBe(1);
    expect(chats[0].agentName).toBe("alpha");
  });

  it("filters by agentId", async () => {
    await memory.createChat({ chatHeading: "A", agentName: "bot", agentId: "aaa" });
    await memory.createChat({ chatHeading: "B", agentName: "bot", agentId: "bbb" });
    const chats = await memory.listChats({ agentId: "aaa" });
    expect(chats.length).toBe(1);
    expect(chats[0].agentId).toBe("aaa");
  });

  it("filters by both agentName and agentId", async () => {
    await memory.createChat({ chatHeading: "A", agentName: "bot",   agentId: "x" });
    await memory.createChat({ chatHeading: "B", agentName: "bot",   agentId: "y" });
    await memory.createChat({ chatHeading: "C", agentName: "other", agentId: "x" });
    const chats = await memory.listChats({ agentName: "bot", agentId: "x" });
    expect(chats.length).toBe(1);
    expect(chats[0].chatHeading).toBe("A");
  });

  it("returns empty array when no sessions match the filter", async () => {
    await memory.createChat({ chatHeading: "A", agentName: "bot", agentId: "1" });
    expect(await memory.listChats({ agentName: "nobody" })).toEqual([]);
  });
});

describe("StoolapMemory – updateChatHeading", () => {
  it("updates and persists the new heading", async () => {
    const id = await memory.createChat({ chatHeading: "Old", agentName: "bot", agentId: "1" });
    await memory.updateChatHeading(id, "New");
    expect((await memory.getChat(id))!.chatHeading).toBe("New");
  });
});

describe("StoolapMemory – deleteChat", () => {
  it("removes the session so getChat returns null", async () => {
    const id = await memory.createChat({ chatHeading: "Temp", agentName: "bot", agentId: "1" });
    await memory.deleteChat(id);
    expect(await memory.getChat(id)).toBeNull();
  });

  it("removes associated messages", async () => {
    const id = await memory.createChat({ chatHeading: "W/msg", agentName: "bot", agentId: "1" });
    await memory.addMessage({ chatId: id, agentName: "bot", agentId: "1", role: "user", content: "hi" });
    await memory.deleteChat(id);
    // Recreate so getMessages has a valid parent row reference
    await memory.createChat({ chatId: id, chatHeading: "Re", agentName: "bot", agentId: "1" });
    expect(await memory.getMessages(id)).toEqual([]);
  });

  it("removes associated embeddings", async () => {
    const id = await memory.createChat({ chatHeading: "W/emb", agentName: "bot", agentId: "1" });
    await memory.addEmbedding({ chatId: id, agentName: "bot", agentId: "1", content: "x", embedding: unitVec() });
    await memory.deleteChat(id);
    expect(await memory.listEmbeddings({ chatId: id })).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Messages
// ═════════════════════════════════════════════════════════════════════════════

describe("StoolapMemory – addMessage", () => {
  it("returns a positive integer ID", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    const id = await memory.addMessage({ chatId, agentName: "bot", agentId: "a1", role: "user", content: "Hello!" });
    expect(typeof id).toBe("number");
    expect(id).toBeGreaterThan(0);
  });

  it("stores all three roles correctly", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    for (const role of ["system", "user", "assistant"] as const) {
      await memory.addMessage({ chatId, agentName: "bot", agentId: "a1", role, content: `msg-${role}` });
    }
    const roles = (await memory.getMessages(chatId)).map(m => m.role);
    expect(roles).toContain("system");
    expect(roles).toContain("user");
    expect(roles).toContain("assistant");
  });

  it("bumps the parent chat's updatedAt timestamp", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    const before = (await memory.getChat(chatId))!.updatedAt;
    await new Promise(r => setTimeout(r, 5));
    await memory.addMessage({ chatId, agentName: "bot", agentId: "a1", role: "user", content: "ping" });
    const after = (await memory.getChat(chatId))!.updatedAt;
    expect(new Date(after) >= new Date(before)).toBe(true);
  });
});

describe("StoolapMemory – getMessages", () => {
  it("returns messages in insertion (ASC id) order", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    await memory.addMessage({ chatId, agentName: "bot", agentId: "a1", role: "user",      content: "first"  });
    await memory.addMessage({ chatId, agentName: "bot", agentId: "a1", role: "assistant", content: "second" });
    const msgs = await memory.getMessages(chatId);
    expect(msgs[0].content).toBe("first");
    expect(msgs[1].content).toBe("second");
  });

  it("returns all expected fields", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    await memory.addMessage({ chatId, agentName: "bot", agentId: "a1", role: "user", content: "hi there" });
    const [msg] = await memory.getMessages(chatId);
    expect(msg.chatId).toBe(chatId);
    expect(msg.agentName).toBe("bot");
    expect(msg.agentId).toBe("a1");
    expect(msg.role).toBe("user");
    expect(msg.content).toBe("hi there");
    expect(typeof msg.id).toBe("number");
    expect(typeof msg.createdAt).toBe("string");
  });

  it("returns an empty array when no messages exist", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    expect(await memory.getMessages(chatId)).toEqual([]);
  });
});

describe("StoolapMemory – clearMessages", () => {
  it("removes all messages but keeps the chat session", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    await memory.addMessage({ chatId, agentName: "bot", agentId: "a1", role: "user",      content: "a" });
    await memory.addMessage({ chatId, agentName: "bot", agentId: "a1", role: "assistant", content: "b" });
    await memory.clearMessages(chatId);
    expect(await memory.getMessages(chatId)).toEqual([]);
    expect(await memory.getChat(chatId)).not.toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Vector embeddings
// ═════════════════════════════════════════════════════════════════════════════

describe("StoolapMemory – addEmbedding", () => {
  it("returns a positive integer ID", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    const id = await memory.addEmbedding({ chatId, agentName: "bot", agentId: "a1", content: "hello", embedding: unitVec() });
    expect(typeof id).toBe("number");
    expect(id).toBeGreaterThan(0);
  });

  it("stores supplied metadata as-is", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    await memory.addEmbedding({ chatId, agentName: "bot", agentId: "a1", content: "doc", embedding: unitVec(), metadata: { source: "wiki", page: 42 } });
    const [e] = await memory.listEmbeddings({ chatId });
    expect(e.metadata).toEqual({ source: "wiki", page: 42 });
  });

  it("defaults metadata to an empty object when not supplied", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    await memory.addEmbedding({ chatId, agentName: "bot", agentId: "a1", content: "x", embedding: unitVec() });
    const [e] = await memory.listEmbeddings({ chatId });
    expect(e.metadata).toEqual({});
  });
});

describe("StoolapMemory – listEmbeddings", () => {
  it("returns all stored entries", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    await memory.addEmbedding({ chatId, agentName: "bot", agentId: "a1", content: "a", embedding: unitVec() });
    await memory.addEmbedding({ chatId, agentName: "bot", agentId: "a1", content: "b", embedding: unitVec() });
    expect((await memory.listEmbeddings({ chatId })).length).toBe(2);
  });

  it("filters by agentName", async () => {
    const c1 = await memory.createChat({ chatHeading: "C1", agentName: "bot",   agentId: "1" });
    const c2 = await memory.createChat({ chatHeading: "C2", agentName: "other", agentId: "1" });
    await memory.addEmbedding({ chatId: c1, agentName: "bot",   agentId: "1", content: "mine",   embedding: unitVec() });
    await memory.addEmbedding({ chatId: c2, agentName: "other", agentId: "1", content: "theirs", embedding: unitVec() });
    const entries = await memory.listEmbeddings({ agentName: "bot" });
    expect(entries.length).toBe(1);
    expect(entries[0].agentName).toBe("bot");
  });

  it("filters by agentId", async () => {
    const c1 = await memory.createChat({ chatHeading: "C1", agentName: "bot", agentId: "x" });
    const c2 = await memory.createChat({ chatHeading: "C2", agentName: "bot", agentId: "z" });
    await memory.addEmbedding({ chatId: c1, agentName: "bot", agentId: "x", content: "a", embedding: unitVec() });
    await memory.addEmbedding({ chatId: c2, agentName: "bot", agentId: "z", content: "b", embedding: unitVec() });
    const entries = await memory.listEmbeddings({ agentId: "x" });
    expect(entries.length).toBe(1);
    expect(entries[0].agentId).toBe("x");
  });

  it("filters by chatId", async () => {
    const c1 = await memory.createChat({ chatHeading: "C1", agentName: "bot", agentId: "a1" });
    const c2 = await memory.createChat({ chatHeading: "C2", agentName: "bot", agentId: "a1" });
    await memory.addEmbedding({ chatId: c1, agentName: "bot", agentId: "a1", content: "a", embedding: unitVec() });
    await memory.addEmbedding({ chatId: c2, agentName: "bot", agentId: "a1", content: "b", embedding: unitVec() });
    const entries = await memory.listEmbeddings({ chatId: c1 });
    expect(entries.length).toBe(1);
    expect(entries[0].chatId).toBe(c1);
  });

  it("returns expected fields and omits the raw embedding array", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    await memory.addEmbedding({ chatId, agentName: "bot", agentId: "a1", content: "check", embedding: unitVec() });
    const [e] = await memory.listEmbeddings({ chatId });
    expect(e).toHaveProperty("id");
    expect(e).toHaveProperty("chatId");
    expect(e).toHaveProperty("agentName");
    expect(e).toHaveProperty("agentId");
    expect(e).toHaveProperty("content");
    expect(e).toHaveProperty("metadata");
    expect(e).toHaveProperty("createdAt");
    expect((e as Record<string, unknown>).embedding).toBeUndefined();
  });
});

describe("StoolapMemory – searchSimilar", () => {
  it("returns exactly topK results", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    for (let i = 0; i < 5; i++) {
      await memory.addEmbedding({ chatId, agentName: "bot", agentId: "a1", content: `d${i}`, embedding: perturbedVec(3, i * 0.05) });
    }
    expect((await memory.searchSimilar(unitVec(), 3)).length).toBe(3);
  });

  it("returns fewer than topK when the store has fewer records", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    await memory.addEmbedding({ chatId, agentName: "bot", agentId: "a1", content: "only", embedding: unitVec() });
    expect((await memory.searchSimilar(unitVec(), 10)).length).toBe(1);
  });

  it("results include all required fields", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    await memory.addEmbedding({ chatId, agentName: "bot", agentId: "a1", content: "hi", embedding: unitVec(), metadata: { k: "v" } });
    const [r] = await memory.searchSimilar(unitVec(), 1);
    expect(r).toHaveProperty("id");
    expect(r).toHaveProperty("chatId");
    expect(r).toHaveProperty("agentName");
    expect(r).toHaveProperty("agentId");
    expect(r).toHaveProperty("content");
    expect(r).toHaveProperty("score");
    expect(r).toHaveProperty("createdAt");
    expect(typeof r.score).toBe("number");
    expect(r.metadata).toEqual({ k: "v" });
  });

  it("ranks the most similar document first (lowest cosine distance)", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    const exact   = unitVec();
    const distant = [1, 0, 0]; // orthogonal to equal-component vector
    await memory.addEmbedding({ chatId, agentName: "bot", agentId: "a1", content: "exact",   embedding: exact   });
    await memory.addEmbedding({ chatId, agentName: "bot", agentId: "a1", content: "distant",  embedding: distant });
    const results = await memory.searchSimilar(exact, 2);
    expect(results[0].content).toBe("exact");
    expect(results[0].score).toBeLessThan(results[1].score);
  });

  it("honours the agentName filter", async () => {
    const c1 = await memory.createChat({ chatHeading: "C1", agentName: "bot",   agentId: "1" });
    const c2 = await memory.createChat({ chatHeading: "C2", agentName: "other", agentId: "1" });
    await memory.addEmbedding({ chatId: c1, agentName: "bot",   agentId: "1", content: "mine",   embedding: unitVec() });
    await memory.addEmbedding({ chatId: c2, agentName: "other", agentId: "1", content: "theirs", embedding: unitVec() });
    const results = await memory.searchSimilar(unitVec(), 10, { agentName: "bot" });
    expect(results.length).toBe(1);
    expect(results[0].agentName).toBe("bot");
  });

  it("honours the agentId filter", async () => {
    const c1 = await memory.createChat({ chatHeading: "C1", agentName: "bot", agentId: "x" });
    const c2 = await memory.createChat({ chatHeading: "C2", agentName: "bot", agentId: "z" });
    await memory.addEmbedding({ chatId: c1, agentName: "bot", agentId: "x", content: "a", embedding: unitVec() });
    await memory.addEmbedding({ chatId: c2, agentName: "bot", agentId: "z", content: "b", embedding: unitVec() });
    const results = await memory.searchSimilar(unitVec(), 10, { agentId: "x" });
    expect(results.length).toBe(1);
    expect(results[0].agentId).toBe("x");
  });

  it("honours the chatId filter", async () => {
    const c1 = await memory.createChat({ chatHeading: "C1", agentName: "bot", agentId: "a1" });
    const c2 = await memory.createChat({ chatHeading: "C2", agentName: "bot", agentId: "a1" });
    await memory.addEmbedding({ chatId: c1, agentName: "bot", agentId: "a1", content: "a", embedding: unitVec() });
    await memory.addEmbedding({ chatId: c2, agentName: "bot", agentId: "a1", content: "b", embedding: unitVec() });
    const results = await memory.searchSimilar(unitVec(), 10, { chatId: c1 });
    expect(results.length).toBe(1);
    expect(results[0].chatId).toBe(c1);
  });

  it("returns an empty array when no embeddings match the filter", async () => {
    const chatId = await memory.createChat({ chatHeading: "C", agentName: "bot", agentId: "a1" });
    await memory.addEmbedding({ chatId, agentName: "bot", agentId: "a1", content: "x", embedding: unitVec() });
    expect(await memory.searchSimilar(unitVec(), 5, { agentName: "nobody" })).toEqual([]);
  });
});
