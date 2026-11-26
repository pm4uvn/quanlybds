"use client";

import { useRef, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { downloadImportTemplate, parsePropertyWorkbook, type ParsedImportResult } from "@/lib/excel";
import { useProjects, useProperties } from "@/lib/use-repo";
import { propertiesCol, importJobsCol } from "@/lib/repo";
import { formatVnd } from "@/lib/format";
import { PROPERTY_TYPE_LABEL } from "@/lib/types";
import { Upload, FileSpreadsheet, AlertTriangle } from "lucide-react";

export function ImportDialog() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ParsedImportResult | null>(null);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const projects = useProjects();
  const existing = useProperties();

  async function handleFile(file: File) {
    setFileName(file.name);
    const parsed = await parsePropertyWorkbook(file, projects, existing);
    setResult(parsed);
  }

  function confirmImport() {
    if (!result) return;
    propertiesCol.upsertMany(result.rows);
    importJobsCol.upsert({
      id: uuid(),
      fileName,
      totalRows: result.totalRows,
      importedRows: result.rows.length,
      errors: result.errors,
      createdAt: new Date().toISOString(),
    });
    toast.success(`Đã nhập ${result.rows.length} sản phẩm từ Excel`);
    setOpen(false);
    setResult(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setResult(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="size-4" /> Nhập Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nhập sản phẩm từ Excel</DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tải file mẫu, điền thông tin sản phẩm rồi tải lên để nhập hàng loạt vào kho sản phẩm.
            </p>
            <Button variant="outline" onClick={downloadImportTemplate} className="w-full">
              <FileSpreadsheet className="size-4" /> Tải file mẫu
            </Button>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm">Nhấn để chọn file .xlsx hoặc .csv</div>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary">{result.totalRows} dòng</Badge>
              <Badge variant="default">{result.rows.length} hợp lệ</Badge>
              {result.duplicates > 0 && <Badge variant="outline">{result.duplicates} trùng lặp</Badge>}
              {result.errors.length > 0 && <Badge variant="destructive">{result.errors.length} lỗi</Badge>}
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm space-y-1 max-h-32 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-destructive">
                    <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
                    Dòng {e.row}: {e.message}
                  </div>
                ))}
              </div>
            )}

            <div className="text-sm font-medium">Xem trước dữ liệu hợp lệ</div>
            <ScrollArea className="h-64 border rounded-md">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-2">Tên</th>
                    <th className="text-left p-2">Loại hình</th>
                    <th className="text-left p-2">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">{r.name}</td>
                      <td className="p-2">{PROPERTY_TYPE_LABEL[r.propertyType]}</td>
                      <td className="p-2">{formatVnd(r.finalPrice ?? r.listingPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={() => setResult(null)}>
                Chọn file khác
              </Button>
              <Button onClick={confirmImport} disabled={result.rows.length === 0}>
                Xác nhận nhập {result.rows.length} sản phẩm
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
