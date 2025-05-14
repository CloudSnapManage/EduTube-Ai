
"use client";

import { LoadingSpinner } from "@/components/edutube/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <LoadingSpinner message="Loading EduTube AI..." size={60} />
      <p className="mt-4 text-lg text-muted-foreground">Please wait while we prepare the experience for you.</p>
    </div>
  );
}
