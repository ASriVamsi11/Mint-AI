export type ServiceKind = "analyze" | "generate" | "predict";
export type ActivityKind = "earning" | "storage" | "reputation" | "system";

export interface PerService {
  requests: number;
  earningsUsd: number;
}

export interface AgentStatus {
  agent: string;
  wallet: string;
  totalEarningsUsd: number;
  totalRequests: number;
  perService: Record<ServiceKind, PerService>;
  bufferSize: number;
  totalBatches: number;
  uptime: number;
  contract: string | null;
}

export interface MemoryBatch {
  batchId: number;
  cid: string;
  entryCount: number;
  flushedAt: string;
  txAnchored: boolean;
}

export interface OnChainAnchor {
  cid: string;
  timestamp: number;
  entryCount: number;
}

export interface MemoriesResponse {
  agent: string;
  bufferSize: number;
  flushThreshold: number;
  totalBatches: number;
  batches: MemoryBatch[];
  onChainAnchors: OnChainAnchor[];
}

export interface OnChainAgent {
  wallet: string;
  name: string;
  registeredAt: number;
  active: boolean;
  reputation: number;
  totalRequests: number;
  totalEarningsUsd: number;
  perService: Record<ServiceKind, PerService>;
}

export interface IdentityResponse {
  agent: string;
  contract?: string;
  walletAddress?: string;
  status?: "off-chain";
  message?: string;
  onChain?: OnChainAgent | null;
}

export interface ActivityEvent {
  id: number;
  kind: ActivityKind;
  title: string;
  detail: string;
  timestamp: string;
}
