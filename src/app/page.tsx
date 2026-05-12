"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Sidebar } from "@/components/layout/sidebar";
import { AgentsGrid } from "@/components/dashboard/agents-grid";
import { CreateAgentDrawer } from "@/components/layout/create-agent-drawer";
import { Button } from "@/components/ui/button";
import { Plus, Bot, MessageSquare } from "lucide-react";
import { PickaxeEmbed } from "@/components/pickaxe/pickaxe-embed";

export default function DashboardPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: agents, isPending: agentsPending } =
    trpc.agents.list.useQuery();

  const totalAgents = agents?.length ?? 0;
  const totalMessages =
    agents?.reduce((sum, agent) => sum + (agent.messageCount ?? 0), 0) ?? 0;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 lg:ml-80 flex flex-col min-h-screen">
        <div className="px-6 pt-6 space-y-4">
          {/* Card 1 — Dashboard Header + Create New */}
          <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            <Button
              onClick={() => setDrawerOpen(true)}
              className="gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create New</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>

          {/* Card 2 — Stats */}
          <div className="rounded-xl border border-border bg-card px-5 py-4 flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalAgents}
                </p>
                <p className="text-sm text-muted-foreground">Total Agents</p>
              </div>
            </div>

            <div className="h-10 w-px bg-border" />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <MessageSquare className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalMessages.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Messages</p>
              </div>
            </div>
          </div>

          {/* Card 3 — Your Agents label */}
          <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Your Agents
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage and interact with your AI agents
              </p>
            </div>
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {totalAgents} agents
            </span>
          </div>

          {/* Card 4 — Agents Grid */}
          <div className="rounded-xl border border-border bg-card px-5 py-5">
            <AgentsGrid
              agents={agents}
              isLoading={agentsPending}
              onRequestCreate={() => setDrawerOpen(true)}
            />
          </div>
        </div>

        <div className="pb-6" />
      </div>

      <CreateAgentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <PickaxeEmbed />
    </div>
  );
}
