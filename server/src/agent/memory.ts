import { uploadToFilecoin } from "../services/storage.js";
import { anchorMemory, isFevmConfigured } from "../services/identity.js";
import { activityLog } from "./activity.js";
import { config, type ServiceKind } from "../config.js";

export interface MemoryEntry {
  serviceKind: ServiceKind;
  query: string;
  response: unknown;
  timestamp: string;
}

export interface MemoryBatch {
  batchId: number;
  cid: string;
  entryCount: number;
  flushedAt: string;
  txAnchored: boolean;
}

class AgentMemory {
  private buffer: MemoryEntry[] = [];
  private readonly FLUSH_THRESHOLD = 10;
  private batches: MemoryBatch[] = [];
  private batchCounter = 0;
  private flushing = false;

  add(entry: Omit<MemoryEntry, "timestamp">): void {
    this.buffer.push({ ...entry, timestamp: new Date().toISOString() });
    if (this.buffer.length >= this.FLUSH_THRESHOLD && !this.flushing) {
      this.flush().catch((err) => console.error("[Memory] Flush error:", err));
    }
  }

  async flush(): Promise<MemoryBatch | null> {
    if (this.buffer.length === 0 || this.flushing) return null;

    this.flushing = true;
    try {
      const entries = [...this.buffer];
      this.buffer = [];
      this.batchCounter++;

      const name = `mintai-batch-${this.batchCounter}-${Date.now()}`;
      const cid = await uploadToFilecoin(
        {
          agent: config.AGENT_NAME,
          batchId: this.batchCounter,
          flushedAt: new Date().toISOString(),
          entries,
        },
        name,
      );

      const batch: MemoryBatch = {
        batchId: this.batchCounter,
        cid,
        entryCount: entries.length,
        flushedAt: new Date().toISOString(),
        txAnchored: false,
      };

      if (isFevmConfigured()) {
        try {
          await anchorMemory(cid, entries.length);
          batch.txAnchored = true;
        } catch (err) {
          console.warn("[Memory] anchorMemory failed (non-fatal):", err);
        }
      }

      this.batches.push(batch);
      activityLog.push(
        "storage",
        "Memory anchored to Filecoin",
        `Batch ${batch.batchId} · ${entries.length} entries · ${cid}`,
      );
      return batch;
    } finally {
      this.flushing = false;
    }
  }

  bufferSize(): number {
    return this.buffer.length;
  }

  getBuffer(): MemoryEntry[] {
    return [...this.buffer];
  }

  getBatches(): MemoryBatch[] {
    return [...this.batches];
  }
}

export const agentMemory = new AgentMemory();
