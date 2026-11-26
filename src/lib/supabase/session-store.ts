"use client";

import { supabase, isSupabaseConfigured } from "./client";
import type { Session } from "@supabase/supabase-js";

// Tiny pub/sub around Supabase's auth session, so both the data layer
// (which needs the current user id to scope every query/realtime filter by
// owner_id) and the UI (sign-in gate) can react to sign-in/sign-out without
// threading auth state through every component.

type Listener = () => void;
interface SessionSnapshot {
  session: Session | null;
  loading: boolean;
}

let session: Session | null = null;
let loading = true;
// Stable snapshot object — only replaced when state actually changes, so
// useSyncExternalStore (which compares by reference) never loops forever.
let snapshot: SessionSnapshot = { session, loading };
let initialized = false;
const listeners = new Set<Listener>();

function notify() {
  snapshot = { session, loading };
  listeners.forEach((l) => l());
}

function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  if (!isSupabaseConfigured) {
    loading = false;
    notify();
    return;
  }

  supabase.auth.getSession().then(({ data }) => {
    session = data.session;
    loading = false;
    notify();
  });

  supabase.auth.onAuthStateChange((_event, newSession) => {
    session = newSession;
    loading = false;
    notify();
  });
}

export function subscribeSession(listener: Listener): () => void {
  ensureInit();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSessionSnapshot() {
  ensureInit();
  return snapshot;
}

export function getCurrentUserId(): string | null {
  ensureInit();
  return session?.user.id ?? null;
}

export async function signInWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error;
}

export async function signUpWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  return error;
}

export async function signOut() {
  await supabase.auth.signOut();
}
