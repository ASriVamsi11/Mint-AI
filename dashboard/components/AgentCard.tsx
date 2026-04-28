import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/CopyButton";
import { shortAddr } from "@/lib/utils";
import type { AgentStatus } from "@/lib/types";

export function AgentCard({ status }: { status: AgentStatus }) {
  const initials = status.agent
    .split("-")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const uptimeMin = Math.floor(status.uptime / 60);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarFallback className="bg-primary/15 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">{status.agent}</CardTitle>
            <CardDescription className="font-mono text-xs">
              {shortAddr(status.wallet)}
            </CardDescription>
          </div>
          <CopyButton value={status.wallet} label="Solana wallet" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Uptime</span>
          <span className="tabular">{uptimeMin}m</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Memory buffer</span>
          <span className="tabular">{status.bufferSize} / 10</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Filecoin batches</span>
          <span className="tabular">{status.totalBatches}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">FEVM contract</span>
          {status.contract ? (
            <Badge variant="outline" className="font-mono">
              {shortAddr(status.contract)}
            </Badge>
          ) : (
            <Badge variant="warning">off-chain</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
