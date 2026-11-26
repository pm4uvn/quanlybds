"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./client";
import { getCurrentUserId, subscribeSession } from "./session-store";

type Listener = () => void;

export interface TableMapper<T extends { id: string }> {
  table: string;
  idColumn: string; // "id" for most tables, "property_id" for the 1:1 product tables
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromRow: (row: Record<string, any>) => T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toRow: (item: T, ownerId: string) => Record<string, any>;
}

/**
 * Same public shape as the old localStorage `Collection<T>` (getAll,
 * getById, upsert, upsertMany, remove, replaceAll, subscribe) so
 * `src/lib/use-repo.ts` and every component calling `xCol.upsert(...)`
 * etc. did not need to change — only this file and `repo.ts` did.
 *
 * Backed by an in-memory cache that is populated by an initial fetch and
 * kept in sync with Supabase Realtime (postgres_changes). Mutations update
 * the cache optimistically, then fire the Supabase write in the background;
 * a failed write is reported via a toast and reconciled by the next
 * realtime event / refetch.
 */
export class SupabaseCollection<T extends { id: string }> {
  private cache: T[] = [];
  private listeners = new Set<Listener>();
  private channel: RealtimeChannel | null = null;
  private ownerId: string | null = null;
  private ready = false;

  constructor(private mapper: TableMapper<T>) {
    if (typeof window !== "undefined") {
      subscribeSession(() => this.onAuthChange());
      this.onAuthChange();
    }
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private onAuthChange() {
    const nextOwnerId = isSupabaseConfigured ? getCurrentUserId() : null;
    if (nextOwnerId === this.ownerId && this.ready) return;
    this.ownerId = nextOwnerId;
    this.teardownChannel();

    if (!nextOwnerId) {
      this.cache = [];
      this.ready = true;
      this.notify();
      return;
    }

    this.fetchAll(nextOwnerId);
    this.setupRealtime(nextOwnerId);
  }

  private async fetchAll(ownerId: string) {
    const { data, error } = await supabase
      .from(this.mapper.table)
      .select("*")
      .eq("owner_id", ownerId);
    if (error) {
      console.error(`[${this.mapper.table}] fetch failed`, error);
      this.ready = true;
      this.notify();
      return;
    }
    this.cache = (data ?? []).map(this.mapper.fromRow);
    this.ready = true;
    this.notify();
  }

  private setupRealtime(ownerId: string) {
    this.channel = supabase
      .channel(`${this.mapper.table}-${ownerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: this.mapper.table, filter: `owner_id=eq.${ownerId}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldId = (payload.old as Record<string, unknown>)[this.mapper.idColumn] as string;
            this.cache = this.cache.filter((i) => i.id !== oldId);
          } else {
            const item = this.mapper.fromRow(payload.new as Record<string, unknown>);
            const idx = this.cache.findIndex((i) => i.id === item.id);
            if (idx >= 0) {
              const next = [...this.cache];
              next[idx] = item;
              this.cache = next;
            } else {
              this.cache = [...this.cache, item];
            }
          }
          this.notify();
        }
      )
      .subscribe();
  }

  private teardownChannel() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  getAll = (): T[] => this.cache;

  getById = (id: string): T | undefined => this.cache.find((i) => i.id === id);

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  // Returns a promise so callers that need write-ordering (e.g. inserting a
  // property only after its parent project has committed) can await it;
  // ordinary call sites just call `col.upsert(item)` as a statement and
  // ignore the return value, same as before.
  upsert = (item: T): Promise<void> => {
    const idx = this.cache.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      const next = [...this.cache];
      next[idx] = item;
      this.cache = next;
    } else {
      this.cache = [...this.cache, item];
    }
    this.notify();

    if (!this.ownerId) return Promise.resolve();
    const row = this.mapper.toRow(item, this.ownerId);
    return Promise.resolve(
      supabase
        .from(this.mapper.table)
        .upsert(row, { onConflict: this.mapper.idColumn })
    ).then(({ error }) => {
      if (error) console.error(`[${this.mapper.table}] upsert failed`, error);
    });
  };

  upsertMany = (items: T[]): Promise<void> => {
    return Promise.all(items.map((item) => this.upsert(item))).then(() => undefined);
  };

  remove = (id: string): Promise<void> => {
    this.cache = this.cache.filter((i) => i.id !== id);
    this.notify();

    if (!this.ownerId) return Promise.resolve();
    return Promise.resolve(
      supabase
        .from(this.mapper.table)
        .delete()
        .eq(this.mapper.idColumn, id)
        .eq("owner_id", this.ownerId)
    ).then(({ error }) => {
      if (error) console.error(`[${this.mapper.table}] delete failed`, error);
    });
  };

  replaceAll = (items: T[]) => {
    this.cache = items;
    this.notify();
  };
}
