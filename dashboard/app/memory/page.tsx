"use client";

import { ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ErrorState";
import { CopyButton } from "@/components/CopyButton";
import { KpiCard } from "@/components/KpiCard";
import { usePolling } from "@/lib/usePolling";
import { api } from "@/lib/api";
import { shortAddr, timeAgo } from "@/lib/utils";

export default function MemoryPage() {
  const [flushing, setFlushing] = useState(false);
  const memories = usePolling(api.memories, 7000);

  const onFlush = async () => {
    setFlushing(true);
    try {
      const res = await api.flush();
      toast.success(res.message ?? "Memory flushed");
      void memories.refetch();
    } catch (err) {
      toast.error(`Flush failed: ${(err as Error).message}`);
    } finally {
      setFlushing(false);
    }
  };

  const data = memories.data;
  const anchors = data?.onChainAnchors ?? [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Memory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Filecoin-anchored memory batches. Buffer flushes automatically every 10 entries.
          </p>
        </div>
        <Button onClick={onFlush} disabled={flushing} size="sm" variant="outline">
          <RefreshCw className={flushing ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
          {flushing ? "Flushing…" : "Flush now"}
        </Button>
      </header>

      {memories.error && (
        <ErrorState
          message={`Could not load memory state (${memories.error.message}).`}
          onRetry={() => void memories.refetch()}
        />
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Buffer size"
          value={data ? `${data.bufferSize} / ${data.flushThreshold}` : null}
          loading={memories.loading}
        />
        <KpiCard
          label="Total batches"
          value={data?.totalBatches ?? null}
          hint="flushed to Filecoin"
          loading={memories.loading}
        />
        <KpiCard
          label="On-chain anchors"
          value={anchors.length}
          hint="from MintAIRegistry"
          loading={memories.loading}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Memory batches</CardTitle>
          <CardDescription>
            Each batch is uploaded to Filecoin via Lighthouse. The CID is anchored on the
            MintAIRegistry contract for verifiability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {memories.loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (data?.batches ?? []).length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No batches yet. Run the consumer demo or click <strong>Flush now</strong> to write
              the buffer to Filecoin.
            </p>
          ) : (
            <Table>
              <caption className="sr-only">List of memory batches with CIDs and timestamps.</caption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Batch</TableHead>
                  <TableHead scope="col">CID</TableHead>
                  <TableHead scope="col">Entries</TableHead>
                  <TableHead scope="col">Anchored</TableHead>
                  <TableHead scope="col">Flushed</TableHead>
                  <TableHead scope="col" className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.batches ?? []).map((b) => (
                  <TableRow key={b.batchId}>
                    <TableCell className="tabular font-medium">#{b.batchId}</TableCell>
                    <TableCell className="font-mono text-xs">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">{shortAddr(b.cid, 8, 6)}</span>
                        </TooltipTrigger>
                        <TooltipContent>{b.cid}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="tabular">{b.entryCount}</TableCell>
                    <TableCell>
                      {b.txAnchored ? (
                        <Badge variant="success">on-chain</Badge>
                      ) : (
                        <Badge variant="outline">off-chain</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {timeAgo(b.flushedAt)}
                    </TableCell>
                    <TableCell className="flex items-center justify-end gap-1">
                      <CopyButton value={b.cid} label="CID" />
                      <Button
                        asChild
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        aria-label={`Open batch ${b.batchId} on Lighthouse gateway`}
                      >
                        <a
                          href={`https://gateway.lighthouse.storage/ipfs/${b.cid}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="size-3.5" aria-hidden="true" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>On-chain anchor history</CardTitle>
          <CardDescription>
            Append-only history read directly from MintAIRegistry.getMemoryHistory().
          </CardDescription>
        </CardHeader>
        <CardContent>
          {anchors.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No on-chain anchors yet. Configure FEVM credentials and flush to populate.
            </p>
          ) : (
            <Table>
              <caption className="sr-only">On-chain memory anchors.</caption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">CID</TableHead>
                  <TableHead scope="col">Entries</TableHead>
                  <TableHead scope="col">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anchors.map((a, i) => (
                  <TableRow key={`${a.cid}-${i}`}>
                    <TableCell className="font-mono text-xs">{shortAddr(a.cid, 8, 6)}</TableCell>
                    <TableCell className="tabular">{a.entryCount}</TableCell>
                    <TableCell className="text-muted-foreground">{timeAgo(a.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
