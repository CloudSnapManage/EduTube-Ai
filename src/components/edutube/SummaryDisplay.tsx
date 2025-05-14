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
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <FileText className="mr-2 h-6 w-6 text-primary" />
          Video Summary
        </CardTitle>
        <CardDescription>Key points and topics covered in the video.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-60 w-full rounded-md border p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{summary}</p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
