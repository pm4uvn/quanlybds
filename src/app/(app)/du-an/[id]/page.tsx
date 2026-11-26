"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProject, useProperties } from "@/lib/use-repo";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatVnd } from "@/lib/format";
import { CONSTRUCTION_STATUS_LABEL, PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/types";
import { ArrowLeft, FileText } from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const project = useProject(id);
  const properties = useProperties().filter((p) => p.projectId === id && !p.archivedAt);

  if (!project) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          Không tìm thấy dự án.
          <div className="mt-3">
            <Button variant="outline" onClick={() => router.push("/du-an")}>
              Về danh sách dự án
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Link href="/du-an" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Danh sách dự án
      </Link>
      <PageHeader
        title={project.name}
        description={`${project.developer} · ${project.district}, ${project.province}`}
        actions={<ProjectFormDialog project={project} trigger={<Button variant="outline">Chỉnh sửa</Button>} />}
      />

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="location">Vị trí</TabsTrigger>
          <TabsTrigger value="legal">Pháp lý</TabsTrigger>
          <TabsTrigger value="policy">Chính sách bán hàng</TabsTrigger>
          <TabsTrigger value="properties">Danh sách sản phẩm ({properties.length})</TabsTrigger>
          <TabsTrigger value="docs">Tài liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardContent className="pt-6 grid sm:grid-cols-2 gap-4 text-sm">
              <Field label="Loại hình" value={PROPERTY_TYPE_LABEL[project.projectType as keyof typeof PROPERTY_TYPE_LABEL] ?? project.projectType} />
              <Field label="Tình trạng xây dựng" value={CONSTRUCTION_STATUS_LABEL[project.constructionStatus]} />
              <Field label="Dự kiến bàn giao" value={formatDate(project.expectedHandover)} />
              <Field label="Tổng số căn" value={project.totalUnits?.toLocaleString("vi-VN") ?? "—"} />
              <Field label="Tổng diện tích" value={project.totalArea ? `${project.totalArea} ha` : "—"} />
              <Field label="Mật độ xây dựng" value={project.constructionDensity ? `${project.constructionDensity}%` : "—"} />
              <Field label="Giá khởi điểm" value={formatVnd(project.startingPrice)} />
              <Field label="Giá TB/m²" value={formatVnd(project.avgPricePerM2)} />
              <div className="sm:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Mô tả</div>
                <p>{project.description || "Chưa có mô tả."}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="mt-4">
          <Card>
            <CardContent className="pt-6 grid sm:grid-cols-2 gap-4 text-sm">
              <Field label="Địa chỉ" value={project.address} />
              <Field label="Khoảng cách đến trung tâm" value={project.distanceToCenterKm ? `${project.distanceToCenterKm} km` : "—"} />
              <Field label="Trường học gần đó" value={project.nearbySchools ?? "—"} />
              <Field label="Bệnh viện gần đó" value={project.nearbyHospitals ?? "—"} />
              <Field label="Trung tâm thương mại" value={project.nearbyShopping ?? "—"} />
              <Field label="Giao thông công cộng" value={project.publicTransport ?? "—"} />
              <Field label="Tuyến đường chính" value={project.mainRoads ?? "—"} />
              <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Ưu điểm vị trí</div>
                  <p>{project.locationAdvantages ?? "—"}</p>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Hạn chế vị trí</div>
                  <p>{project.locationDisadvantages ?? "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Trạng thái xác minh pháp lý:</span>
                <VerificationBadge status={project.legalVerification.status} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Hồ sơ sử dụng đất" value={project.landUseDocs ?? "—"} />
                <Field label="Giấy phép xây dựng" value={project.constructionPermit ?? "—"} />
                <Field label="Hình thức sở hữu" value={project.ownershipType ?? "—"} />
                <Field label="Thời hạn sở hữu" value={project.ownershipDuration ?? "—"} />
                <Field label="Điều kiện bán hàng" value={project.salesEligibilityDocs ?? "—"} />
                <Field label="Nguồn thông tin" value={project.legalVerification.source ?? "—"} />
                <Field label="Lần xác minh cuối" value={formatDate(project.legalVerification.lastVerifiedAt)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy" className="mt-4">
          <Card>
            <CardContent className="pt-6 grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Chính sách thanh toán</div>
                <p>{project.paymentPolicy ?? "—"}</p>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Chính sách vay ngân hàng</div>
                <p>{project.bankFinancingPolicy ?? "—"}</p>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Chính sách khuyến mãi</div>
                <p>{project.promotionPolicy ?? "—"}</p>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Chính sách hoa hồng</div>
                <p>{project.commissionPolicy ?? "—"}</p>
              </div>
              <Field label="Phí quản lý" value={project.managementFee ? formatVnd(project.managementFee) + "/m²/tháng" : "—"} />
              <Field label="Phí bảo trì" value={project.maintenanceFee ? `${project.maintenanceFee}%` : "—"} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="mt-4">
          {properties.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Dự án này chưa có sản phẩm nào.
                <div className="mt-3">
                  <Button asChild>
                    <Link href="/kho-san-pham">Thêm sản phẩm</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((p) => (
                <Link key={p.id} href={`/kho-san-pham/${p.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="pt-5">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{PROPERTY_TYPE_LABEL[p.propertyType]}</Badge>
                        <Badge variant="outline">{PROPERTY_STATUS_LABEL[p.status]}</Badge>
                      </div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {p.usableArea ?? p.landArea ?? "—"} m² · {p.bedrooms ?? "—"} PN
                      </div>
                      <div className="font-semibold mt-2">{formatVnd(p.finalPrice ?? p.listingPrice)}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <FileText className="size-8 mx-auto mb-2" />
              {project.documents.length === 0
                ? "Chưa có tài liệu nào được tải lên cho dự án này."
                : `${project.documents.length} tài liệu.`}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div>{value}</div>
    </div>
  );
}

function VerificationBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    verified: { label: "Đã xác minh", variant: "default" },
    unverified: { label: "Chưa xác minh", variant: "secondary" },
    outdated: { label: "Đã lỗi thời", variant: "destructive" },
    missing: { label: "Thiếu dữ liệu", variant: "outline" },
    conflicting: { label: "Dữ liệu mâu thuẫn", variant: "destructive" },
  };
  const info = map[status] ?? map.missing;
  return <Badge variant={info.variant}>{info.label}</Badge>;
}
