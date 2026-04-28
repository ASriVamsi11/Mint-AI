"use client";

import { Sparkles, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/MobileNav";
import { usePolling } from "@/lib/usePolling";
import { api } from "@/lib/api";

export function AppBar() {
  const { data, error } = usePolling(api.status, 6000);
  const live = !error && data !== null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
      <MobileNav />

      <div className="flex items-center gap-2 md:hidden">
        <Sparkles className="size-5 text-primary" aria-hidden="true" />
        <span className="text-sm font-semibold">Mint AI</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Badge
          variant={live ? "success" : "destructive"}
          className="gap-1.5 px-2.5 py-1"
          aria-live="polite"
        >
          {live ? (
            <Wifi className="size-3" aria-hidden="true" />
          ) : (
            <WifiOff className="size-3" aria-hidden="true" />
          )}
          <span>{live ? "Live" : "Offline"}</span>
        </Badge>
        {data?.agent && (
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
            {data.agent}
          </span>
        )}
      </div>
    </header>
  );
}
