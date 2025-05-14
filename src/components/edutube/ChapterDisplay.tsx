
"use client";

import * as React from "react";
import type { Chapter } from "@/ai/flows/generate-chapters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListCollapse, ExternalLink, PlayCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from 'next/link'; // Keep for external link
import { getYouTubeWatchUrlWithTimestamp } from "@/lib/youtube-utils";


interface ChapterDisplayProps {
  chapters: Chapter[];
  videoId: string; // Now expects videoId directly
  onChapterClick: (timeInSeconds: number) => void;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function ChapterDisplay({ chapters, videoId, onChapterClick }: ChapterDisplayProps) {
  if (!chapters || chapters.length === 0) {
    return (
       <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
        <CardHeader  className="bg-muted/30">
          <CardTitle className="flex items-center text-2xl font-semibold">
            <ListCollapse className="mr-3 h-7 w-7 text-primary" />
            Video Chapters
          </CardTitle>
          <CardDescription className="text-base">No chapters were generated for this video.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center text-2xl font-semibold">
          <ListCollapse className="mr-3 h-7 w-7 text-primary" />
          Video Chapters
        </CardTitle>
        <CardDescription className="text-base">Key sections of the video. Click to play in the embedded player, or open on YouTube.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-72 w-full rounded-md border bg-background">
          <ul className="p-4 space-y-2">
            {chapters.map((chapter, index) => (
              <li key={index} className="group flex items-center justify-between p-2 hover:bg-accent/10 rounded-md transition-colors">
                <Button
                  variant="ghost"
                  className="flex-1 justify-start p-1 h-auto text-left hover:bg-transparent"
                  onClick={() => onChapterClick(chapter.startTimeSeconds)}
                >
                  <PlayCircle className="mr-3 h-5 w-5 text-primary/80 group-hover:text-primary transition-colors" />
                  <div>
                    <span className="font-medium text-primary group-hover:underline">{formatTime(chapter.startTimeSeconds)}</span>
                    <span className="ml-3 text-sm text-foreground">{chapter.title}</span>
                  </div>
                </Button>
                <Button variant="ghost" size="icon" className="ml-2 h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                  <Link
                    href={getYouTubeWatchUrlWithTimestamp(videoId, chapter.startTimeSeconds)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
