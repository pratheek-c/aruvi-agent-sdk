export interface MemoryConfig {
  /** Path to the stoolap database file, or ':memory:' for in-memory. Defaults to './aruvi-memory' */
  dbPath?: string;
  /** Dimensions of the vector embeddings. Defaults to 1536 (OpenAI text-embedding-ada-002) */
  vectorDimensions?: number;
}

export interface ChatSession {
  chatId: string;
  chatHeading: string;
  agentName: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id?: number;
  chatId: string;
  agentName: string;
  agentId: string;
  role: "system" | "user" | "assistant";
  content: string;
  createdAt?: string;
}

export interface VectorEntry {
  id?: number;
  chatId: string;
  agentName: string;
  agentId: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface MemorySearchResult {
  id: number;
  chatId: string;
  agentName: string;
  agentId: string;
  content: string;
  metadata: Record<string, unknown>;
  score: number;
  createdAt: string;
}

export interface CreateChatOptions {
  chatId?: string;
  chatHeading: string;
  agentName: string;
  agentId: string;
}
