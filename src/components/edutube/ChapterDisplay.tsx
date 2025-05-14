
"use client";

import * as React from "react";
import type { Chapter } from "@/ai/flows/generate-chapters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListCollapse, Link as LinkIcon, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

interface ChapterDisplayProps {
  chapters: Chapter[];
  videoUrl: string;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getYouTubeWatchUrlWithTimestamp(videoUrl: string, startTimeSeconds: number): string {
  try {
    const url = new URL(videoUrl);
    let videoId: string | null = null;

    if (url.hostname === "youtu.be") {
      videoId = url.pathname.substring(1);
    } else if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
      videoId = url.searchParams.get("v");
    }

    if (videoId) {
      const baseWatchUrl = "https://www.youtube.com/watch";
      const searchParams = new URLSearchParams();
      searchParams.set("v", videoId);
      searchParams.set("t", `${Math.floor(startTimeSeconds)}s`);
      return `${baseWatchUrl}?${searchParams.toString()}`;
    }
  } catch (e) {
    console.error("Error parsing video URL for timestamp link:", e);
  }
  // Fallback if URL parsing fails or it's not a recognized YouTube URL
  return `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}t=${Math.floor(startTimeSeconds)}s`;
}


export function ChapterDisplay({ chapters, videoUrl }: ChapterDisplayProps) {
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
        <CardDescription className="text-base">Key sections of the video. Click to jump to that part on YouTube.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-72 w-full rounded-md border bg-background">
          <ul className="p-4 space-y-2">
            {chapters.map((chapter, index) => (
              <li key={index} className="group">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto hover:bg-accent/80 hover:text-accent-foreground transition-colors rounded-md"
                  asChild
                >
                  <Link
                    href={getYouTubeWatchUrlWithTimestamp(videoUrl, chapter.startTimeSeconds)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1 text-left">
                      <span className="font-medium text-primary group-hover:underline">{formatTime(chapter.startTimeSeconds)}</span>
                      <span className="ml-3 text-sm text-foreground">{chapter.title}</span>
                    </div>
                    <ExternalLink className="ml-2 h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-opacity opacity-70 group-hover:opacity-100" />
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
