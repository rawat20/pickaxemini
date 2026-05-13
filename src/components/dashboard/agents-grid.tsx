"use client";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/routers/_app";
import { AgentCard } from "./agent-card";
import { AgentCardSkeleton } from "./agent-card-skeleton";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

type AgentList = inferRouterOutputs<AppRouter>["agents"]["list"];

const AVATAR_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
];

type AgentsGridProps = {
  agents: AgentList | undefined;
  isLoading: boolean;
  /** Empty-state "Create Agent" — e.g. open the dashboard drawer. */
  onRequestCreate: () => void;
};

export function AgentsGrid({
  agents,
  isLoading,
  onRequestCreate,
}: AgentsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <AgentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No agents yet
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Create your first AI agent to get started
        </p>
        <Button type="button" onClick={onRequestCreate}>
          Create Agent
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent, index) => (
        <AgentCard
          key={agent.id}
          id={agent.id}
          name={agent.name}
          description={agent.description}
          messageCount={agent.messageCount ?? 0}
          avatarColor={AVATAR_COLORS[index % AVATAR_COLORS.length]}
        />
      ))}
    </div>
  );
}
