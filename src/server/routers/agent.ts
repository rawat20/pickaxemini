import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { getDb } from "@/services/db";
import { v4 as uuidv4 } from "uuid";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export const agentsRouter = router({
  // GET all agents
  list: publicProcedure.query(async () => {
    const db = await getDb();

    return db.data.agents.map((agent) => {
      const conversation = db.data.conversations.find(
        (c) => c.agentId === agent.id,
      );
      return {
        ...agent,
        messageCount: conversation?.messages.length ?? 0,
      };
    });
  }),

  // GET single agent by id
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const agent = db.data.agents.find((a) => a.id === input.id);
      if (!agent) throw new Error("Agent not found");
      return agent;
    }),

  // CREATE agent — calls FastAPI to generate system prompt
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().min(10).max(1000),
      }),
    )
    .mutation(async ({ input }) => {
      // Call FastAPI to generate system prompt via Gemini
      const res = await fetch(`${FASTAPI_URL}/api/v1/agents/generate-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: input.name,
          description: input.description,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate prompt from FastAPI");

      const { system_prompt, suggested_greeting } = await res.json();

      // Save to LowDB
      const db = await getDb();
      const newAgent = {
        id: uuidv4(),
        name: input.name,
        description: input.description,
        systemPrompt: system_prompt,
        greeting: suggested_greeting,
        createdAt: new Date().toISOString(),
      };

      db.data.agents.push(newAgent);
      await db.write();

      return newAgent;
    }),

  // DELETE agent
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      db.data.agents = db.data.agents.filter((a) => a.id !== input.id);
      await db.write();
      return { success: true };
    }),
});
