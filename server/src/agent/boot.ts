import { ethers } from "ethers";
import { config } from "../config.js";
import {
  isFevmConfigured,
  getAgentAddress,
  readAgent,
  registerAgent,
} from "../services/identity.js";
import { activityLog } from "./activity.js";

export async function boot(): Promise<void> {
  console.log("[Boot] MintAI agent boot sequence starting...");

  if (!isFevmConfigured()) {
    console.warn("[Boot] FEVM not configured — running in off-chain mode");
    activityLog.push("system", "Agent booted (off-chain)", "FEVM credentials missing — on-chain features disabled");
    return;
  }

  try {
    const address = getAgentAddress();
    console.log(`[Boot] FEVM wallet: ${address}`);

    const existing = await readAgent(address);
    if (existing) {
      console.log(`[Boot] Already registered on-chain as "${existing.name}" (rep=${existing.reputation})`);
      activityLog.push(
        "system",
        "Agent online",
        `Existing on-chain identity ${address} (${existing.name})`,
      );
      return;
    }

    console.log(`[Boot] Registering "${config.AGENT_NAME}" on-chain...`);
    await registerAgent(config.AGENT_NAME);
    activityLog.push(
      "system",
      "Agent registered on-chain",
      `Name: ${config.AGENT_NAME} · Wallet: ${address}`,
    );
    console.log("[Boot] Registration complete");
  } catch (err) {
    console.error("[Boot] Boot error (non-fatal):", err);
    activityLog.push("system", "Boot completed with warnings", (err as Error).message);
  }
}
