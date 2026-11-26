"use client";

import { useEffect } from "react";
import { seedDemoData } from "@/lib/demo-data";

export function DemoDataInit() {
  useEffect(() => {
    seedDemoData();
  }, []);
  return null;
}
