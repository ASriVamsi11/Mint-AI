import { Progress } from "@/components/ui/progress";
import type { PerService, ServiceKind } from "@/lib/types";

interface Row {
  kind: ServiceKind;
  label: string;
  data: PerService;
  pricePerCall: number;
}

const ROWS: Pick<Row, "kind" | "label" | "pricePerCall">[] = [
  { kind: "analyze", label: "Analyze", pricePerCall: 0.01 },
  { kind: "generate", label: "Generate", pricePerCall: 0.005 },
  { kind: "predict", label: "Predict", pricePerCall: 0.02 },
];

export function ServiceBreakdown({
  perService,
}: {
  perService: Record<ServiceKind, PerService>;
}) {
  const totalEarnings = ROWS.reduce(
    (acc, r) => acc + perService[r.kind].earningsUsd,
    0,
  );

  return (
    <div className="space-y-5">
      {ROWS.map((r) => {
        const data = perService[r.kind];
        const pct =
          totalEarnings > 0 ? (data.earningsUsd / totalEarnings) * 100 : 0;
        return (
          <div key={r.kind} className="space-y-2">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">{r.label}</span>
              <span className="tabular text-muted-foreground">
                {data.requests} req · ${data.earningsUsd.toFixed(3)}
              </span>
            </div>
            <Progress
              value={pct}
              aria-label={`${r.label}: ${data.requests} requests totalling $${data.earningsUsd.toFixed(3)}`}
            />
            <p className="text-xs text-muted-foreground">
              ${r.pricePerCall.toFixed(3)} per call
            </p>
          </div>
        );
      })}
    </div>
  );
}
