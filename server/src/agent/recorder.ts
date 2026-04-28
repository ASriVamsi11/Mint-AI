import {
  isFevmConfigured,
  recordService as recordServiceOnChain,
  getAgentAddress,
} from "../services/identity.js";
import { agentWallet } from "./wallet.js";
import { activityLog } from "./activity.js";
import { agentMemory } from "./memory.js";
import { config, PRICES, SERVICE_KIND_INDEX, type ServiceKind } from "../config.js";

/// Records an earned payment in three places:
///  1. In-memory wallet ledger (powers /api/status)
///  2. On-chain MintAIRegistry (per-service breakdown)
///  3. Memory buffer (the request itself, batched to Filecoin)
///  4. Activity feed
export async function recordPaidRequest(
  kind: ServiceKind,
  query: string,
  response: unknown,
): Promise<void> {
  const priceUsd = PRICES[kind];

  agentWallet.record(kind, priceUsd);
  agentMemory.add({ serviceKind: kind, query, response });
  activityLog.push(
    "earning",
    `Earned $${priceUsd.toFixed(3)} — /api/${kind}`,
    `"${query.slice(0, 80)}"`,
  );

  if (isFevmConfigured()) {
    try {
      const agentAddr = getAgentAddress();
      const microUsd = Math.round(priceUsd * 1_000_000);
      // Fire-and-forget — don't block the HTTP response on FEVM tx confirmation
      recordServiceOnChain(agentAddr, SERVICE_KIND_INDEX[kind], microUsd).catch((err) =>
        console.warn(`[Recorder] recordService(${kind}) failed:`, err.message ?? err),
      );
    } catch (err) {
      console.warn("[Recorder] Skipped on-chain record:", (err as Error).message);
    }
  }
  void config; // suppress unused warning if config import elided in some bundlers
}
