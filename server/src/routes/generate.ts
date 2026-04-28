import { Router, type Request, type Response } from "express";
import { generate } from "../services/claude.js";
import { recordPaidRequest } from "../agent/recorder.js";
import { config } from "../config.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { prompt } = req.query;
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "prompt parameter is required" });
    return;
  }

  try {
    const response = await generate(prompt);
    await recordPaidRequest("generate", prompt, response);
    res.json({ result: response, agent: config.AGENT_NAME, service: "generate" });
  } catch (err) {
    console.error("[/api/generate]", err);
    res.status(500).json({ error: "generation failed" });
  }
});

export default router;
