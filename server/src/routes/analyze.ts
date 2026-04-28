import { Router, type Request, type Response } from "express";
import { analyze } from "../services/claude.js";
import { recordPaidRequest } from "../agent/recorder.js";
import { config } from "../config.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { query } = req.query;
  if (!query || typeof query !== "string") {
    res.status(400).json({ error: "query parameter is required" });
    return;
  }

  try {
    const response = await analyze(query);
    await recordPaidRequest("analyze", query, response);
    res.json({ result: response, agent: config.AGENT_NAME, service: "analyze" });
  } catch (err) {
    console.error("[/api/analyze]", err);
    res.status(500).json({ error: "analysis failed" });
  }
});

export default router;
