
// SummarizeYouTubeVideo Story: As a student, I want to get a concise summary of a video's key points so I can quickly understand the main topics covered.
// This flow now takes a pre-fetched video transcript string as input.

'use server';

/**
 * @fileOverview Summarizes a YouTube video given its transcript text.
 *
 * - summarizeYouTubeVideo - A function that summarizes the video content.
 * - SummarizeYouTubeVideoInput - The input type for the summarizeYouTubeVideo function (expects video transcript).
 * - SummarizeYouTubeVideoOutput - The return type for the summarizeYouTubeVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema now expects the transcript directly
const SummarizeYouTubeVideoInputSchema = z.object({
  videoTranscript: z.string().describe('The transcript of the YouTube video.'),
});
export type SummarizeYouTubeVideoInput = z.infer<
  typeof SummarizeYouTubeVideoInputSchema
>;

const SummarizeYouTubeVideoOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the video.'),
});
export type SummarizeYouTubeVideoOutput = z.infer<
  typeof SummarizeYouTubeVideoOutputSchema
>;

export async function summarizeYouTubeVideo(
  input: SummarizeYouTubeVideoInput
): Promise<SummarizeYouTubeVideoOutput> {
  return summarizeYouTubeVideoFlow(input);
}

const youtubeSummaryPrompt = ai.definePrompt({
  name: 'youtubeSummaryPrompt',
  input: {schema: SummarizeYouTubeVideoInputSchema}, 
  output: {schema: SummarizeYouTubeVideoOutputSchema},
  prompt: `You are an expert summarizer, skilled at condensing YouTube video transcripts into concise summaries for students.

  Please summarize the following YouTube video transcript. Focus on the key points and main topics covered.

  Video Transcript:
  {{{videoTranscript}}}`,
});

const summarizeYouTubeVideoFlow = ai.defineFlow(
  {
    name: 'summarizeYouTubeVideoFlow',
    inputSchema: SummarizeYouTubeVideoInputSchema, // Flow input is now the transcript text
    outputSchema: SummarizeYouTubeVideoOutputSchema,
  },
  async (input) => { // input here is { videoTranscript: string }
    const {output} = await youtubeSummaryPrompt(input); // Pass the input directly
    if (!output) {
      throw new Error('Failed to generate summary from transcript.');
    }
    return output;
  }
);
