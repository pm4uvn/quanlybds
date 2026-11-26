"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { propertiesCol } from "@/lib/repo";
import type { Property, VerificationStatus } from "@/lib/types";
import { VERIFICATION_LABEL } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export function DataPanel({ property }: { property: Property }) {
  const warnings = useMemo(() => {
    const list: string[] = [];
    // eslint-disable-next-line react-hooks/purity -- freshness check, staleness across renders is acceptable
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

    if (!property.availabilitySource.lastVerifiedAt || new Date(property.availabilitySource.lastVerifiedAt).getTime() < ninetyDaysAgo) {
      list.push("Giá bán / tình trạng còn hàng chưa được xác minh trong 90 ngày gần nhất.");
    }
    if (property.legalStatus !== "verified") {
      list.push("Thông tin pháp lý chưa được xác minh — không nên khẳng định với khách hàng là an toàn pháp lý.");
    }
    if (property.status === "pending_verification") {
      list.push("Sản phẩm đang chờ xác minh tình trạng thực tế.");
    }
    return list;
  }, [property]);

  function updateSourceStatus(field: "legalSource" | "availabilitySource", status: VerificationStatus) {
    propertiesCol.upsert({
      ...property,
      [field]: { ...property[field], status, lastVerifiedAt: new Date().toISOString() },
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="space-y-4">
      {warnings.length > 0 && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="pt-5 space-y-2">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="size-4 text-warning mt-0.5 shrink-0" />
                {w}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {warnings.length === 0 && (
        <Card className="border-success/40 bg-success/5">
          <CardContent className="pt-5 flex items-center gap-2 text-sm">
            <ShieldCheck className="size-4 text-success" />
            Dữ liệu sản phẩm đã được xác minh và cập nhật gần đây.
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Xác minh pháp lý</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trạng thái</span>
              <Select value={property.legalSource.status} onValueChange={(v) => updateSourceStatus("legalSource", v as VerificationStatus)}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(VERIFICATION_LABEL).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nguồn</span>
              <span>{property.legalSource.source ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Xác minh lần cuối</span>
              <span>{formatDate(property.legalSource.lastVerifiedAt)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Xác minh tình trạng & giá</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trạng thái</span>
              <Select value={property.availabilitySource.status} onValueChange={(v) => updateSourceStatus("availabilitySource", v as VerificationStatus)}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(VERIFICATION_LABEL).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nguồn</span>
              <span>{property.availabilitySource.source ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Xác minh lần cuối</span>
              <span>{formatDate(property.availabilitySource.lastVerifiedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Lịch sử</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <div>Tạo lúc: {formatDate(property.createdAt)}</div>
          <div>Cập nhật gần nhất: {formatDate(property.updatedAt)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
