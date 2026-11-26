"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useProjects, useProperties } from "@/lib/use-repo";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatVnd } from "@/lib/format";
import { CONSTRUCTION_STATUS_LABEL, PROJECT_TYPE_LABEL } from "@/lib/types";
import { Building2, MapPin, Search } from "lucide-react";

export default function ProjectsPage() {
  const projects = useProjects();
  const properties = useProperties();
  const [query, setQuery] = useState("");

  const propertyCountByProject = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of properties) {
      if (!p.projectId || p.archivedAt) continue;
      map.set(p.projectId, (map.get(p.projectId) ?? 0) + 1);
    }
    return map;
  }, [properties]);

  const filtered = projects.filter((p) =>
    `${p.name} ${p.developer} ${p.district} ${p.province}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Dự án"
        description="Quản lý thông tin các dự án bất động sản bạn đang tư vấn."
        actions={<ProjectFormDialog />}
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên dự án, chủ đầu tư, khu vực..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Building2 className="size-10 mx-auto mb-3" />
            Chưa có dự án nào phù hợp.
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <Link key={project.id} href={`/du-an/${project.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{PROJECT_TYPE_LABEL[project.projectType]}</Badge>
                    <Badge variant="outline">{CONSTRUCTION_STATUS_LABEL[project.constructionStatus]}</Badge>
                  </div>
                  <div className="font-semibold mb-1">{project.name}</div>
                  <div className="text-xs text-muted-foreground mb-3">{project.developer}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <MapPin className="size-3.5" />
                    {project.district}, {project.province}
                  </div>
                  <div className="flex items-center justify-between text-sm pt-3 border-t">
                    <span className="text-muted-foreground">
                      {propertyCountByProject.get(project.id) ?? 0} sản phẩm
                    </span>
                    <span className="font-medium">{formatVnd(project.startingPrice)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
