import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  label: string;
  value: string | number | null | undefined;
  hint?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({ label, value, hint, loading, icon, className }: KpiCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </CardHeader>
      <CardContent>
        {loading || value === null || value === undefined ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="tabular text-2xl font-semibold">{value}</p>
        )}
        {hint && <CardDescription className="mt-1">{hint}</CardDescription>}
      </CardContent>
    </Card>
  );
}
