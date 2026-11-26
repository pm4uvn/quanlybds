"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { useProjects, useProperties } from "@/lib/use-repo";
import { scoresCol } from "@/lib/repo";
import { computeScore, emptyScoreInputs } from "@/lib/scoring";
import { DEFAULT_SCORING_WEIGHTS, PROPERTY_TYPE_LABEL, PROPERTY_STATUS_LABEL } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatArea, formatVnd } from "@/lib/format";
import { X, Printer, GitCompareArrows } from "lucide-react";

function ComparePageInner() {
  const params = useSearchParams();
  const initialIds = params.get("ids")?.split(",").filter(Boolean) ?? [];
  const properties = useProperties().filter((p) => !p.archivedAt);
  const projects = useProjects();
  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds.slice(0, 4));
  const [customerView, setCustomerView] = useState(false);

  const selected = useMemo(
    () => selectedIds.map((id) => properties.find((p) => p.id === id)).filter(Boolean) as typeof properties,
    [selectedIds, properties]
  );

  function addProperty(id: string) {
    if (selectedIds.includes(id) || selectedIds.length >= 4) return;
    setSelectedIds([...selectedIds, id]);
  }
  function removeProperty(id: string) {
    setSelectedIds(selectedIds.filter((x) => x !== id));
  }

  const scoreByProperty = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const p of selected) {
      const score = scoresCol.getById(p.id);
      const result = computeScore(score?.inputs ?? emptyScoreInputs(), score?.weights ?? DEFAULT_SCORING_WEIGHTS);
      map.set(p.id, result.overall);
    }
    return map;
  }, [selected]);

  const rows: { label: string; render: (p: typeof selected[number]) => React.ReactNode; internal?: boolean }[] = [
    { label: "Giá bán", render: (p) => formatVnd(p.finalPrice ?? p.listingPrice) },
    { label: "Giá / m²", render: (p) => formatVnd((p.finalPrice ?? p.listingPrice ?? 0) / (p.usableArea ?? p.landArea ?? 1)) },
    { label: "Diện tích", render: (p) => formatArea(p.usableArea ?? p.landArea) },
    { label: "Phòng ngủ", render: (p) => String(p.bedrooms ?? "—") },
    { label: "Dự án", render: (p) => (p.projectId ? projectById.get(p.projectId)?.name ?? "—" : "—") },
    { label: "Chủ đầu tư", render: (p) => (p.projectId ? projectById.get(p.projectId)?.developer ?? "—" : "—") },
    { label: "Pháp lý", render: (p) => (p.legalStatus === "verified" ? "Đã xác minh" : "Chưa xác minh") },
    { label: "Trạng thái", render: (p) => PROPERTY_STATUS_LABEL[p.status] },
    { label: "Điểm tổng thể", render: (p) => (scoreByProperty.get(p.id) !== null ? Math.round(scoreByProperty.get(p.id)!) : "Chưa đủ dữ liệu") },
    { label: "Ưu điểm", render: (p) => p.advantages || "—" },
    { label: "Nhược điểm", render: (p) => p.disadvantages || "—" },
    { label: "Hoa hồng dự kiến", render: (p) => (p.commissionRate ? `${p.commissionRate}%` : "—"), internal: true },
    { label: "Ghi chú nội bộ", render: (p) => p.notes || "—", internal: true },
  ];

  const visibleRows = customerView ? rows.filter((r) => !r.internal) : rows;

  const bestPriceId = selected.length
    ? selected.reduce((a, b) => ((a.finalPrice ?? a.listingPrice ?? Infinity) < (b.finalPrice ?? b.listingPrice ?? Infinity) ? a : b)).id
    : undefined;

  return (
    <div>
      <PageHeader
        title="So sánh sản phẩm"
        description="Chọn 2–4 sản phẩm để so sánh chi tiết và tư vấn khách hàng."
        actions={
          selected.length >= 2 ? (
            <>
              <div className="flex items-center gap-2 text-sm print:hidden">
                <span className="text-muted-foreground">Chế độ khách hàng</span>
                <Switch checked={customerView} onCheckedChange={setCustomerView} />
              </div>
              <Button variant="outline" onClick={() => window.print()} className="print:hidden">
                <Printer className="size-4" /> Xuất / In cho khách hàng
              </Button>
            </>
          ) : undefined
        }
      />

      <div className="print:hidden mb-4 flex flex-wrap items-center gap-2">
        {selected.map((p) => (
          <Badge key={p.id} variant="secondary" className="gap-1 pr-1">
            {p.name}
            <button onClick={() => removeProperty(p.id)}>
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        {selected.length < 4 && (
          <Select onValueChange={addProperty}>
            <SelectTrigger className="w-56"><SelectValue placeholder="+ Thêm sản phẩm để so sánh" /></SelectTrigger>
            <SelectContent>
              {properties
                .filter((p) => !selectedIds.includes(p.id))
                .map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({PROPERTY_TYPE_LABEL[p.propertyType]})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selected.length < 2 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <GitCompareArrows className="size-10 mx-auto mb-3" />
            Chọn ít nhất 2 sản phẩm để bắt đầu so sánh.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left w-40">Tiêu chí</th>
                    {selected.map((p) => (
                      <th key={p.id} className="p-3 text-left">
                        {p.name}
                        {p.id === bestPriceId && (
                          <Badge className="ml-2" variant="default">Giá tốt nhất</Badge>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.label} className="border-t">
                      <td className="p-3 font-medium text-muted-foreground">{row.label}</td>
                      {selected.map((p) => (
                        <td key={p.id} className="p-3">{row.render(p)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="mt-4">
            <CardContent className="pt-6 text-sm space-y-2">
              <div className="font-medium">Gợi ý theo nhu cầu khách hàng</div>
              <p className="text-muted-foreground">
                Không có &quot;sản phẩm thắng tuyệt đối&quot; — lựa chọn phù hợp phụ thuộc vào mục tiêu của khách hàng:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Khách mua lần đầu, ngân sách hạn chế: ưu tiên sản phẩm có giá/m² thấp nhất.</li>
                <li>Khách mua cho gia đình: ưu tiên sản phẩm diện tích và số phòng ngủ lớn hơn.</li>
                <li>Khách đầu tư cho thuê: cân nhắc thêm vị trí và thanh khoản trong điểm tổng thể.</li>
                <li>Khách ưu tiên an toàn pháp lý: chọn sản phẩm có trạng thái pháp lý &quot;Đã xác minh&quot;.</li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense>
      <ComparePageInner />
    </Suspense>
  );
}
