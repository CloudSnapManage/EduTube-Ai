
"use client";

import * as React from "react";
import type { TranscriptResponse } from "youtube-transcript";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink, TextQuote } from "lucide-react";
import Link from 'next/link';

interface InteractiveTranscriptDisplayProps {
  rawTranscript: TranscriptResponse[];
  videoUrl: string;
}

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getYouTubeWatchUrlWithTimestamp(videoUrl: string, startTimeMilliseconds: number): string {
  const startTimeSeconds = Math.floor(startTimeMilliseconds / 1000);
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
      searchParams.set("t", `${startTimeSeconds}s`);
      return `${baseWatchUrl}?${searchParams.toString()}`;
    }
  } catch (e) {
    console.error("Error parsing video URL for timestamp link:", e);
  }
  return `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}t=${startTimeSeconds}s`;
}

export function InteractiveTranscriptDisplay({ rawTranscript, videoUrl }: InteractiveTranscriptDisplayProps) {
  if (!rawTranscript || rawTranscript.length === 0) {
    return (
      <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center text-2xl font-semibold">
            <TextQuote className="mr-3 h-7 w-7 text-primary" />
            Interactive Transcript
          </CardTitle>
          <CardDescription className="text-base">No transcript data is available for this video.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center text-2xl font-semibold">
          <TextQuote className="mr-3 h-7 w-7 text-primary" />
          Interactive Transcript
        </CardTitle>
        <CardDescription className="text-base">
          Scroll through the transcript. Click any timestamp to open that part of the video on YouTube.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 md:p-6">
        <ScrollArea className="h-[600px] w-full rounded-md border bg-background">
          <div className="p-4 space-y-3">
            {rawTranscript.map((segment, index) => (
              <div key={index} className="group p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-0.5 whitespace-nowrap text-primary hover:bg-primary/10 hover:border-primary"
                    asChild
                  >
                    <Link
                      href={getYouTubeWatchUrlWithTimestamp(videoUrl, segment.offset)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Play from ${formatTime(segment.offset)}`}
                    >
                      {formatTime(segment.offset)}
                      <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
                    </Link>
                  </Button>
                  <p className="text-sm text-foreground leading-relaxed flex-1">
                    {segment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
