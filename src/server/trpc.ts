import { initTRPC } from "@trpc/server"; 

// initialize tRPCs
const t = initTRPC.create();

// reusable helpers
export const router = t.router;
export const publicProcedure = t.procedure;