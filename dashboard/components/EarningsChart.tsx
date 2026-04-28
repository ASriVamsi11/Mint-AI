"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { ChartOptions, TooltipItem } from "chart.js";
import type { ActivityEvent } from "@/lib/types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function parseEarning(detail: string, title: string): number {
  // title format: "Earned $0.010 - /api/analyze"
  const match = title.match(/\$([0-9]+\.[0-9]+)/);
  if (match) return parseFloat(match[1]);
  void detail;
  return 0;
}

export function EarningsChart({ events }: { events: ActivityEvent[] }) {
  const earnings = useMemo(() => {
    const sorted = [...events]
      .filter((e) => e.kind === "earning")
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let cumulative = 0;
    return sorted.map((e) => {
      cumulative += parseEarning(e.detail, e.title);
      return { ts: e.timestamp, cumulative };
    });
  }, [events]);

  const accentRef = useRef("#22d3ee");
  const [, setTick] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    const v = styles.getPropertyValue("--primary").trim();
    if (v) accentRef.current = `hsl(${v})`;
    setTick((t) => t + 1);
  }, []);

  const data = {
    labels: earnings.map((e) => new Date(e.ts).toLocaleTimeString()),
    datasets: [
      {
        label: "Cumulative earnings (USDC)",
        data: earnings.map((e) => e.cumulative),
        borderColor: accentRef.current,
        backgroundColor: `${accentRef.current}33`,
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"line">) =>
            `$${(ctx.parsed.y ?? 0).toFixed(3)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "rgb(148 163 184)" } },
      y: {
        grid: { color: "rgba(148, 163, 184, 0.15)" },
        ticks: {
          color: "rgb(148 163 184)",
          callback: (v) => `$${Number(v).toFixed(2)}`,
        },
        beginAtZero: true,
      },
    },
  };

  if (earnings.length === 0) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center text-sm text-muted-foreground">
        No earnings recorded yet - call a paid endpoint to populate this chart.
      </div>
    );
  }

  return (
    <div className="h-[280px]">
      <Line data={data} options={options} />
    </div>
  );
}
