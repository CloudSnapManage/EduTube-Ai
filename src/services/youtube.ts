'use server';

import { YouTubeTranscript, type TranscriptResponse } from 'youtube-transcript';

/**
 * @fileOverview Service for interacting with YouTube, e.g., fetching transcripts.
 *
 * - getYouTubeTranscript - Fetches the transcript for a given YouTube video URL.
 */

/**
 * Fetches the transcript for a given YouTube video URL.
 * @param videoUrl The URL of the YouTube video.
 * @returns A promise that resolves to the transcript text, or null if fetching fails or no transcript is found.
 * @throws Throws an error if the youtube-transcript library encounters an issue.
 */
export async function getYouTubeTranscript(videoUrl: string): Promise<string | null> {
  try {
    const transcriptResponse: TranscriptResponse[] = await YouTubeTranscript.fetchTranscript(videoUrl);
    if (!transcriptResponse || transcriptResponse.length === 0) {
      console.warn(`No transcript found for video: ${videoUrl}`);
      return null; // No transcript available
    }
    // Concatenate all parts of the transcript into a single string
    return transcriptResponse.map(entry => entry.text).join(' ');
  } catch (error: any) {
    // Log the error and re-throw to be handled by the caller
    console.error(`Error fetching transcript for ${videoUrl} using youtube-transcript:`, error.message);
    // It's better to let the caller (Genkit flow) handle this as an operational error.
    // The library might throw for various reasons (invalid URL, private video, network issues).
    throw new Error(`Failed to fetch transcript from youtube-transcript: ${error.message}`);
  }
}
