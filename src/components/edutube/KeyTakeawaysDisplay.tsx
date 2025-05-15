
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListChecks } from "lucide-react"; // Or CheckSquare, Zap

interface KeyTakeawaysDisplayProps {
  takeaways: string[];
}

export function KeyTakeawaysDisplay({ takeaways }: KeyTakeawaysDisplayProps) {
  if (!takeaways || takeaways.length === 0) {
    return null; // Or a message indicating no takeaways were generated
  }

  return (
    <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center text-2xl font-semibold">
          <ListChecks className="mr-3 h-7 w-7 text-primary" />
          Key Takeaways
        </CardTitle>
        <CardDescription className="text-base">The most critical points from the video at a glance.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="space-y-3 list-disc list-inside pl-2">
          {takeaways.map((takeaway, index) => (
            <li key={index} className="text-sm leading-relaxed text-foreground/90">
              {takeaway}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
