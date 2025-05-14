// SummarizeYouTubeVideo Story: As a student, I want to paste a YouTube video URL and get a concise summary of the video's key points so I can quickly understand the main topics covered.

'use server';

/**
 * @fileOverview Summarizes a YouTube video given its URL by first fetching its transcript.
 *
 * - summarizeYouTubeVideo - A function that summarizes the video.
 * - SummarizeYouTubeVideoInput - The input type for the summarizeYouTubeVideo function.
 * - SummarizeYouTubeVideoOutput - The return type for the summarizeYouTubeVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getYouTubeTranscript } from '@/services/youtube';

const SummarizeYouTubeVideoInputSchema = z.object({
  videoUrl: z.string().describe('The YouTube video URL to summarize.'),
});
export type SummarizeYouTubeVideoInput = z.infer<
  typeof SummarizeYouTubeVideoInputSchema
>;

// New input schema for the prompt, which now takes the transcript
const PromptInputSchema = z.object({
  videoTranscript: z.string().describe('The transcript of the YouTube video.'),
});

const SummarizeYouTubeVideoOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the video.'),
});
export type SummarizeYouTubeVideoOutput = z.infer<
  typeof SummarizeYouTubeVideoOutputSchema
>;

export async function summarizeYouTubeVideo(
  input: SummarizeYouTubeVideoInput
): Promise<SummarizeYouTubeVideoOutput> {
  // Errors from the flow (including transcript fetching issues) will propagate
  return summarizeYouTubeVideoFlow(input);
}

const youtubeSummaryPrompt = ai.definePrompt({
  name: 'youtubeSummaryPrompt',
  input: {schema: PromptInputSchema}, // Updated to use PromptInputSchema
  output: {schema: SummarizeYouTubeVideoOutputSchema},
  prompt: `You are an expert summarizer, skilled at condensing YouTube video transcripts into concise summaries for students.

  Please summarize the following YouTube video transcript. Focus on the key points and main topics covered.

  Video Transcript:
  {{{videoTranscript}}}`, // Updated to use videoTranscript
});

const summarizeYouTubeVideoFlow = ai.defineFlow(
  {
    name: 'summarizeYouTubeVideoFlow',
    inputSchema: SummarizeYouTubeVideoInputSchema, // Flow input is still the URL
    outputSchema: SummarizeYouTubeVideoOutputSchema,
  },
  async (input) => { // input here is { videoUrl: string }
    let transcript: string | null;
    try {
      transcript = await getYouTubeTranscript(input.videoUrl);
    } catch (e: any) {
        console.error(`Error fetching transcript for ${input.videoUrl} in flow:`, e);
        // Re-throw the error to be caught by the calling action/function
        throw new Error(`Failed to retrieve transcript: ${e.message || 'Unknown error during transcript fetching.'}`);
    }

    if (!transcript) {
      console.warn(`No transcript available or fetched for video: ${input.videoUrl}`);
      throw new Error('Could not retrieve transcript for the video. It might be unavailable, have transcripts disabled, or the URL is incorrect.');
    }

    // Call the prompt with the fetched transcript
    const {output} = await youtubeSummaryPrompt({videoTranscript: transcript});
    if (!output) {
      throw new Error('Failed to generate summary from transcript.');
    }
    return output;
  }
);
