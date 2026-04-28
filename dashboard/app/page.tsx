"use client";

import { Coins, Zap, Database, Clock } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { EarningsChart } from "@/components/EarningsChart";
import { AgentCard } from "@/components/AgentCard";
import { ServiceBreakdown } from "@/components/ServiceBreakdown";
import { ErrorState } from "@/components/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePolling } from "@/lib/usePolling";
import { api } from "@/lib/api";
import { formatUsd } from "@/lib/utils";

export default function OverviewPage() {
  const status = usePolling(api.status, 6000);
  const activity = usePolling(api.activity, 7000);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live agent metrics — earnings, memory, and on-chain identity at a glance.
        </p>
      </header>

      {status.error && (
        <ErrorState
          title="Agent server unreachable"
          message={`Could not reach the MintAI server (${status.error.message}). Make sure it is running on port 4022.`}
          onRetry={() => void status.refetch()}
        />
      )}

      <section aria-labelledby="kpis-heading" className="space-y-3">
        <h2 id="kpis-heading" className="sr-only">
          Key metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total earnings"
            value={status.data ? formatUsd(status.data.totalEarningsUsd) : null}
            hint="USDC settled via x402"
            loading={status.loading}
            icon={<Coins className="size-4" aria-hidden="true" />}
          />
          <KpiCard
            label="Paid requests"
            value={status.data?.totalRequests ?? null}
            hint="across analyze + generate + predict"
            loading={status.loading}
            icon={<Zap className="size-4" aria-hidden="true" />}
          />
          <KpiCard
            label="Memory buffer"
            value={status.data ? `${status.data.bufferSize} / 10` : null}
            hint="auto-flushes to Filecoin at 10"
            loading={status.loading}
            icon={<Database className="size-4" aria-hidden="true" />}
          />
          <KpiCard
            label="Uptime"
            value={status.data ? `${Math.floor(status.data.uptime / 60)}m` : null}
            hint="server process"
            loading={status.loading}
            icon={<Clock className="size-4" aria-hidden="true" />}
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cumulative earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.loading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <EarningsChart events={activity.data ?? []} />
            )}
          </CardContent>
        </Card>

        {status.data ? (
          <AgentCard status={status.data} />
        ) : (
          <Card>
            <CardHeader>
              <Skeleton className="h-12 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Service breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {status.data ? (
              <ServiceBreakdown perService={status.data.perService} />
            ) : (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
