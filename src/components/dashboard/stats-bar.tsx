'use client';

import { Bot, MessageSquare } from 'lucide-react';

interface StatsBarProps {
  totalAgents: number;
  totalMessages: number;
}

export function StatsBar({ totalAgents, totalMessages }: StatsBarProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 py-4 sm:gap-8 sm:px-6 lg:px-8">
        {/* Total Agents */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalAgents}</p>
            <p className="text-sm text-muted-foreground">Total Agents</p>
          </div>
        </div>

        <div className="hidden h-10 w-px bg-border sm:block" />

        {/* Total Messages */}
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
    </div>
  );
}