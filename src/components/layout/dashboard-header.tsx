'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Pickaxe } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Pickaxe className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">
            Pickaxe Mini
          </span>
        </Link>
        <Button asChild className="gap-2">
          <Link href="/create">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Agent</span>
            <span className="sm:hidden">New</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}