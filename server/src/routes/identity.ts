import { Router, type Request, type Response } from "express";
import { isFevmConfigured, getAgentAddress, readAgent } from "../services/identity.js";
import { config } from "../config.js";

const router = Router();

// GET /api/identity - agent's on-chain identity, per-service stats, reputation
router.get("/", async (_req: Request, res: Response) => {
  if (!isFevmConfigured()) {
    res.json({
      agent: config.AGENT_NAME,
      status: "off-chain",
      message: "FEVM not configured",
    });
    return;
  }
  try {
    const address = getAgentAddress();
    const onChain = await readAgent(address);
    res.json({
      agent: config.AGENT_NAME,
      contract: config.MINTAI_CONTRACT_ADDRESS,
      walletAddress: address,
      onChain,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
