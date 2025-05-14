
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      // For URLs like https://youtu.be/VIDEO_ID
      videoId = urlObj.pathname.substring(1).split('?')[0]; // Remove query params if any
    } else if (urlObj.hostname.includes('youtube.com')) {
      // For URLs like https://www.youtube.com/watch?v=VIDEO_ID
      videoId = urlObj.searchParams.get('v');
      
      // For URLs like https://www.youtube.com/embed/VIDEO_ID
      if (!videoId && urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1].split('?')[0];
      }
      // For URLs like https://www.youtube.com/shorts/VIDEO_ID
      if (!videoId && urlObj.pathname.startsWith('/shorts/')) {
        videoId = urlObj.pathname.split('/shorts/')[1].split('?')[0];
      }
    }
  } catch (e) {
    // If URL parsing fails, try regex as a fallback for common patterns
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }
  }
  // Basic validation: YouTube video IDs are typically 11 characters long
  // and consist of alphanumeric characters, underscores, and hyphens.
  if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return videoId;
  }
  return null;
}

/**
 * Generates a YouTube watch URL with a timestamp.
 * @param videoId The YouTube video ID.
 * @param startTimeSeconds The start time in seconds.
 * @returns The YouTube watch URL with the timestamp.
 */
export function getYouTubeWatchUrlWithTimestamp(videoId: string, startTimeSeconds: number): string {
  const baseWatchUrl = "https://www.youtube.com/watch";
  const searchParams = new URLSearchParams();
  searchParams.set("v", videoId);
  searchParams.set("t", `${Math.floor(startTimeSeconds)}s`);
  return `${baseWatchUrl}?${searchParams.toString()}`;
}
