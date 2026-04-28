import { Router, type Request, type Response } from "express";
import { agentMemory } from "../agent/memory.js";
import { fetchFromFilecoin } from "../services/storage.js";
import { readMemoryHistory, isFevmConfigured, getAgentAddress } from "../services/identity.js";
import { config } from "../config.js";

const router = Router();

// GET /api/storage/memories — list all memory batches (in-memory state)
router.get("/memories", async (_req: Request, res: Response) => {
  const batches = agentMemory.getBatches();
  let onChain: Awaited<ReturnType<typeof readMemoryHistory>> | null = null;
  if (isFevmConfigured()) {
    try {
      onChain = await readMemoryHistory(getAgentAddress());
    } catch (err) {
      console.warn("[/storage/memories] readMemoryHistory failed:", (err as Error).message);
    }
  }
  res.json({
    agent: config.AGENT_NAME,
    bufferSize: agentMemory.bufferSize(),
    flushThreshold: 10,
    totalBatches: batches.length,
    batches,
    onChainAnchors: onChain ?? [],
  });
});

// GET /api/storage/memory/:cid — retrieve a specific memory batch from Filecoin gateway
router.get("/memory/:cid", async (req: Request, res: Response) => {
  try {
    const data = await fetchFromFilecoin(req.params.cid);
    res.json({ cid: req.params.cid, data });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/storage/flush — manual flush trigger
router.post("/flush", async (_req: Request, res: Response) => {
  try {
    const batch = await agentMemory.flush();
    if (!batch) {
      res.json({ message: "Nothing to flush", bufferSize: agentMemory.bufferSize() });
      return;
    }
    res.json({ message: "Memory flushed", batch });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
