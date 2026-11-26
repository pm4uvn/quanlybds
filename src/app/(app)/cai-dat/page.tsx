"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { setScoringWeights } from "@/lib/repo";
import { useProjects, useProperties, useScoringWeights } from "@/lib/use-repo";
import { SCORE_CRITERIA } from "@/lib/scoring";
import { clearDemoData } from "@/lib/demo-data";
import { DEFAULT_SCORING_WEIGHTS, type ScoringWeights } from "@/lib/types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const savedWeights = useScoringWeights();
  const [weights, setWeights] = useState<ScoringWeights>(savedWeights);
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const projects = useProjects();
  const properties = useProperties();
  const demoActive = projects.some((p) => p.isDemo) || properties.some((p) => p.isDemo);

  function save() {
    setScoringWeights(weights);
    toast.success("Đã lưu trọng số tiêu chí đánh giá");
  }

  function resetDefault() {
    setWeights(DEFAULT_SCORING_WEIGHTS);
    setScoringWeights(DEFAULT_SCORING_WEIGHTS);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Cài đặt" description="Cấu hình tiêu chí đánh giá sản phẩm và quản lý dữ liệu." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trọng số tiêu chí đánh giá sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tổng trọng số hiện tại</span>
            <Badge variant={total === 100 ? "default" : "destructive"}>{total}%</Badge>
          </div>
          {SCORE_CRITERIA.map(({ key, label }) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1.5">
                <span>{label}</span>
                <span className="font-medium">{weights[key]}%</span>
              </div>
              <Slider
                value={[weights[key]]}
                max={50}
                step={1}
                onValueChange={([v]) => setWeights((w) => ({ ...w, [key]: v }))}
              />
            </div>
          ))}
          {total !== 100 && (
            <p className="text-xs text-destructive">
              Tổng trọng số nên bằng 100% để điểm số có ý nghĩa chuẩn xác nhất.
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={save}>Lưu trọng số</Button>
            <Button variant="outline" onClick={resetDefault}>Khôi phục mặc định</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dữ liệu demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Realty360 đi kèm dữ liệu minh họa (dự án, sản phẩm, khách hàng giả định) để bạn trải nghiệm trước.
            Khi đã sẵn sàng quản lý dữ liệu thật, bạn có thể xoá toàn bộ dữ liệu demo.
          </p>
          <Badge variant={demoActive ? "outline" : "secondary"}>
            {demoActive ? "Dữ liệu demo đang hoạt động" : "Không còn dữ liệu demo"}
          </Badge>
          <div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={!demoActive}>
                  Xoá dữ liệu demo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xoá toàn bộ dữ liệu demo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này sẽ xoá các dự án, sản phẩm và khách hàng được gắn nhãn minh hoạ. Dữ liệu thật bạn
                    đã tự nhập sẽ không bị ảnh hưởng. Không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      clearDemoData();
                      toast.success("Đã xoá dữ liệu demo");
                    }}
                  >
                    Xoá dữ liệu demo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
