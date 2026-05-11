import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { getMongoDb } from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";

const convProjection = { projection: { _id: 0 } } as const;

export const conversationsRouter = router({
  getByAgent: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      const db = await getMongoDb();
      const conversation = await db
        .collection("conversations")
        .findOne({ agentId: input.agentId }, convProjection);
      if (!conversation) return null;
      return {
        id: conversation.id as string,
        agentId: conversation.agentId as string,
        messages: conversation.messages as {
          role: "user" | "assistant";
          content: string;
          createdAt: string;
        }[],
        createdAt: conversation.createdAt as string,
        updatedAt: conversation.updatedAt as string,
      };
    }),

  addMessage: publicProcedure
    .input(
      z.object({
        agentId: z.string(),
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getMongoDb();
      const convCol = db.collection("conversations");

      const newMessage = {
        role: input.role,
        content: input.content,
        createdAt: new Date().toISOString(),
      };

      const existing = await convCol.findOne({ agentId: input.agentId });

      if (existing) {
        const messages = [
          ...(Array.isArray(existing.messages) ? existing.messages : []),
          newMessage,
        ];
        await convCol.updateOne(
          { agentId: input.agentId },
          {
            $set: {
              messages,
              updatedAt: new Date().toISOString(),
            },
          },
        );
      } else {
        await convCol.insertOne({
          id: uuidv4(),
          agentId: input.agentId,
          messages: [newMessage],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      return newMessage;
    }),

  clear: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getMongoDb();
      await db.collection("conversations").deleteMany({ agentId: input.agentId });
      return { success: true };
    }),
});
