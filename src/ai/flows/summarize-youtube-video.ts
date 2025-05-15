
'use server';

/**
 * @fileOverview Summarizes a YouTube video given its transcript text, with options for length/style and language.
 *
 * - summarizeYouTubeVideo - A function that summarizes the video content.
 * - SummarizeYouTubeVideoInput - The input type for the summarizeYouTubeVideo function.
 * - SummarizeYouTubeVideoOutput - The return type for the summarizeYouTubeVideo function.
 * - SummaryStyle - The type for the desired summary style.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummaryStyleSchema = z.enum([
  "short", 
  "medium", 
  "detailed", 
  "eli5", // Explain Like I'm 5
  "academic" 
]).describe("The desired style or length of the summary.");
export type SummaryStyle = z.infer<typeof SummaryStyleSchema>;

const SummarizeYouTubeVideoInputSchema = z.object({
  videoTranscript: z.string().describe('The transcript of the YouTube video.'),
  summaryStyle: SummaryStyleSchema.optional().default("medium").describe("The desired style/length of the summary (e.g., short, medium, detailed, eli5, academic)."),
  targetLanguage: z.string().optional().default("English").describe("The language in which the summary should be generated (e.g., 'English', 'Spanish', 'French')."),
});
export type SummarizeYouTubeVideoInput = z.infer<
  typeof SummarizeYouTubeVideoInputSchema
>;

const SummarizeYouTubeVideoOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the video, tailored to the specified style and language.'),
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
  prompt: `You are an expert summarizer, skilled at condensing YouTube video transcripts into clear and effective summaries for students.

Please summarize the following YouTube video transcript.

Output Language: Generate the summary in {{{targetLanguage}}}.

Summary Style/Length:
{{#if (eq summaryStyle "short")}}
Provide a very brief, concise summary (1-2 paragraphs).
{{else if (eq summaryStyle "detailed")}}
Provide a detailed and comprehensive summary, covering all main topics and key arguments.
{{else if (eq summaryStyle "eli5")}}
Explain the main concepts from the transcript as if you were explaining them to a 5-year-old. Use very simple language and analogies if possible.
{{else if (eq summaryStyle "academic")}}
Provide a formal, academic-style summary. Use precise terminology and maintain an objective tone.
{{else}}
Provide a medium-length summary (3-4 paragraphs), focusing on the key points and main topics.
{{/if}}

Video Transcript:
{{{videoTranscript}}}

Generate the summary in {{{targetLanguage}}} based on the specified style.`,
});

const summarizeYouTubeVideoFlow = ai.defineFlow(
  {
    name: 'summarizeYouTubeVideoFlow',
    inputSchema: SummarizeYouTubeVideoInputSchema,
    outputSchema: SummarizeYouTubeVideoOutputSchema,
  },
  async (input) => {
    const {output} = await youtubeSummaryPrompt(input);
    if (!output) {
      throw new Error('Failed to generate summary from transcript.');
    }
    return output;
  }
);

