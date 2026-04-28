import { Router, type Request, type Response } from "express";
import { predict } from "../services/claude.js";
import { recordPaidRequest } from "../agent/recorder.js";
import { config } from "../config.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { topic } = req.query;
  if (!topic || typeof topic !== "string") {
    res.status(400).json({ error: "topic parameter is required" });
    return;
  }

  try {
    const response = await predict(topic);
    await recordPaidRequest("predict", topic, response);
    res.json({ result: response, agent: config.AGENT_NAME, service: "predict" });
  } catch (err) {
    console.error("[/api/predict]", err);
    res.status(500).json({ error: "prediction failed" });
  }
});

export default router;
