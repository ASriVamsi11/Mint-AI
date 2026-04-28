import { ethers } from "ethers";
import { config } from "../config.js";

const ABI = [
  "function registerAgent(string name) external",
  "function anchorMemory(string cid, uint32 entryCount) external",
  "function recordService(address agent, uint8 kind, uint64 amountMicro) external",
  "function setReputation(address agent, uint16 score) external",
  "function getAgent(address agent) external view returns (tuple(address wallet, string name, uint64 registeredAt, bool active))",
  "function getMemoryHistory(address agent) external view returns (tuple(string cid, uint64 timestamp, uint32 entryCount)[])",
  "function getMemoryHistoryLength(address agent) external view returns (uint256)",
  "function stats(address agent) external view returns (uint64 analyzeRequests, uint64 analyzeEarningsMicro, uint64 generateRequests, uint64 generateEarningsMicro, uint64 predictRequests, uint64 predictEarningsMicro)",
  "function reputation(address agent) external view returns (uint16)",
  "function totalRequests(address agent) external view returns (uint256)",
  "function totalEarningsMicro(address agent) external view returns (uint256)",
  "function getAllAgents() external view returns (address[])",
];

function fevmConfigured(): boolean {
  return Boolean(config.FEVM_PRIVATE_KEY && config.MINTAI_CONTRACT_ADDRESS);
}

function writeContract(): ethers.Contract {
  if (!fevmConfigured()) {
    throw new Error("FEVM_PRIVATE_KEY and MINTAI_CONTRACT_ADDRESS must be set");
  }
  const provider = new ethers.JsonRpcProvider(config.FEVM_RPC_URL);
  const wallet = new ethers.Wallet(config.FEVM_PRIVATE_KEY, provider);
  return new ethers.Contract(config.MINTAI_CONTRACT_ADDRESS, ABI, wallet);
}

function readContract(): ethers.Contract {
  if (!config.MINTAI_CONTRACT_ADDRESS) {
    throw new Error("MINTAI_CONTRACT_ADDRESS must be set");
  }
  const provider = new ethers.JsonRpcProvider(config.FEVM_RPC_URL);
  return new ethers.Contract(config.MINTAI_CONTRACT_ADDRESS, ABI, provider);
}

export function isFevmConfigured(): boolean {
  return fevmConfigured();
}

export function getAgentAddress(): string {
  if (!config.FEVM_PRIVATE_KEY) throw new Error("FEVM_PRIVATE_KEY not set");
  return new ethers.Wallet(config.FEVM_PRIVATE_KEY).address;
}

export async function registerAgent(name: string): Promise<void> {
  const contract = writeContract();
  const tx = await contract.registerAgent(name);
  console.log(`[Identity] registerAgent tx: ${tx.hash}`);
  await tx.wait();
}

export async function anchorMemory(cid: string, entryCount: number): Promise<void> {
  const contract = writeContract();
  const tx = await contract.anchorMemory(cid, entryCount);
  console.log(`[Identity] anchorMemory tx: ${tx.hash} (${cid}, n=${entryCount})`);
  await tx.wait();
}

export async function recordService(
  agent: string,
  kind: 0 | 1 | 2,
  amountMicro: number,
): Promise<void> {
  const contract = writeContract();
  const tx = await contract.recordService(agent, kind, amountMicro);
  console.log(`[Identity] recordService tx: ${tx.hash} (kind=${kind}, micro=${amountMicro})`);
  await tx.wait();
}

export interface OnChainAgent {
  wallet: string;
  name: string;
  registeredAt: number;
  active: boolean;
  reputation: number;
  totalRequests: number;
  totalEarningsUsd: number;
  perService: {
    analyze: { requests: number; earningsUsd: number };
    generate: { requests: number; earningsUsd: number };
    predict: { requests: number; earningsUsd: number };
  };
}

export async function readAgent(address: string): Promise<OnChainAgent | null> {
  const contract = readContract();
  const a = await contract.getAgent(address);
  if (!a.active) return null;

  const [rep, stats] = await Promise.all([
    contract.reputation(address) as Promise<bigint>,
    contract.stats(address) as Promise<[bigint, bigint, bigint, bigint, bigint, bigint]>,
  ]);

  const microToUsd = (n: bigint) => Number(n) / 1_000_000;

  return {
    wallet: a.wallet,
    name: a.name,
    registeredAt: Number(a.registeredAt),
    active: a.active,
    reputation: Number(rep),
    totalRequests:
      Number(stats[0]) + Number(stats[2]) + Number(stats[4]),
    totalEarningsUsd:
      microToUsd(stats[1]) + microToUsd(stats[3]) + microToUsd(stats[5]),
    perService: {
      analyze: { requests: Number(stats[0]), earningsUsd: microToUsd(stats[1]) },
      generate: { requests: Number(stats[2]), earningsUsd: microToUsd(stats[3]) },
      predict: { requests: Number(stats[4]), earningsUsd: microToUsd(stats[5]) },
    },
  };
}

export async function readMemoryHistory(address: string): Promise<
  { cid: string; timestamp: number; entryCount: number }[]
> {
  const contract = readContract();
  const list = (await contract.getMemoryHistory(address)) as Array<{
    cid: string;
    timestamp: bigint;
    entryCount: bigint;
  }>;
  return list.map((m) => ({
    cid: m.cid,
    timestamp: Number(m.timestamp),
    entryCount: Number(m.entryCount),
  }));
}
