import { cn } from "#/lib/utils";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Loading({ className, size = "md" }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-2",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-muted-foreground border-t-transparent",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loading size="lg" />
    </div>
  );
}

export function LoadingInline() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loading />
    </div>
  );
}
