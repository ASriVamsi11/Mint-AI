import { Router, type Request, type Response } from "express";
import { activityLog, type ActivityKind } from "../agent/activity.js";

const router = Router();

const KINDS: ActivityKind[] = ["earning", "storage", "reputation", "system"];

router.get("/", (req: Request, res: Response) => {
  const { kind } = req.query;
  if (kind && typeof kind === "string" && (KINDS as string[]).includes(kind)) {
    res.json(activityLog.byKind(kind as ActivityKind));
    return;
  }
  res.json(activityLog.recent());
});

export default router;
