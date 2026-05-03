// src/server/routers/conversation.ts

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const conversationsRouter = router({

  // GET conversation by agentId — one per agent
  getByAgent: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const conversation = db.data.conversations.find(
        (c) => c.agentId === input.agentId
      );
      return conversation ?? null;
    }),

  // ADD message to agent's conversation
  addMessage: publicProcedure
    .input(
      z.object({
        agentId: z.string(),
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      const newMessage = {
        role: input.role,
        content: input.content,
        createdAt: new Date().toISOString(),
      };

      // Find existing conversation for this agent
      const existing = db.data.conversations.find(
        (c) => c.agentId === input.agentId
      );

      if (existing) {
        // Append to existing conversation
        existing.messages.push(newMessage);
        existing.updatedAt = new Date().toISOString();
      } else {
        // Create new conversation for this agent
        db.data.conversations.push({
          id: uuidv4(),
          agentId: input.agentId,
          messages: [newMessage],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      await db.write();
      return newMessage;
    }),

  // CLEAR conversation for an agent
  clear: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      db.data.conversations = db.data.conversations.filter(
        (c) => c.agentId !== input.agentId
      );
      await db.write();
      return { success: true };
    }),
});