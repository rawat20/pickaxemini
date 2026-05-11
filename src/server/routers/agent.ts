import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { getMongoDb } from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

const agentProjection = { projection: { _id: 0 } } as const;

export const agentsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getMongoDb();
    const [agents, conversations] = await Promise.all([
      db
        .collection("agents")
        .find({}, { ...agentProjection, sort: { createdAt: -1 } })
        .toArray(),
      db
        .collection("conversations")
        .find({}, { projection: { _id: 0, agentId: 1, messages: 1 } })
        .toArray(),
    ]);

    const messageCountByAgent = new Map(
      conversations.map((c) => [
        c.agentId as string,
        Array.isArray(c.messages) ? c.messages.length : 0,
      ]),
    );

    return agents.map((agent) => ({
      id: agent.id as string,
      name: agent.name as string,
      description: agent.description as string,
      systemPrompt: agent.systemPrompt as string,
      greeting: agent.greeting as string,
      createdAt: agent.createdAt as string,
      messageCount: messageCountByAgent.get(agent.id as string) ?? 0,
    }));
  }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getMongoDb();
      const agent = await db
        .collection("agents")
        .findOne({ id: input.id }, agentProjection);
      if (!agent) throw new Error("Agent not found");
      return {
        id: agent.id as string,
        name: agent.name as string,
        description: agent.description as string,
        systemPrompt: agent.systemPrompt as string,
        greeting: agent.greeting as string,
        createdAt: agent.createdAt as string,
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().min(10).max(1000),
      }),
    )
    .mutation(async ({ input }) => {
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

      const newAgent = {
        id: uuidv4(),
        name: input.name,
        description: input.description,
        systemPrompt: system_prompt,
        greeting: suggested_greeting,
        createdAt: new Date().toISOString(),
      };

      const db = await getMongoDb();
      await db.collection("agents").insertOne(newAgent);

      return newAgent;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getMongoDb();
      await Promise.all([
        db.collection("agents").deleteOne({ id: input.id }),
        db.collection("conversations").deleteMany({ agentId: input.id }),
      ]);
      return { success: true };
    }),
});
