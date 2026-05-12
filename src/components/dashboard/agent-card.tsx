"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { MessageCircle, Bot, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/trpc/client";

interface AgentCardProps {
  id: string;
  name: string;
  description: string;
  messageCount: number;
  avatarColor: string;
}

export function AgentCard({
  id,
  name,
  description,
  messageCount,
  avatarColor,
}: AgentCardProps) {
  const utils = trpc.useUtils();
  const deleteMutation = trpc.agents.delete.useMutation({
    onSuccess: () => {
      utils.agents.list.invalidate();
    },
  });

  return (
    <Card className="group relative flex flex-col overflow-visible border border-border bg-card shadow-sm ring-0 transition-all duration-200 hover:border-primary/30 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: avatarColor }}
            >
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{name}</h3>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                Active
              </span>
            </div>
          </div>

          {/* Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive gap-2 cursor-pointer text-xs"
                onClick={() => deleteMutation.mutate({ id })}
              >
                <Trash2 className="h-3 w-3" />
                Delete Agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-4 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {messageCount.toLocaleString()} messages
          </span>
        </div>
        <Button size="sm" variant="secondary" className="gap-1.5" asChild>
          <Link href={`/agent/${id}`}>
            <MessageCircle className="h-3.5 w-3.5" />
            Chat
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
