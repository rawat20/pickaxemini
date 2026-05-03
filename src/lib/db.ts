import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  agentId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

export type Agent = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  greeting: string;
  createdAt: string;
};

type Schema = {
  agents: Agent[];
  conversations: Conversation[];
};

const defaultData: Schema = { agents: [], conversations: [] };

const filePath = path.join(process.cwd(), 'db.json');
const adapter = new JSONFile<Schema>(filePath);
const db = new Low<Schema>(adapter, defaultData);

export async function getDb() {
  await db.read();

  // Defensive — ensure both keys always exist
  if (!db.data) db.data = { agents: [], conversations: [] };
  if (!db.data.agents) db.data.agents = [];
  if (!db.data.conversations) db.data.conversations = [];

  return db;
}