// Minimal localStorage-backed collection with a repository-style API and a
// pub/sub hook so React components re-render on writes. This is the "local
// demo mode" persistence layer called out in the brief: swapping it for a
// Supabase-backed repository later only requires reimplementing this file's
// exported functions, not the call sites in app code.

export const STORAGE_PREFIX = "realty360:";

type Listener = () => void;

class Collection<T extends { id: string }> {
  private key: string;
  private cache: T[] | null = null;
  private listeners = new Set<Listener>();

  constructor(name: string) {
    this.key = `${STORAGE_PREFIX}${name}`;
  }

  private read(): T[] {
    if (this.cache) return this.cache;
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(this.key);
      this.cache = raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      this.cache = [];
    }
    return this.cache;
  }

  private write(items: T[]) {
    this.cache = items;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(this.key, JSON.stringify(items));
    }
    this.listeners.forEach((l) => l());
  }

  getAll = (): T[] => {
    return this.read();
  };

  getById = (id: string): T | undefined => {
    return this.read().find((i) => i.id === id);
  };

  upsert = (item: T) => {
    const items = this.read();
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      const next = [...items];
      next[idx] = item;
      this.write(next);
    } else {
      this.write([...items, item]);
    }
  };

  upsertMany = (newItems: T[]) => {
    const items = [...this.read()];
    for (const item of newItems) {
      const idx = items.findIndex((i) => i.id === item.id);
      if (idx >= 0) items[idx] = item;
      else items.push(item);
    }
    this.write(items);
  };

  remove = (id: string) => {
    this.write(this.read().filter((i) => i.id !== id));
  };

  replaceAll = (items: T[]) => {
    this.write(items);
  };

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
}

const registry = new Map<string, Collection<{ id: string }>>();

export function collection<T extends { id: string }>(name: string): Collection<T> {
  if (!registry.has(name)) {
    registry.set(name, new Collection<T>(name) as unknown as Collection<{ id: string }>);
  }
  return registry.get(name) as unknown as Collection<T>;
}

export function clearAllDemoData(names: string[]) {
  for (const name of names) {
    const col = collection<{ id: string; isDemo?: boolean }>(name);
    col.replaceAll(col.getAll().filter((i) => !i.isDemo));
  }
}

export function resetAll(names: string[]) {
  for (const name of names) {
    collection(name).replaceAll([]);
  }
}
