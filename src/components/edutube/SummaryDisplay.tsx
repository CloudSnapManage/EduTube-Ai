
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

interface SummaryDisplayProps {
  summary: string;
}

export function SummaryDisplay({ summary }: SummaryDisplayProps) {
  return (
    <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center text-2xl font-semibold">
          <FileText className="mr-3 h-7 w-7 text-primary" />
          Video Summary
        </CardTitle>
        <CardDescription className="text-base">Key points and topics covered in the video.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-60 w-full rounded-md border p-4 bg-background">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{summary}</p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

