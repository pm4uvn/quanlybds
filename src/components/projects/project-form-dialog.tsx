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
import { projectSchema, type ProjectFormValues } from "@/lib/schemas";
import { projectsCol } from "@/lib/repo";
import type { Project } from "@/lib/types";
import { CONSTRUCTION_STATUS_LABEL, PROJECT_TYPE_LABEL } from "@/lib/types";
import { Plus } from "lucide-react";

export function ProjectFormDialog({
  project,
  trigger,
}: {
  project?: Project;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as unknown as Resolver<ProjectFormValues>,
    defaultValues: project
      ? {
          name: project.name,
          developer: project.developer,
          projectType: project.projectType,
          address: project.address,
          province: project.province,
          district: project.district,
          description: project.description,
          constructionStatus: project.constructionStatus,
          expectedHandover: project.expectedHandover,
          totalUnits: project.totalUnits,
          startingPrice: project.startingPrice,
          avgPricePerM2: project.avgPricePerM2,
          paymentPolicy: project.paymentPolicy,
          bankFinancingPolicy: project.bankFinancingPolicy,
        }
      : {
          name: "",
          developer: "",
          projectType: "can_ho",
          address: "",
          province: "",
          district: "",
          constructionStatus: "under_construction",
        },
  });

  function onSubmit(values: ProjectFormValues) {
    const now = new Date().toISOString();
    if (project) {
      projectsCol.upsert({ ...project, ...values, updatedAt: now });
      toast.success("Đã cập nhật dự án");
    } else {
      const newProject: Project = {
        ...values,
        id: uuid(),
        images: [],
        documents: [],
        legalVerification: { status: "missing" },
        createdAt: now,
        updatedAt: now,
      };
      projectsCol.upsert(newProject);
      toast.success("Đã tạo dự án mới");
    }
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="size-4" /> Tạo dự án
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Chỉnh sửa dự án" : "Tạo dự án mới"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên dự án *</FormLabel>
                    <FormControl>
                      <Input placeholder="Vinhomes Grand Park" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="developer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chủ đầu tư *</FormLabel>
                    <FormControl>
                      <Input placeholder="Vinhomes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectType"
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
                        {Object.entries(PROJECT_TYPE_LABEL).map(([v, l]) => (
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
                name="constructionStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tình trạng xây dựng *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CONSTRUCTION_STATUS_LABEL).map(([v, l]) => (
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
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tỉnh/Thành phố *</FormLabel>
                    <FormControl>
                      <Input placeholder="TP. Hồ Chí Minh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quận/Huyện *</FormLabel>
                    <FormControl>
                      <Input placeholder="TP. Thủ Đức" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ *</FormLabel>
                  <FormControl>
                    <Input placeholder="Số nhà, đường..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="totalUnits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tổng số căn</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá khởi điểm (VND)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avgPricePerM2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá TB/m² (VND)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentPolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chính sách thanh toán</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankFinancingPolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chính sách vay ngân hàng</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">{project ? "Lưu thay đổi" : "Tạo dự án"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
