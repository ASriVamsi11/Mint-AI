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
  Menu,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/memory", label: "Memory", icon: Database },
  { href: "/identity", label: "Identity", icon: Fingerprint },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/playground", label: "Playground", icon: PlayCircle },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open navigation menu" className="md:hidden">
          <Menu className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[12rem]">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden="true" />
          Mint AI
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("flex items-center gap-2", active && "font-semibold")}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
