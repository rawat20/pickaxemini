'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Bot, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pickaxe } from 'lucide-react';
import { trpc } from '@/trpc/client';

export default function CreateAgentPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = trpc.agents.create.useMutation({
    onSuccess: (agent) => {
      router.push(`/agent/${agent.id}`);
    },
  });

  const handleGenerate = () => {
    if (!name.trim() || !description.trim()) return;
    createMutation.mutate({ name, description });
  };

  const isFormValid = name.trim() && description.trim();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Pickaxe className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              Pickaxe Mini
            </span>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/" className="gap-2 flex items-center">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Create New Agent
          </h1>
          <p className="mt-2 text-muted-foreground">
            Describe your agent and Gemini will generate a system prompt and
            greeting for you.
          </p>
        </div>

        {/* Form */}
        <Card className="mb-8">
          <CardContent className="pt-6 space-y-4">
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
                className="min-h-32 resize-none"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!isFormValid || createMutation.isPending}
              className="w-full gap-2"
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}