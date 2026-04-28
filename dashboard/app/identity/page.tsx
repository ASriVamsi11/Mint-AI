"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/CopyButton";
import { ServiceBreakdown } from "@/components/ServiceBreakdown";
import { ErrorState } from "@/components/ErrorState";
import { usePolling } from "@/lib/usePolling";
import { api } from "@/lib/api";
import { formatUsd, shortAddr } from "@/lib/utils";

function reputationTier(score: number): { name: string; variant: "default" | "secondary" | "success" | "warning" } {
  if (score >= 900) return { name: "Diamond", variant: "default" };
  if (score >= 750) return { name: "Platinum", variant: "default" };
  if (score >= 600) return { name: "Gold", variant: "warning" };
  if (score >= 400) return { name: "Silver", variant: "secondary" };
  return { name: "Bronze", variant: "secondary" };
}

export default function IdentityPage() {
  const id = usePolling(api.identity, 8000);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Identity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          On-chain identity, reputation, and per-service stats from MintAIRegistry.
        </p>
      </header>

      {id.error && (
        <ErrorState
          message={`Could not read identity (${id.error.message}).`}
          onRetry={() => void id.refetch()}
        />
      )}

      {id.data?.status === "off-chain" ? (
        <Card>
          <CardHeader>
            <CardTitle>Off-chain mode</CardTitle>
            <CardDescription>
              FEVM is not configured on the server. Set <code>FEVM_PRIVATE_KEY</code> and{" "}
              <code>MINTAI_CONTRACT_ADDRESS</code> in <code>server/.env</code> to enable on-chain identity.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : id.loading || !id.data?.onChain ? (
        <SkeletonGrid />
      ) : (
        (() => {
          const onChain = id.data.onChain;
          const tier = reputationTier(onChain.reputation);
          const initials = onChain.name
            .split("-")
            .map((s) => s[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="size-14">
                      <AvatarFallback className="bg-primary/15 text-primary text-lg font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle>{onChain.name}</CardTitle>
                      <CardDescription>
                        Registered{" "}
                        {new Date(onChain.registeredAt * 1000).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <Row label="FEVM wallet">
                    <span className="font-mono">{shortAddr(onChain.wallet)}</span>
                    <CopyButton value={onChain.wallet} label="FEVM wallet" />
                  </Row>
                  <Row label="Status">
                    <Badge variant={onChain.active ? "success" : "destructive"}>
                      {onChain.active ? "active" : "inactive"}
                    </Badge>
                  </Row>
                  {id.data.contract && (
                    <Row label="Contract">
                      <span className="font-mono text-xs">{shortAddr(id.data.contract)}</span>
                      <CopyButton value={id.data.contract} label="Contract address" />
                    </Row>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reputation</CardTitle>
                  <CardDescription>0–1000 scale, set by the contract admin.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-3">
                    <p className="tabular text-4xl font-semibold">{onChain.reputation}</p>
                    <span className="text-sm text-muted-foreground">/ 1000</span>
                    <Badge variant={tier.variant} className="ml-auto">
                      {tier.name}
                    </Badge>
                  </div>
                  <Progress
                    value={(onChain.reputation / 1000) * 100}
                    aria-label={`Reputation score: ${onChain.reputation} of 1000`}
                  />
                  <Separator />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total requests</p>
                      <p className="tabular text-xl font-semibold">{onChain.totalRequests}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total earned</p>
                      <p className="tabular text-xl font-semibold">
                        {formatUsd(onChain.totalEarningsUsd)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Service breakdown</CardTitle>
                  <CardDescription>Per-service stats (read on-chain).</CardDescription>
                </CardHeader>
                <CardContent>
                  <ServiceBreakdown perService={onChain.perService} />
                </CardContent>
              </Card>
            </div>
          );
        })()
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-12 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
