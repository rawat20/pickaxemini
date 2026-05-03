'use client';

import { use } from 'react';
import { trpc } from '@/trpc/client';
import { AgentDetailsPanel } from '@/components/agent/agent-details-panel';
import { ChatPanel } from '@/components/agent/chat-panel';
import { notFound } from 'next/navigation';

const AVATAR_COLORS = [
  '#6366f1', '#10b981', '#f59e0b',
  '#ec4899', '#8b5cf6', '#06b6d4',
];

interface AgentPageProps {
  params: Promise<{ id: string }>;
}

export default function AgentPage({ params }: AgentPageProps) {
  const { id } = use(params);

  const { data: agent, isLoading } = trpc.agents.get.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm animate-pulse">
          Loading agent...
        </div>
      </div>
    );
  }

  if (!agent) return notFound();

  const avatarColor = AVATAR_COLORS[
    Math.abs(agent.id.charCodeAt(0)) % AVATAR_COLORS.length
  ];

  return (
    <div className="flex h-screen">
      {/* Left Panel - Agent Details (40%) */}
      <div className="hidden w-[40%] border-r border-border lg:block bg-background">
        <AgentDetailsPanel
          id={agent.id}
          name={agent.name}
          description={agent.description}
          systemPrompt={agent.systemPrompt}
          greeting={agent.greeting}
          avatarColor={avatarColor}
        />
      </div>

      {/* Right Panel - Chat (60%) */}
      <div className="flex-1 bg-white">
        <ChatPanel
          agentId={agent.id}
          agentName={agent.name}
          agentColor={avatarColor}
          systemPrompt={agent.systemPrompt}
          initialGreeting={agent.greeting}
        />
      </div>
    </div>
  );
}