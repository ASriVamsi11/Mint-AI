import { fetchWithPayment, MINTAI_SERVER_URL } from "./index.js";

interface AgentResponse {
  result: unknown;
  agent: string;
  service: string;
}

const PAD = 28;

async function callPaid(
  label: string,
  url: string,
  expectedCostUsd: number,
): Promise<number> {
  console.log(`\n──── ${label.padEnd(PAD)} ────`);
  console.log(`  URL:   ${url}`);
  console.log(`  Cost:  $${expectedCostUsd.toFixed(3)} USDC`);

  const res = await fetchWithPayment(url);
  if (!res.ok) {
    const body = await res.text();
    console.error(`  ✗ HTTP ${res.status}: ${body}`);
    return 0;
  }

  const data = (await res.json()) as AgentResponse;
  console.log(`  Agent: ${data.agent}`);
  console.log(`  Service: ${data.service}`);
  const text = JSON.stringify(data.result, null, 2);
  console.log(`  Result preview:\n${text.slice(0, 300)}${text.length > 300 ? " …" : ""}`);
  return expectedCostUsd;
}

async function main() {
  console.log("════════════════════════════════════════════════════════");
  console.log("  MintAI x402 Consumer Demo");
  console.log("════════════════════════════════════════════════════════");
  console.log(`  Server: ${MINTAI_SERVER_URL}`);

  let totalSpend = 0;
  totalSpend += await callPaid(
    "analyze ($0.010)",
    `${MINTAI_SERVER_URL}/api/analyze?query=${encodeURIComponent("Solana DeFi growth in 2026")}`,
    0.01,
  );
  totalSpend += await callPaid(
    "generate ($0.005)",
    `${MINTAI_SERVER_URL}/api/generate?prompt=${encodeURIComponent("a 2-sentence pitch for an autonomous AI agent")}`,
    0.005,
  );
  totalSpend += await callPaid(
    "predict ($0.020)",
    `${MINTAI_SERVER_URL}/api/predict?topic=${encodeURIComponent("Filecoin storage demand over the next 12 months")}`,
    0.02,
  );

  console.log("\n════════════════════════════════════════════════════════");
  console.log(`  Summary - total spent: $${totalSpend.toFixed(3)} USDC`);
  console.log(`  Settlement: Solana Devnet via x402 facilitator`);
  console.log("════════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
