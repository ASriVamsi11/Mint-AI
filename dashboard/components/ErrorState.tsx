import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Failed to load",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card role="alert" aria-live="assertive" className="border-destructive/40">
      <CardHeader className="flex flex-row items-center gap-2">
        <AlertCircle className="size-4 text-destructive" aria-hidden="true" />
        <div className="flex-1">
          <CardTitle className="text-sm">{title}</CardTitle>
          <CardDescription className="mt-1">{message}</CardDescription>
        </div>
      </CardHeader>
      {onRetry && (
        <CardContent>
          <Button size="sm" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
