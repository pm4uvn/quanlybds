import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  phase,
  description,
  plannedFeatures,
}: {
  icon: LucideIcon;
  title: string;
  phase: string;
  description: string;
  plannedFeatures: string[];
}) {
  return (
    <div className="max-w-2xl">
      <Badge variant="outline" className="mb-3 text-accent-foreground border-accent bg-accent/10">
        {phase}
      </Badge>
      <h1 className="text-xl lg:text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-secondary/10 p-2">
              <Icon className="size-5 text-secondary" />
            </div>
            <div className="text-sm font-medium">Tính năng dự kiến</div>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {plannedFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 rounded-full bg-secondary shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
