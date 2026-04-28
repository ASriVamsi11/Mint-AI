import lighthouse from "@lighthouse-web3/sdk";
import { config } from "../config.js";

export async function uploadToFilecoin(payload: object, name: string): Promise<string> {
  if (!config.LIGHTHOUSE_API_KEY) {
    throw new Error("LIGHTHOUSE_API_KEY not configured");
  }
  const text = JSON.stringify(payload, null, 2);
  const response = await lighthouse.uploadText(text, config.LIGHTHOUSE_API_KEY, name);
  const cid: string = response.data.Hash;
  console.log(`[Storage] Uploaded "${name}" → ${cid}`);
  return cid;
}

export async function fetchFromFilecoin(cid: string): Promise<unknown> {
  const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to retrieve CID ${cid}: HTTP ${res.status}`);
  }
  return res.json();
}
