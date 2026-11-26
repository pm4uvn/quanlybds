"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuid } from "uuid";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { propertyFullSchema, type PropertyFullFormValues } from "@/lib/schemas";
import { propertiesCol } from "@/lib/repo";
import type { Property } from "@/lib/types";
import {
  DIRECTION_LABEL,
  FURNISHING_LABEL,
  PROPERTY_STATUS_LABEL,
  PROPERTY_TYPE_LABEL,
} from "@/lib/types";
import { useProjects } from "@/lib/use-repo";
import { Plus } from "lucide-react";

export function PropertyFormDialog({
  property,
  defaultProjectId,
  trigger,
}: {
  property?: Property;
  defaultProjectId?: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(!!property);
  const projects = useProjects();

  const form = useForm<PropertyFullFormValues>({
    resolver: zodResolver(propertyFullSchema) as unknown as Resolver<PropertyFullFormValues>,
    defaultValues: property
      ? {
          name: property.name,
          projectId: property.projectId,
          propertyType: property.propertyType,
          transactionType: property.transactionType,
          usableArea: property.usableArea,
          bedrooms: property.bedrooms,
          listingPrice: property.listingPrice,
          status: property.status,
          block: property.block,
          floor: property.floor,
          unitNumber: property.unitNumber,
          landArea: property.landArea,
          bathrooms: property.bathrooms,
          direction: property.direction,
          furnishing: property.furnishing,
          discount: property.discount,
          commissionRate: property.commissionRate,
          legalStatus: property.legalStatus,
          description: property.description,
          advantages: property.advantages,
          disadvantages: property.disadvantages,
          notes: property.notes,
        }
      : {
          name: "",
          projectId: defaultProjectId,
          propertyType: "can_ho",
          transactionType: "sale",
          status: "available",
          legalStatus: "unverified",
        },
  });

  function onSubmit(values: PropertyFullFormValues) {
    const now = new Date().toISOString();
    const finalPrice =
      values.listingPrice !== undefined
        ? values.listingPrice - (values.discount ?? 0)
        : undefined;

    if (property) {
      propertiesCol.upsert({
        ...property,
        ...values,
        finalPrice,
        updatedAt: now,
      });
      toast.success("Đã cập nhật sản phẩm");
    } else {
      const newProperty: Property = {
        ...values,
        id: uuid(),
        finalPrice,
        legalSource: { status: "missing" },
        availabilitySource: { status: "unverified" },
        images: [],
        tags: [],
        createdAt: now,
        updatedAt: now,
      };
      propertiesCol.upsert(newProperty);
      toast.success("Đã thêm sản phẩm mới");
    }
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="size-4" /> Thêm sản phẩm
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sản phẩm *</FormLabel>
                  <FormControl>
                    <Input placeholder="Căn A-12-05" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thuộc dự án</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? "none"}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Không thuộc dự án" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Không thuộc dự án</SelectItem>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại hình *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PROPERTY_TYPE_LABEL).map(([v, l]) => (
                          <SelectItem key={v} value={v}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usableArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diện tích sử dụng (m²)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số phòng ngủ</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="listingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá niêm yết (VND)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PROPERTY_STATUS_LABEL).map(([v, l]) => (
                          <SelectItem key={v} value={v}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {!showMore ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowMore(true)}
                className="text-secondary"
              >
                + Thêm thông tin chi tiết (không bắt buộc)
              </Button>
            ) : (
              <div className="space-y-4 border-t pt-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="block"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Block</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="floor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tầng</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unitNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số căn/lô</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="landArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diện tích đất (m²)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số phòng tắm</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="direction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hướng</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn hướng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(DIRECTION_LABEL).map(([v, l]) => (
                              <SelectItem key={v} value={v}>
                                {l}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="furnishing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nội thất</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn tình trạng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(FURNISHING_LABEL).map(([v, l]) => (
                              <SelectItem key={v} value={v}>
                                {l}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giảm giá (VND)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="legalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pháp lý</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="verified">Đã xác minh</SelectItem>
                            <SelectItem value="pending">Chờ xác minh</SelectItem>
                            <SelectItem value="unverified">Chưa xác minh</SelectItem>
                            <SelectItem value="issue">Có vấn đề</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả sản phẩm</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="advantages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ưu điểm</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="disadvantages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nhược điểm</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="submit">{property ? "Lưu thay đổi" : "Thêm sản phẩm"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
