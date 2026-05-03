import { router } from '../trpc';
import { agentsRouter } from './agent';
import { conversationsRouter } from './conversation';

export const appRouter = router({
  agents: agentsRouter,
  conversations: conversationsRouter,
});

export type AppRouter = typeof appRouter;