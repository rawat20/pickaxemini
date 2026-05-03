import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import type { Agent } from "@/schemas/agent";
import type { Conversation } from "@/schemas/conversation";

type Schema = {
  agents: Agent[];
  conversations: Conversation[];
};

const defaultData: Schema = { agents: [], conversations: [] };

const filePath = path.join(process.cwd(), "db.json");
const adapter = new JSONFile<Schema>(filePath);
const db = new Low<Schema>(adapter, defaultData);

export async function getDb() {
  await db.read();

  if (!db.data) db.data = { agents: [], conversations: [] };
  if (!db.data.agents) db.data.agents = [];
  if (!db.data.conversations) db.data.conversations = [];

  return db;
}
