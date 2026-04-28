"use client";

import { Coins, Database, Star, Settings2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ErrorState";
import { usePolling } from "@/lib/usePolling";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import type { ActivityEvent, ActivityKind } from "@/lib/types";

const KIND_META: Record<ActivityKind, { label: string; icon: React.ReactNode; tone: "default" | "success" | "secondary" | "warning" }> = {
  earning: { label: "Earning", icon: <Coins className="size-4" aria-hidden="true" />, tone: "success" },
  storage: { label: "Storage", icon: <Database className="size-4" aria-hidden="true" />, tone: "default" },
  reputation: { label: "Reputation", icon: <Star className="size-4" aria-hidden="true" />, tone: "warning" },
  system: { label: "System", icon: <Settings2 className="size-4" aria-hidden="true" />, tone: "secondary" },
};

export default function ActivityPage() {
  const events = usePolling(api.activity, 5000);

  const all = events.data ?? [];
  const filtered = (kind: ActivityKind | "all") =>
    kind === "all" ? all : all.filter((e) => e.kind === kind);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live event feed - paid requests, memory flushes, and on-chain operations.
        </p>
      </header>

      {events.error && (
        <ErrorState
          message={`Could not load activity (${events.error.message}).`}
          onRetry={() => void events.refetch()}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>
            Polling every 5 seconds. {all.length} total event{all.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList aria-label="Filter activity by kind" className="flex-wrap">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="earning">Earning</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="reputation">Reputation</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            {(["all", "earning", "storage", "reputation", "system"] as const).map((k) => (
              <TabsContent key={k} value={k}>
                <Feed events={filtered(k)} loading={events.loading} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function Feed({ events, loading }: { events: ActivityEvent[]; loading: boolean }) {
  if (loading && events.length === 0) {
    return (
      <ul className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <li key={i}>
            <Skeleton className="h-14 w-full" />
          </li>
        ))}
      </ul>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
        <AlertCircle className="size-5" aria-hidden="true" />
        No events yet.
      </div>
    );
  }

  return (
    <ul className="space-y-2" aria-label="Activity events">
      {events.map((e) => {
        const meta = KIND_META[e.kind];
        return (
          <li
            key={e.id}
            className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-4"
          >
            <span className="mt-0.5 text-muted-foreground" aria-hidden="true">
              {meta.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{e.title}</p>
                <Badge variant={meta.tone}>{meta.label}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{e.detail}</p>
            </div>
            <time
              dateTime={e.timestamp}
              className="shrink-0 tabular text-xs text-muted-foreground"
            >
              {timeAgo(e.timestamp)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
