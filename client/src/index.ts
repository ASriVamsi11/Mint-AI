import "dotenv/config";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactSvmScheme } from "@x402/svm/exact/client";
import { createKeyPairSignerFromBytes } from "@solana/kit";
import { base58 } from "@scure/base";

if (!process.env.SVM_PRIVATE_KEY) {
  throw new Error("Missing required env var: SVM_PRIVATE_KEY (base58 Solana private key)");
}

const privateKeyBytes = base58.decode(process.env.SVM_PRIVATE_KEY);
const svmSigner = await createKeyPairSignerFromBytes(privateKeyBytes);

const client = new x402Client().register("solana:*", new ExactSvmScheme(svmSigner));

export const fetchWithPayment = wrapFetchWithPayment(fetch, client);

export const MINTAI_SERVER_URL =
  process.env.MINTAI_SERVER_URL || "http://localhost:4022";
