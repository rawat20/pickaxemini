import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/core/utils";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-md bg-muted animate-pulse", className)}
      aria-hidden
    />
  );
}

/** Matches AgentCard layout so loading feels like real cards, not empty boxes. */
export function AgentCardSkeleton() {
  return (
    <Card className="pointer-events-none flex flex-col overflow-visible border border-border bg-card shadow-sm ring-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Shimmer className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="flex-1 min-w-0 space-y-2">
              <Shimmer className="h-4 w-[72%] max-w-[200px]" />
              <Shimmer className="h-5 w-16 rounded-full" />
            </div>
          </div>
          <Shimmer className="h-8 w-8 shrink-0 rounded-md" />
        </div>
      </CardHeader>

      <CardContent className="pb-4 flex-1 space-y-2">
        <Shimmer className="h-3.5 w-full" />
        <Shimmer className="h-3.5 w-[92%]" />
        <Shimmer className="h-3.5 w-[55%]" />
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Shimmer className="h-4 w-4 rounded-sm" />
          <Shimmer className="h-4 w-24" />
        </div>
        <Shimmer className="h-8 w-[5.5rem] rounded-md" />
      </CardFooter>
    </Card>
  );
}
