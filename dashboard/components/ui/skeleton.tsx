import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse-soft rounded-md bg-muted", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
