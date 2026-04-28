import type { ServiceKind } from "../config.js";

interface ServiceLedger {
  requests: number;
  earningsUsd: number;
}

class AgentWallet {
  private ledger: Record<ServiceKind, ServiceLedger> = {
    analyze: { requests: 0, earningsUsd: 0 },
    generate: { requests: 0, earningsUsd: 0 },
    predict: { requests: 0, earningsUsd: 0 },
  };

  record(kind: ServiceKind, amountUsd: number): void {
    this.ledger[kind].requests += 1;
    this.ledger[kind].earningsUsd += amountUsd;
  }

  totals() {
    const totalRequests =
      this.ledger.analyze.requests +
      this.ledger.generate.requests +
      this.ledger.predict.requests;
    const totalEarningsUsd =
      this.ledger.analyze.earningsUsd +
      this.ledger.generate.earningsUsd +
      this.ledger.predict.earningsUsd;
    return { totalRequests, totalEarningsUsd, perService: { ...this.ledger } };
  }
}

export const agentWallet = new AgentWallet();
