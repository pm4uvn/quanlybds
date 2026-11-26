"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useProjects, useProperties } from "@/lib/use-repo";
import { propertiesCol } from "@/lib/repo";
import { PropertyFormDialog } from "@/components/products/property-form-dialog";
import { ImportDialog } from "@/components/products/import-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatVnd, formatArea } from "@/lib/format";
import { propertyCompleteness } from "@/lib/completeness";
import {
  PROPERTY_STATUS_LABEL,
  PROPERTY_TYPE_LABEL,
  type Property,
  type PropertyStatus,
} from "@/lib/types";
import { exportProperties } from "@/lib/excel";
import { Search, Download, LayoutGrid, Table2, Star, Boxes } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type SortKey = "updated" | "price_asc" | "price_desc" | "area_desc";

export default function InventoryPage() {
  const properties = useProperties().filter((p) => !p.archivedAt);
  const projects = useProjects();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [view, setView] = useState<"card" | "table">("card");
  const [sort, setSort] = useState<SortKey>("updated");

  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const filtered = useMemo(() => {
    let list = properties.filter((p) => {
      if (typeFilter !== "all" && p.propertyType !== typeFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (projectFilter !== "all" && p.projectId !== projectFilter) return false;
      if (query) {
        const haystack = `${p.name} ${p.block ?? ""} ${p.unitNumber ?? ""} ${p.notes ?? ""}`.toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price_asc":
          return (a.finalPrice ?? a.listingPrice ?? 0) - (b.finalPrice ?? b.listingPrice ?? 0);
        case "price_desc":
          return (b.finalPrice ?? b.listingPrice ?? 0) - (a.finalPrice ?? a.listingPrice ?? 0);
        case "area_desc":
          return (b.usableArea ?? b.landArea ?? 0) - (a.usableArea ?? a.landArea ?? 0);
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
    return list;
  }, [properties, typeFilter, statusFilter, projectFilter, query, sort]);

  function toggleFavorite(p: Property) {
    propertiesCol.upsert({ ...p, isFavorite: !p.isFavorite });
  }

  return (
    <div>
      <PageHeader
        title="Kho sản phẩm"
        description="Toàn bộ sản phẩm bất động sản bạn đang quản lý và tư vấn."
        actions={
          <>
            <ImportDialog />
            <Button variant="outline" onClick={() => exportProperties(filtered, projects)}>
              <Download className="size-4" /> Xuất Excel
            </Button>
            <PropertyFormDialog />
          </>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="Tìm sản phẩm..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Loại hình" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại hình</SelectItem>
            {Object.entries(PROPERTY_TYPE_LABEL).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.entries(PROPERTY_STATUS_LABEL).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Dự án" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả dự án</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Sắp xếp" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Mới cập nhật</SelectItem>
            <SelectItem value="price_asc">Giá tăng dần</SelectItem>
            <SelectItem value="price_desc">Giá giảm dần</SelectItem>
            <SelectItem value="area_desc">Diện tích lớn nhất</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1 ml-auto">
          <Button variant={view === "card" ? "default" : "outline"} size="icon" onClick={() => setView("card")}>
            <LayoutGrid className="size-4" />
          </Button>
          <Button variant={view === "table" ? "default" : "outline"} size="icon" onClick={() => setView("table")}>
            <Table2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-3">{filtered.length} sản phẩm</div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Boxes className="size-10 mx-auto mb-3" />
            Không có sản phẩm nào khớp với bộ lọc hiện tại.
          </CardContent>
        </Card>
      ) : view === "card" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const completeness = propertyCompleteness(p);
            return (
              <Card key={p.id} className="relative hover:shadow-md transition-shadow">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(p);
                  }}
                  className="absolute top-3 right-3 z-10"
                  aria-label="Yêu thích"
                >
                  <Star className={cn("size-4", p.isFavorite ? "fill-accent text-accent" : "text-muted-foreground")} />
                </button>
                <Link href={`/kho-san-pham/${p.id}`}>
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{PROPERTY_TYPE_LABEL[p.propertyType]}</Badge>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="font-medium pr-5">{p.name}</div>
                    {p.projectId && (
                      <div className="text-xs text-muted-foreground mt-0.5">{projectById.get(p.projectId)?.name}</div>
                    )}
                    <div className="text-sm text-muted-foreground mt-2">
                      {formatArea(p.usableArea ?? p.landArea)} · {p.bedrooms ?? "—"} PN
                    </div>
                    <div className="font-semibold mt-1">{formatVnd(p.finalPrice ?? p.listingPrice)}</div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                        <span>Độ đầy đủ dữ liệu</span>
                        <span>{completeness.percent}%</span>
                      </div>
                      <Progress value={completeness.percent} className="h-1.5" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="p-3">Sản phẩm</th>
                  <th className="p-3">Loại hình</th>
                  <th className="p-3">Diện tích</th>
                  <th className="p-3">Giá</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Pháp lý</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/40">
                    <td className="p-3">
                      <Link href={`/kho-san-pham/${p.id}`} className="font-medium hover:underline">
                        {p.name}
                      </Link>
                      {p.projectId && (
                        <div className="text-xs text-muted-foreground">{projectById.get(p.projectId)?.name}</div>
                      )}
                    </td>
                    <td className="p-3">{PROPERTY_TYPE_LABEL[p.propertyType]}</td>
                    <td className="p-3">{formatArea(p.usableArea ?? p.landArea)}</td>
                    <td className="p-3 font-medium">{formatVnd(p.finalPrice ?? p.listingPrice)}</td>
                    <td className="p-3"><StatusBadge status={p.status} /></td>
                    <td className="p-3">
                      <Badge variant={p.legalStatus === "verified" ? "default" : "outline"}>
                        {p.legalStatus === "verified" ? "Đã xác minh" : "Chưa xác minh"}
                      </Badge>
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

function StatusBadge({ status }: { status: PropertyStatus }) {
  const variant = status === "available" ? "default" : status === "sold" ? "secondary" : "outline";
  return <Badge variant={variant}>{PROPERTY_STATUS_LABEL[status]}</Badge>;
}
