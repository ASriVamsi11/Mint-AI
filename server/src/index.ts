import "dotenv/config";
import express from "express";
import cors from "cors";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactSvmScheme } from "@x402/svm/exact/server";
import { config } from "./config.js";
import { agentMemory } from "./agent/memory.js";
import { agentWallet } from "./agent/wallet.js";
import { boot } from "./agent/boot.js";
import analyzeRouter from "./routes/analyze.js";
import generateRouter from "./routes/generate.js";
import predictRouter from "./routes/predict.js";
import storageRouter from "./routes/storage.js";
import identityRouter from "./routes/identity.js";
import activityRouter from "./routes/activity.js";
import playgroundRouter from "./routes/playground.js";

const SOLANA_NETWORK = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1";

const app = express();
app.use(cors());
app.use(express.json());

// x402 resource server - wires Solana payment scheme to the facilitator
const facilitator = new HTTPFacilitatorClient({ url: config.FACILITATOR_URL });
const resourceServer = new x402ResourceServer(facilitator).register(
  SOLANA_NETWORK,
  new ExactSvmScheme(),
);

// Payment middleware - gates the three paid endpoints
app.use(
  paymentMiddleware(
    {
      "GET /api/analyze": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.01",
            network: SOLANA_NETWORK,
            payTo: config.SVM_ADDRESS,
          },
        ],
        description: "MintAI - data analysis",
        mimeType: "application/json",
      },
      "GET /api/generate": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.005",
            network: SOLANA_NETWORK,
            payTo: config.SVM_ADDRESS,
          },
        ],
        description: "MintAI - content generation",
        mimeType: "application/json",
      },
      "GET /api/predict": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.02",
            network: SOLANA_NETWORK,
            payTo: config.SVM_ADDRESS,
          },
        ],
        description: "MintAI - market prediction",
        mimeType: "application/json",
      },
    },
    resourceServer,
  ),
);

// Paid routes (gated by x402)
app.use("/api/analyze", analyzeRouter);
app.use("/api/generate", generateRouter);
app.use("/api/predict", predictRouter);

// Free routes (dashboard polls these)
app.use("/api/storage", storageRouter);
app.use("/api/identity", identityRouter);
app.use("/api/activity", activityRouter);
app.use("/api/playground", playgroundRouter);

app.get("/api/status", (_req, res) => {
  const totals = agentWallet.totals();
  res.json({
    agent: config.AGENT_NAME,
    wallet: config.SVM_ADDRESS,
    totalEarningsUsd: totals.totalEarningsUsd,
    totalRequests: totals.totalRequests,
    perService: totals.perService,
    bufferSize: agentMemory.bufferSize(),
    totalBatches: agentMemory.getBatches().length,
    uptime: process.uptime(),
    contract: config.MINTAI_CONTRACT_ADDRESS || null,
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, agent: config.AGENT_NAME });
});

boot().then(() => {
  app.listen(config.PORT, () => {
    console.log(`\n${config.AGENT_NAME} listening on http://localhost:${config.PORT}`);
    console.log(`  Solana wallet: ${config.SVM_ADDRESS}`);
    console.log(`  Paid: /api/analyze ($0.01) /api/generate ($0.005) /api/predict ($0.02)`);
    console.log(`  Free: /api/status /api/identity /api/storage/* /api/activity /api/playground/*\n`);
  });
});
