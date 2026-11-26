"use client";

import { useSyncExternalStore } from "react";
import { getSessionSnapshot, subscribeSession } from "./session-store";

export function useSession() {
  return useSyncExternalStore(subscribeSession, getSessionSnapshot, getSessionSnapshot);
}
