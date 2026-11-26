"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useProperties, useProjects } from "@/lib/use-repo";
import { scoresCol, swotCol } from "@/lib/repo";
import { computeScore, dataConfidenceLabel, emptyScoreInputs } from "@/lib/scoring";
import { DEFAULT_SCORING_WEIGHTS, PROPERTY_TYPE_LABEL } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatVnd } from "@/lib/format";
import { LineChart as LineChartIcon } from "lucide-react";

export default function AnalysisPage() {
  const properties = useProperties().filter((p) => !p.archivedAt);
  const projects = useProjects();
  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const rows = useMemo(() => {
    return properties
      .map((p) => {
        const score = scoresCol.getById(p.id);
        const swot = swotCol.getById(p.id);
        const result = computeScore(score?.inputs ?? emptyScoreInputs(), score?.weights ?? DEFAULT_SCORING_WEIGHTS);
        return { property: p, result, hasSwot: !!swot };
      })
      .sort((a, b) => (b.result.overall ?? -1) - (a.result.overall ?? -1));
  }, [properties]);

  return (
    <div>
      <PageHeader
        title="Phân tích sản phẩm"
        description="Xếp hạng sản phẩm theo điểm tổng thể để biết nên ưu tiên tư vấn sản phẩm nào."
      />
      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <LineChartIcon className="size-10 mx-auto mb-3" />
            Chưa có sản phẩm để phân tích.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="p-3">Sản phẩm</th>
                  <th className="p-3">Dự án</th>
                  <th className="p-3">Giá</th>
                  <th className="p-3">Điểm tổng thể</th>
                  <th className="p-3">Độ tin cậy</th>
                  <th className="p-3">SWOT</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ property, result, hasSwot }) => (
                  <tr key={property.id} className="border-t hover:bg-muted/40">
                    <td className="p-3">
                      <Link href={`/kho-san-pham/${property.id}`} className="font-medium hover:underline">
                        {property.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{PROPERTY_TYPE_LABEL[property.propertyType]}</div>
                    </td>
                    <td className="p-3">{property.projectId ? projectById.get(property.projectId)?.name : "—"}</td>
                    <td className="p-3">{formatVnd(property.finalPrice ?? property.listingPrice)}</td>
                    <td className="p-3 font-medium">
                      {result.overall !== null ? Math.round(result.overall) : "—"}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{dataConfidenceLabel(result.coverage)}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={hasSwot ? "default" : "outline"}>{hasSwot ? "Đã có" : "Chưa có"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
