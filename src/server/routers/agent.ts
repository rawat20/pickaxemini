// src/server/routers/agents.ts

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

// 👇 fake database (temporary)
let agents = [{ id: 1, fullName: 'Agent Smith' },{ id: 2, fullName: 'Agent Johnson' }];

export const agentsRouter = router({

  // ✅ GET ALL
  list: publicProcedure.query(() => {
    return agents;
  }),

  // ✅ GET ONE
  get: publicProcedure
    .input(z.number())
    .query(({ input }) => {
      return agents.find(a => a.id === input);
    }),

  // ✅ CREATE
  create: publicProcedure
    .input(z.object({ fullName: z.string() }))
    .mutation(({ input }) => {
      const newAgent = {
        id: Date.now(),
        fullName: input.fullName,
      };
      agents.push(newAgent);
      return newAgent;
    }),

  // ✅ DELETE
  delete: publicProcedure
    .input(z.number())
    .mutation(({ input }) => {
      agents = agents.filter(a => a.id !== input);
      return { success: true };
    }),
});