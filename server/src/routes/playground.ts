import { Router, type Request, type Response } from "express";
import { analyze, generate, predict, chat } from "../services/claude.js";
import { recordPaidRequest } from "../agent/recorder.js";
import { config, PRICES, type ServiceKind } from "../config.js";
import { activityLog } from "../agent/activity.js";
import { agentWallet } from "../agent/wallet.js";
import { agentMemory } from "../agent/memory.js";

const router = Router();

router.post("/analyze", async (req: Request, res: Response) => {
  const { query } = req.body ?? {};
  if (!query || typeof query !== "string") {
    res.status(400).json({ error: "query is required" });
    return;
  }
  try {
    const response = await analyze(query);
    await recordPaidRequest("analyze", query, response);
    res.json({ result: response, agent: config.AGENT_NAME, service: "analyze" });
  } catch {
    res.status(500).json({ error: "analysis failed" });
  }
});

router.post("/generate", async (req: Request, res: Response) => {
  const { prompt } = req.body ?? {};
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "prompt is required" });
    return;
  }
  try {
    const response = await generate(prompt);
    await recordPaidRequest("generate", prompt, response);
    res.json({ result: response, agent: config.AGENT_NAME, service: "generate" });
  } catch {
    res.status(500).json({ error: "generation failed" });
  }
});

router.post("/predict", async (req: Request, res: Response) => {
  const { topic } = req.body ?? {};
  if (!topic || typeof topic !== "string") {
    res.status(400).json({ error: "topic is required" });
    return;
  }
  try {
    const response = await predict(topic);
    await recordPaidRequest("predict", topic, response);
    res.json({ result: response, agent: config.AGENT_NAME, service: "predict" });
  } catch {
    res.status(500).json({ error: "prediction failed" });
  }
});

router.post("/chat", async (req: Request, res: Response) => {
  const { message, history } = req.body ?? {};
  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "message is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await chat(message, Array.isArray(history) ? history : []);
    let fullText = "";

    stream.on("text", (text) => {
      fullText += text;
      res.write(`data: ${JSON.stringify({ type: "text", text })}\n\n`);
    });

    stream.on("end", () => {
      const lower = message.toLowerCase();
      let kind: ServiceKind = "analyze";
      if (lower.includes("generate") || lower.includes("write") || lower.includes("create")) kind = "generate";
      if (lower.includes("predict") || lower.includes("forecast") || lower.includes("trend")) kind = "predict";

      const priceUsd = PRICES[kind];
      agentWallet.record(kind, priceUsd);
      agentMemory.add({
        serviceKind: kind,
        query: message,
        response: [{ type: "text", text: fullText }],
      });
      activityLog.push(
        "earning",
        `Earned $${priceUsd.toFixed(3)} - /api/playground/chat (${kind})`,
        `"${message.slice(0, 80)}"`,
      );

      res.write(`data: ${JSON.stringify({ type: "done", service: kind })}\n\n`);
      res.end();
    });

    stream.on("error", () => {
      res.write(`data: ${JSON.stringify({ type: "error", error: "stream failed" })}\n\n`);
      res.end();
    });
  } catch {
    res.write(`data: ${JSON.stringify({ type: "error", error: "chat failed" })}\n\n`);
    res.end();
  }
});

export default router;
