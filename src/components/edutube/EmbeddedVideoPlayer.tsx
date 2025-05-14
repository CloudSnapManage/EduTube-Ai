
"use client";

import * as React from "react";
import YouTube, { type YouTubePlayer, type YouTubeProps } from "react-youtube";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card"; // Added Card for consistent styling

interface EmbeddedVideoPlayerProps {
  videoId: string;
  seekToTime?: number; // Prop to trigger seek
  className?: string;
  onPlayerReady?: (player: YouTubePlayer) => void; // Optional: if parent needs direct player access
}

export function EmbeddedVideoPlayer({
  videoId,
  seekToTime,
  className,
  onPlayerReady
}: EmbeddedVideoPlayerProps) {
  const playerRef = React.useRef<YouTubePlayer | null>(null);

  const handleReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    if (onPlayerReady) {
        onPlayerReady(event.target);
    }
  };

  React.useEffect(() => {
    if (playerRef.current && seekToTime !== undefined && seekToTime !== null) {
      playerRef.current.seekTo(seekToTime, true);
      // Optionally, play the video if it's paused after seeking
      // const playerState = playerRef.current.getPlayerState();
      // if (playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.CUED) {
      //   playerRef.current.playVideo();
      // }
    }
  }, [seekToTime]); // Effect runs when seekToTime changes

  const opts: YouTubeProps['opts'] = {
    height: '390', // Default height, can be overridden by className
    width: '640',  // Default width, can be overridden by className
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0, // Autoplay disabled by default
      modestbranding: 1,
      rel: 0, // Do not show related videos at the end
    },
  };

  return (
    <Card className={cn("mt-8 shadow-xl rounded-lg overflow-hidden bg-black", className)}>
      <CardContent className="p-0 aspect-video">
        {/* The aspect-video class helps maintain a 16:9 ratio */}
        {/* The key prop with videoId ensures the player re-initializes if the videoId changes */}
        <YouTube
          key={videoId} 
          videoId={videoId}
          opts={opts}
          onReady={handleReady}
          className="w-full h-full" // Ensures the YouTube component fills the CardContent
          iframeClassName="w-full h-full" // Ensures the iframe itself fills its container
        />
      </CardContent>
    </Card>
  );
}
