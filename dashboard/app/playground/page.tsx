"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface ContentBlock {
  type: string;
  text?: string;
}

function renderResult(result: unknown): string {
  if (Array.isArray(result)) {
    return (result as ContentBlock[])
      .map((b) => (b.type === "text" ? b.text : ""))
      .filter(Boolean)
      .join("\n\n");
  }
  return JSON.stringify(result, null, 2);
}

function ServiceForm({
  service,
  fieldLabel,
  placeholder,
  call,
  price,
}: {
  service: "analyze" | "generate" | "predict";
  fieldLabel: string;
  placeholder: string;
  call: (input: string) => Promise<{ result: unknown; agent: string }>;
  price: string;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const inputId = `pg-${service}-input`;

  const onRun = async () => {
    if (!input.trim()) {
      toast.error(`${fieldLabel} cannot be empty`);
      return;
    }
    setBusy(true);
    setOutput("");
    try {
      const res = await call(input);
      setOutput(renderResult(res.result));
      toast.success(`${service} complete`);
    } catch (err) {
      toast.error(`${service} failed: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={inputId}>{fieldLabel}</Label>
          <Badge variant="outline">{price} per call</Badge>
        </div>
        <Textarea
          id={inputId}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          rows={3}
        />
      </div>
      <Button onClick={onRun} disabled={busy} type="button">
        {busy ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Play className="size-4" aria-hidden="true" />
        )}
        {busy ? "Running…" : `Run ${service}`}
      </Button>
      {output && (
        <Card aria-live="polite">
          <CardHeader>
            <CardTitle className="text-sm">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{output}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Playground</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Free demo mode - calls bypass x402 but still record earnings, update memory, and emit
          activity events.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Try the agent</CardTitle>
          <CardDescription>Pick a capability and send a request.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="analyze">
            <TabsList>
              <TabsTrigger value="analyze">Analyze</TabsTrigger>
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="predict">Predict</TabsTrigger>
            </TabsList>

            <TabsContent value="analyze">
              <ServiceForm
                service="analyze"
                fieldLabel="Query"
                placeholder="e.g. Summarize the state of Solana DeFi in 2026."
                price="$0.010"
                call={async (q) => {
                  const r = await api.playgroundAnalyze(q);
                  return r;
                }}
              />
            </TabsContent>
            <TabsContent value="generate">
              <ServiceForm
                service="generate"
                fieldLabel="Prompt"
                placeholder="e.g. Write a 2-sentence pitch for an autonomous AI agent."
                price="$0.005"
                call={async (q) => {
                  const r = await api.playgroundGenerate(q);
                  return r;
                }}
              />
            </TabsContent>
            <TabsContent value="predict">
              <ServiceForm
                service="predict"
                fieldLabel="Topic"
                placeholder="e.g. Filecoin storage demand over 12 months."
                price="$0.020"
                call={async (q) => {
                  const r = await api.playgroundPredict(q);
                  return r;
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
