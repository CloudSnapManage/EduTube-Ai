// SummarizeYouTubeVideo Story: As a student, I want to paste a YouTube video URL and get a concise summary of the video's key points so I can quickly understand the main topics covered.

'use server';

/**
 * @fileOverview Summarizes a YouTube video given its URL.
 *
 * - summarizeYouTubeVideo - A function that summarizes the video.
 * - SummarizeYouTubeVideoInput - The input type for the summarizeYouTubeVideo function.
 * - SummarizeYouTubeVideoOutput - The return type for the summarizeYouTubeVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeYouTubeVideoInputSchema = z.object({
  videoUrl: z.string().describe('The YouTube video URL to summarize.'),
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
  prompt: `You are an expert summarizer, skilled at condensing YouTube videos into concise summaries for students.

  Please summarize the following YouTube video. Focus on the key points and main topics covered.

  Video URL: {{{videoUrl}}}`,
});

const summarizeYouTubeVideoFlow = ai.defineFlow(
  {
    name: 'summarizeYouTubeVideoFlow',
    inputSchema: SummarizeYouTubeVideoInputSchema,
    outputSchema: SummarizeYouTubeVideoOutputSchema,
  },
  async input => {
    const {output} = await youtubeSummaryPrompt(input);
    return output!;
  }
);
