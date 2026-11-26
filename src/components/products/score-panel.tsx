"use client";

import { useMemo, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { scoresCol } from "@/lib/repo";
import { computeScore, dataConfidenceLabel, SCORE_CRITERIA, emptyScoreInputs } from "@/lib/scoring";
import type { ProductScoreInputs } from "@/lib/types";
import { useProductScore, useScoringWeights } from "@/lib/use-repo";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export function ScorePanel({ propertyId }: { propertyId: string }) {
  const weights = useScoringWeights();
  const existing = useProductScore(propertyId);
  const [inputs, setInputs] = useState<ProductScoreInputs>(existing?.inputs ?? emptyScoreInputs());
  const [dirty, setDirty] = useState(false);

  const result = useMemo(() => computeScore(inputs, weights), [inputs, weights]);

  const radarData = result.breakdown.map((b) => ({ label: b.label, value: b.value ?? 0, hasData: b.value !== null }));

  function updateCriterion(key: keyof ProductScoreInputs, value: number | null) {
    setInputs((prev) => ({ ...prev, [key]: { ...prev[key], value } }));
    setDirty(true);
  }

  function save() {
    scoresCol.upsert({
      id: propertyId,
      propertyId,
      weights,
      inputs,
      evaluatedAt: new Date().toISOString(),
    });
    setDirty(false);
    toast.success("Đã lưu điểm sản phẩm");
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Điểm tổng thể</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-semibold">
              {result.overall !== null ? Math.round(result.overall) : "—"}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
            <Badge variant="outline" className="ml-auto">
              {dataConfidenceLabel(result.coverage)}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground mb-4">
            Độ phủ dữ liệu: {Math.round(result.coverage)}% trọng số đã có đánh giá.
            {existing?.evaluatedAt && ` Đánh giá gần nhất: ${formatDate(existing.evaluatedAt)}.`}
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="label" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar dataKey="value" stroke="#158575" fill="#158575" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {result.coverage < 100 && (
            <p className="text-xs text-warning mt-2">
              Một số tiêu chí chưa có dữ liệu — điểm hiện tại là điểm tạm tính, chưa phải điểm đầy đủ.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between flex-row">
          <CardTitle className="text-base">Chi tiết tiêu chí</CardTitle>
          <Button size="sm" onClick={save} disabled={!dirty}>
            Lưu đánh giá
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {SCORE_CRITERIA.map(({ key, label }) => {
            const input = inputs[key];
            const weight = weights[key];
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">
                    {label} <span className="text-xs text-muted-foreground">({weight}%)</span>
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Checkbox
                      checked={input.value === null}
                      onCheckedChange={(checked) => updateCriterion(key, checked ? null : 50)}
                    />
                    Chưa có dữ liệu
                  </label>
                </div>
                {input.value !== null ? (
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[input.value]}
                      max={100}
                      step={1}
                      onValueChange={([v]) => updateCriterion(key, v)}
                      className="flex-1"
                    />
                    <span className="text-sm w-8 text-right">{input.value}</span>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic">
                    Chưa đánh giá — không được tính là 0 điểm, sẽ loại khỏi điểm tổng.
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
