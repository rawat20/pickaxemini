"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, Bot, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/trpc/client";

interface CreateAgentDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CreateAgentDrawer({ open, onClose }: CreateAgentDrawerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const utils = trpc.useUtils();

  const createMutation = trpc.agents.create.useMutation({
    onSuccess: (agent) => {
      utils.agents.list.invalidate();
      onClose();
      setName("");
      setDescription("");
      router.push(`/agent/${agent.id}`);
    },
  });

  const handleGenerate = () => {
    if (!name.trim() || !description.trim()) return;
    createMutation.mutate({ name, description });
  };

  const isFormValid = name.trim() && description.trim();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="
    sm:!w-[30%] 
    !max-w-none
    rounded-l-2xl 
    p-4 
    overflow-y-auto "
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold">
            Create New Agent
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Describe your agent and Gemini will generate a system prompt and
            greeting automatically.
          </p>
        </SheetHeader>

        {/* Form */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Agent Name
            </label>
            <Input
              placeholder="e.g., Customer Support Bot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={createMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Agent Description
            </label>
            <Textarea
              placeholder="Describe what your agent should do, its personality, and any specific knowledge it should have..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createMutation.isPending}
              className="min-h-36 resize-none"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!isFormValid || createMutation.isPending}
            className="w-full gap-2 cursor-pointer"
            size="lg"
          >
            {createMutation.isPending ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                Generating with Gemini...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Agent
              </>
            )}
          </Button>

          {createMutation.isError && (
            <p className="text-sm text-destructive text-center">
              Failed to generate agent. Please try again.
            </p>
          )}
        </div>

        {/* What happens next */}
        {!createMutation.isPending && !createMutation.isError && (
          <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              What happens next
            </p>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Gemini generates a tailored system prompt for your agent
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                <Bot className="h-3 w-3 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your agent is saved and ready to chat immediately
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                <MessageSquare className="h-3 w-3 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Chat history is saved automatically per agent
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
