/**
 * Tiny in-memory store used by the MSW handlers so the frontend behaves like a
 * real backend (list / detail / create / update / delete are consistent within
 * a session). Data resets on a full page reload — this is a demo data layer,
 * not persistence.
 */
import type { PaginationMeta } from "@/lib/api/types";

export interface WithId {
  id: string;
}

export class Collection<T extends WithId> {
  private items: T[];

  constructor(seed: T[]) {
    this.items = [...seed];
  }

  all(): T[] {
    return this.items;
  }

  find(id: string): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  /** Insert at the front so newly-created rows appear on top of lists. */
  insert(item: T): T {
    this.items.unshift(item);
    return item;
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const item = this.find(id);
    if (item) Object.assign(item, patch);
    return item;
  }

  remove(id: string): T | undefined {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    return this.items.splice(index, 1)[0];
  }
}

let sequence = 1000;

/** Monotonic id like `prd_1001`. */
export function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}_${sequence}`;
}

/** Zero-padded sequential document numbers, e.g. ORD-0001. */
export function docNo(prefix: string, n: number, width = 4): string {
  return `${prefix}-${String(n).padStart(width, "0")}`;
}

export function paginate<T>(
  items: T[],
  page = 1,
  pageSize = 10,
): { rows: T[]; meta: PaginationMeta } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    rows: items.slice(start, start + pageSize),
    meta: { page, pageSize, total, totalPages },
  };
}

/** Parse `?page=&pageSize=&search=` from a request URL. */
export function listParams(url: string): {
  page: number;
  pageSize: number;
  search: string;
} {
  const params = new URL(url).searchParams;
  return {
    page: Number(params.get("page") ?? 1),
    pageSize: Number(params.get("pageSize") ?? 10),
    search: (params.get("search") ?? "").trim().toLowerCase(),
  };
}

/** ISO string `daysAgo` days before now (negative = future). */
export function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}
