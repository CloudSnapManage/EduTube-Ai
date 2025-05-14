
"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
  message?: string;
}

export function LoadingSpinner({ className, size = 48, message }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2 py-8", className)}>
      <Loader2 className="animate-spin text-primary" style={{ width: size, height: size }} />
      {message && <p className="text-muted-foreground animate-pulse">{message}</p>}
    </div>
  );
}
