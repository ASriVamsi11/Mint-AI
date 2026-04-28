export type ActivityKind = "earning" | "storage" | "reputation" | "system";

export interface ActivityEvent {
  id: number;
  kind: ActivityKind;
  title: string;
  detail: string;
  timestamp: string;
}

class ActivityLog {
  private events: ActivityEvent[] = [];
  private nextId = 1;

  push(kind: ActivityKind, title: string, detail: string): void {
    this.events.push({
      id: this.nextId++,
      kind,
      title,
      detail,
      timestamp: new Date().toISOString(),
    });
  }

  recent(limit = 200): ActivityEvent[] {
    return this.events.slice(-limit).reverse();
  }

  byKind(kind: ActivityKind): ActivityEvent[] {
    return this.events.filter((e) => e.kind === kind).reverse();
  }
}

export const activityLog = new ActivityLog();
