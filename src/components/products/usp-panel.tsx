"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ListEditor } from "./list-editor";
import { uspCol } from "@/lib/repo";
import { useProductUsp } from "@/lib/use-repo";
import type { ProductUsp } from "@/lib/types";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

function emptyUsp(propertyId: string): ProductUsp & { id: string } {
  return {
    id: propertyId,
    propertyId,
    topReasons: [],
    competitiveAdvantages: [],
    differentiation: "",
    idealCustomers: [],
    notSuitableFor: [],
    objections: [],
    elevatorPitch: "",
    updatedAt: new Date().toISOString(),
  };
}

export function UspPanel({ propertyId }: { propertyId: string }) {
  const existing = useProductUsp(propertyId);
  const [draft, setDraft] = useState<ProductUsp & { id: string }>(existing ?? emptyUsp(propertyId));

  function save() {
    const next = { ...draft, updatedAt: new Date().toISOString() };
    uspCol.upsert(next);
    toast.success("Đã lưu nội dung bán hàng");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={save}>Lưu thay đổi</Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">3 lý do nên mua</CardTitle></CardHeader>
          <CardContent>
            <ListEditor items={draft.topReasons} onChange={(v) => setDraft((p) => ({ ...p, topReasons: v }))} placeholder="Thêm lý do..." />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Lợi thế cạnh tranh</CardTitle></CardHeader>
          <CardContent>
            <ListEditor items={draft.competitiveAdvantages} onChange={(v) => setDraft((p) => ({ ...p, competitiveAdvantages: v }))} placeholder="Thêm lợi thế..." />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Khách hàng phù hợp</CardTitle></CardHeader>
          <CardContent>
            <ListEditor items={draft.idealCustomers} onChange={(v) => setDraft((p) => ({ ...p, idealCustomers: v }))} placeholder="Thêm nhóm khách hàng..." />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Không phù hợp với</CardTitle></CardHeader>
          <CardContent>
            <ListEditor items={draft.notSuitableFor} onChange={(v) => setDraft((p) => ({ ...p, notSuitableFor: v }))} placeholder="Thêm trường hợp..." />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Phát biểu khác biệt hoá sản phẩm</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            rows={2}
            value={draft.differentiation}
            onChange={(e) => setDraft((p) => ({ ...p, differentiation: e.target.value }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Elevator pitch (30 giây)</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            rows={2}
            value={draft.elevatorPitch}
            onChange={(e) => setDraft((p) => ({ ...p, elevatorPitch: e.target.value }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Xử lý từ chối thường gặp</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {draft.objections.map((o, i) => (
            <div key={i} className="grid sm:grid-cols-2 gap-2 border-b pb-3 last:border-0">
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground mt-2 shrink-0">Khách nói:</span>
                <Input
                  value={o.objection}
                  onChange={(e) => {
                    const objections = [...draft.objections];
                    objections[i] = { ...objections[i], objection: e.target.value };
                    setDraft((p) => ({ ...p, objections }));
                  }}
                />
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground mt-2 shrink-0">Phản hồi:</span>
                <Textarea
                  rows={1}
                  value={o.response}
                  onChange={(e) => {
                    const objections = [...draft.objections];
                    objections[i] = { ...objections[i], response: e.target.value };
                    setDraft((p) => ({ ...p, objections }));
                  }}
                />
                <button
                  onClick={() => setDraft((p) => ({ ...p, objections: p.objections.filter((_, idx) => idx !== i) }))}
                  className="mt-2"
                >
                  <X className="size-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDraft((p) => ({ ...p, objections: [...p.objections, { objection: "", response: "" }] }))}
          >
            <Plus className="size-3.5" /> Thêm câu hỏi/từ chối
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
