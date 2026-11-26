"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProject, useProperty } from "@/lib/use-repo";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertyFormDialog } from "@/components/products/property-form-dialog";
import { ScorePanel } from "@/components/products/score-panel";
import { SwotPanel } from "@/components/products/swot-panel";
import { UspPanel } from "@/components/products/usp-panel";
import { DataPanel } from "@/components/products/data-panel";
import { propertiesCol } from "@/lib/repo";
import { formatArea, formatDate, formatVnd } from "@/lib/format";
import {
  DIRECTION_LABEL,
  FURNISHING_LABEL,
  PROPERTY_STATUS_LABEL,
  PROPERTY_TYPE_LABEL,
} from "@/lib/types";
import { propertyCompleteness } from "@/lib/completeness";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Archive, GitCompareArrows } from "lucide-react";
import { toast } from "sonner";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const property = useProperty(id);
  const project = useProject(property?.projectId);
  const completeness = property ? propertyCompleteness(property) : null;

  if (!property) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          Không tìm thấy sản phẩm.
          <div className="mt-3">
            <Button variant="outline" onClick={() => router.push("/kho-san-pham")}>
              Về kho sản phẩm
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  function archive() {
    propertiesCol.upsert({ ...property!, archivedAt: new Date().toISOString() });
    toast.success("Đã lưu trữ sản phẩm");
    router.push("/kho-san-pham");
  }

  return (
    <div>
      <Link href="/kho-san-pham" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Kho sản phẩm
      </Link>
      <PageHeader
        title={property.name}
        description={project ? `${project.name} · ${project.district}, ${project.province}` : "Không thuộc dự án nào"}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/so-sanh?ids=${property.id}`}>
                <GitCompareArrows className="size-4" /> So sánh
              </Link>
            </Button>
            <PropertyFormDialog property={property} trigger={<Button variant="outline">Chỉnh sửa</Button>} />
            <Button variant="outline" onClick={archive}>
              <Archive className="size-4" /> Lưu trữ
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="secondary">{PROPERTY_TYPE_LABEL[property.propertyType]}</Badge>
        <Badge variant="outline">{PROPERTY_STATUS_LABEL[property.status]}</Badge>
        <Badge variant={property.legalStatus === "verified" ? "default" : "outline"}>
          Pháp lý: {property.legalStatus === "verified" ? "Đã xác minh" : "Chưa xác minh"}
        </Badge>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground w-40">
          <span className="whitespace-nowrap">Độ đầy đủ {completeness!.percent}%</span>
          <Progress value={completeness!.percent} className="h-1.5" />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="score">Điểm số</TabsTrigger>
          <TabsTrigger value="swot">SWOT</TabsTrigger>
          <TabsTrigger value="usp">Nội dung bán hàng</TabsTrigger>
          <TabsTrigger value="data">Pháp lý & dữ liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6 grid sm:grid-cols-3 gap-4 text-sm">
              <Field label="Giá niêm yết" value={formatVnd(property.listingPrice)} />
              <Field label="Giá bán cuối" value={formatVnd(property.finalPrice ?? property.listingPrice)} />
              <Field label="Diện tích" value={formatArea(property.usableArea ?? property.landArea)} />
              <Field label="Phòng ngủ / Tắm" value={`${property.bedrooms ?? "—"} / ${property.bathrooms ?? "—"}`} />
              <Field label="Hướng" value={property.direction ? DIRECTION_LABEL[property.direction] : "—"} />
              <Field label="Nội thất" value={property.furnishing ? FURNISHING_LABEL[property.furnishing] : "—"} />
              <Field label="Block / Tầng / Số căn" value={`${property.block ?? "—"} / ${property.floor ?? "—"} / ${property.unitNumber ?? "—"}`} />
              <Field label="Hoa hồng dự kiến" value={property.commissionRate ? `${property.commissionRate}%` : "—"} />
              <Field label="Cập nhật gần nhất" value={formatDate(property.updatedAt)} />
            </CardContent>
          </Card>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-muted-foreground mb-1">Mô tả</div>
                <p className="text-sm">{property.description || "Chưa có mô tả."}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Ưu điểm</div>
                  <p className="text-sm">{property.advantages || "—"}</p>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Nhược điểm</div>
                  <p className="text-sm">{property.disadvantages || "—"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          {completeness!.missing.length > 0 && (
            <Card className="border-warning/40 bg-warning/5">
              <CardContent className="pt-5 text-sm">
                <span className="font-medium">Thông tin còn thiếu: </span>
                {completeness!.missing.join(", ")}.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="score" className="mt-4">
          <ScorePanel propertyId={property.id} />
        </TabsContent>
        <TabsContent value="swot" className="mt-4">
          <SwotPanel propertyId={property.id} />
        </TabsContent>
        <TabsContent value="usp" className="mt-4">
          <UspPanel propertyId={property.id} />
        </TabsContent>
        <TabsContent value="data" className="mt-4">
          <DataPanel property={property} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
