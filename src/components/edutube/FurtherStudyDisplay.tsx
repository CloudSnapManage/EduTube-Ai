
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb } from "lucide-react"; // Or Brain, Search

interface FurtherStudyDisplayProps {
  prompts: string[];
}

export function FurtherStudyDisplay({ prompts }: FurtherStudyDisplayProps) {
  if (!prompts || prompts.length === 0) {
    return null; 
  }

  return (
    <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center text-2xl font-semibold">
          <Lightbulb className="mr-3 h-7 w-7 text-yellow-400" />
          Explore Further
        </CardTitle>
        <CardDescription className="text-base">Thought-provoking questions and prompts for deeper learning.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="space-y-3 list-decimal list-inside pl-2">
          {prompts.map((prompt, index) => (
            <li key={index} className="text-sm leading-relaxed text-foreground/90">
              {prompt}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
