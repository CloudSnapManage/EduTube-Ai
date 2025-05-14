
"use client";

import { LoadingSpinner } from "@/components/edutube/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background animate-in fade-in-0 duration-500">
      <LoadingSpinner message="Loading EduTube AI..." size={60} />
      <p className="mt-4 text-lg text-muted-foreground animate-pulse delay-150">Please wait while we prepare the experience for you.</p>
    </div>
  );
}
