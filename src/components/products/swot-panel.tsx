"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListEditor } from "./list-editor";
import { swotCol } from "@/lib/repo";
import { useSwotAnalysis } from "@/lib/use-repo";
import type { SwotAnalysis } from "@/lib/types";
import { toast } from "sonner";

const QUADRANTS: { key: keyof Pick<SwotAnalysis, "strengths" | "weaknesses" | "opportunities" | "threats">; label: string; hint: string }[] = [
  { key: "strengths", label: "Điểm mạnh", hint: "Lợi thế nội tại, giá, vị trí, pháp lý đã xác minh..." },
  { key: "weaknesses", label: "Điểm yếu", hint: "Hạn chế về giá, diện tích, thiết kế, hồ sơ pháp lý..." },
  { key: "opportunities", label: "Cơ hội", hint: "Hạ tầng, nhu cầu thị trường, nhu cầu thuê..." },
  { key: "threats", label: "Rủi ro", hint: "Nguồn cung cạnh tranh, lãi suất, thanh khoản..." },
];

function emptySwot(propertyId: string): SwotAnalysis & { id: string } {
  return {
    id: propertyId,
    propertyId,
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
    updatedAt: new Date().toISOString(),
    approved: false,
  };
}

export function SwotPanel({ propertyId }: { propertyId: string }) {
  const existing = useSwotAnalysis(propertyId);
  const [draft, setDraft] = useState<SwotAnalysis & { id: string }>(existing ?? emptySwot(propertyId));

  function update(key: keyof Pick<SwotAnalysis, "strengths" | "weaknesses" | "opportunities" | "threats">, items: string[]) {
    setDraft((prev) => ({ ...prev, [key]: items }));
  }

  function save(approved?: boolean) {
    const next = { ...draft, approved: approved ?? draft.approved, updatedAt: new Date().toISOString() };
    swotCol.upsert(next);
    setDraft(next);
    toast.success(approved ? "Đã phê duyệt phân tích SWOT" : "Đã lưu phân tích SWOT");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Badge variant={draft.approved ? "default" : "outline"}>
          {draft.approved ? "Đã phê duyệt" : "Chưa phê duyệt — chỉ là gợi ý ban đầu"}
        </Badge>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => save()}>Lưu nháp</Button>
          <Button size="sm" onClick={() => save(true)}>Phê duyệt</Button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {QUADRANTS.map((q) => (
          <Card key={q.key}>
            <CardHeader>
              <CardTitle className="text-sm">{q.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <ListEditor items={draft[q.key]} onChange={(items) => update(q.key, items)} placeholder={q.hint} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
