
'use server';

import { YoutubeTranscript, type TranscriptResponse } from 'youtube-transcript';

/**
 * @fileOverview Service for interacting with YouTube, e.g., fetching transcripts.
 *
 * - getYouTubeTranscript - Fetches the structured transcript for a given YouTube video URL.
 */

/**
 * Fetches the structured transcript for a given YouTube video URL.
 * Each transcript entry includes text, duration (ms), and offset (ms).
 * @param videoUrl The URL of the YouTube video.
 * @returns A promise that resolves to an array of TranscriptResponse objects, or null if fetching fails or no transcript is found.
 * @throws Throws an error if the youtube-transcript library encounters an issue.
 */
export async function getYouTubeTranscript(videoUrl: string): Promise<TranscriptResponse[] | null> {
  try {
    const transcriptResponse: TranscriptResponse[] = await YoutubeTranscript.fetchTranscript(videoUrl);
    if (!transcriptResponse || transcriptResponse.length === 0) {
      console.warn(`No transcript found for video: ${videoUrl}`);
      return null; // No transcript available
    }
    return transcriptResponse;
  } catch (error: any) {
    console.error(`Error fetching transcript for ${videoUrl} using youtube-transcript:`, error.message);
    throw new Error(`Failed to fetch transcript from youtube-transcript: ${error.message}`);
  }
}
