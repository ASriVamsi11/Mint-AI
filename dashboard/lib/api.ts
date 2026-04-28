import type {
  AgentStatus,
  MemoriesResponse,
  IdentityResponse,
  ActivityEvent,
} from "./types";

export const SERVER_URL =
  process.env.NEXT_PUBLIC_MINTAI_SERVER_URL || "http://localhost:4022";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${SERVER_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`);
  return (await res.json()) as T;
}

export const api = {
  status: () => getJson<AgentStatus>("/api/status"),
  memories: () => getJson<MemoriesResponse>("/api/storage/memories"),
  identity: () => getJson<IdentityResponse>("/api/identity"),
  activity: () => getJson<ActivityEvent[]>("/api/activity"),
  flush: async () => {
    const res = await fetch(`${SERVER_URL}/api/storage/flush`, { method: "POST" });
    if (!res.ok) throw new Error(`flush failed: ${res.status}`);
    return res.json();
  },
  playgroundAnalyze: async (query: string) => {
    const res = await fetch(`${SERVER_URL}/api/playground/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(`analyze failed: ${res.status}`);
    return res.json();
  },
  playgroundGenerate: async (prompt: string) => {
    const res = await fetch(`${SERVER_URL}/api/playground/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error(`generate failed: ${res.status}`);
    return res.json();
  },
  playgroundPredict: async (topic: string) => {
    const res = await fetch(`${SERVER_URL}/api/playground/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    if (!res.ok) throw new Error(`predict failed: ${res.status}`);
    return res.json();
  },
};
