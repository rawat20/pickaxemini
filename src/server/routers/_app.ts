// src/server/routers/_app.ts

import { router } from '../trpc';
import { agentsRouter } from './agent';

export const appRouter = router({
  agents: agentsRouter,
});

// 👇 export type for frontend
export type AppRouter = typeof appRouter;

/*
WHY:
This is your "main API".
All routes go through here.

Frontend will call:
trpc.agents.list
trpc.agents.create
*/