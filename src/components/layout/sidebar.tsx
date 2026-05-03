'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  UserCircle,
  CreditCard,
  LayoutTemplate,
  Users,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Pickaxe,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, enabled: true },
  { label: 'Account Settings', href: '/settings', icon: UserCircle, enabled: false },
  { label: 'Plans & Pricing', href: '/pricing', icon: CreditCard, enabled: false },
  { label: 'Templates', href: '/templates', icon: LayoutTemplate, enabled: false },
  { label: 'Affiliate', href: '/affiliate', icon: Users, enabled: false },
  { label: 'Resources', href: '/resources', icon: BookOpen, enabled: false },
  { label: 'Learn', href: '/learn', icon: GraduationCap, enabled: false },
  { label: 'Community', href: '/community', icon: MessageSquare, enabled: false },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex h-screen w-72 flex-col fixed left-4 top-0 z-40 p-3 gap-3">

      {/* Logo — outside the card with blue lightning */}
      <div className="flex items-center gap-2 px-2 py-1 relative">

        {/* Floating stars — same indigo/purple as pickaxe */}
        <span
          className="absolute top-0 left-8 text-[10px] animate-ping"
          style={{ color: '#a5b4fc', animationDuration: '2s' }}
        >★</span>
        <span
          className="absolute top-1 left-24 text-[8px] animate-ping"
          style={{ color: '#818cf8', animationDuration: '1.4s', animationDelay: '0.3s' }}
        >✦</span>
        <span
          className="absolute -top-1 left-40 text-[10px] animate-ping"
          style={{ color: '#a5b4fc', animationDuration: '1.8s', animationDelay: '0.6s' }}
        >★</span>
        <span
          className="absolute top-2 left-52 text-[7px] animate-ping"
          style={{ color: '#c7d2fe', animationDuration: '2.2s', animationDelay: '0.9s' }}
        >✦</span>

        {/* Icon */}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            boxShadow: '0 4px 15px rgba(99,102,241,0.5), 0 0 30px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <Pickaxe
            className="h-5 w-5"
            style={{
              color: '#a5b4fc',
              filter: 'drop-shadow(0 0 6px rgba(165,180,252,0.8)) drop-shadow(0 0 12px rgba(99,102,241,0.6))',
            }}
          />
        </div>

        {/* Text + lightning bolt */}
        <div className="relative">
          <span
            className="text-xl font-bold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #4f46e5 50%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(99,102,241,0.3))',
            }}
          >
            Pickaxe Mini
          </span>
          {/* Lightning bolt */}
          <span
            className="absolute -right-5 -top-1 text-sm animate-pulse"
            style={{
              color: '#818cf8',
              filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.9)) drop-shadow(0 0 8px rgba(165,180,252,0.7))',
              animationDuration: '0.8s',
            }}
          >⚡</span>
        </div>
      </div>

      {/* Nav Card */}
      <div
        className="flex-1 rounded-2xl border border-border/60 overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'hsl(300 2% 92%)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
        }}
      >
        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (!item.enabled) {
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/40 cursor-not-allowed select-none"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                  <span className="ml-auto text-xs bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground/40">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-black/5 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer inside card */}
        <div className="border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground/50">Pickaxe Mini v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}