"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Fingerprint,
  Activity,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/memory", label: "Memory", icon: Database },
  { href: "/identity", label: "Identity", icon: Fingerprint },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/playground", label: "Playground", icon: PlayCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Primary"
      className="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col"
    >
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Sparkles className="size-5 text-primary" aria-hidden="true" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">Mint AI</span>
          <span className="text-xs text-muted-foreground">Agent Console</span>
        </div>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-4 text-xs text-muted-foreground">
        <p>x402 · Solana Devnet</p>
        <p>Filecoin FEVM · Calibration</p>
      </div>
    </aside>
  );
}
