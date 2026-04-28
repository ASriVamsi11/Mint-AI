import "dotenv/config";

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const config = {
  SVM_ADDRESS: requireEnv("SVM_ADDRESS"),
  SVM_PRIVATE_KEY: requireEnv("SVM_PRIVATE_KEY"),
  FACILITATOR_URL: process.env.FACILITATOR_URL || "https://x402.org/facilitator",
  ANTHROPIC_API_KEY: requireEnv("ANTHROPIC_API_KEY"),
  LIGHTHOUSE_API_KEY: process.env.LIGHTHOUSE_API_KEY || "",
  FEVM_RPC_URL: process.env.FEVM_RPC_URL || "https://api.calibration.node.glif.io/rpc/v1",
  FEVM_PRIVATE_KEY: process.env.FEVM_PRIVATE_KEY || "",
  MINTAI_CONTRACT_ADDRESS: process.env.MINTAI_CONTRACT_ADDRESS || "",
  AGENT_NAME: process.env.AGENT_NAME || "MintAI-Genesis",
  PORT: parseInt(process.env.PORT || "4022", 10),
};

export const PRICES = {
  analyze: 0.01,
  generate: 0.005,
  predict: 0.02,
} as const;

export type ServiceKind = keyof typeof PRICES;

export const SERVICE_KIND_INDEX: Record<ServiceKind, 0 | 1 | 2> = {
  analyze: 0,
  generate: 1,
  predict: 2,
};
