
'use server';

/**
 * @fileOverview Defines a Genkit flow for generating chapters with timestamps from a video transcript.
 *
 * - generateChapters - A function that takes video transcript segments and returns a list of chapters.
 * - GenerateChaptersInput - The input type for the generateChapters function.
 * - GenerateChaptersOutput - The return type for the generateChapters function.
 * - Chapter - Represents a single chapter with a title and start time.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscriptSegmentSchema = z.object({
  text: z.string().describe('The text content of the transcript segment.'),
  offset: z.number().describe('The start time of the segment in milliseconds.'),
});

const GenerateChaptersInputSchema = z.object({
  transcriptSegments: z
    .array(TranscriptSegmentSchema)
    .describe('An array of transcript segments, each with text and its offset in milliseconds.'),
});
export type GenerateChaptersInput = z.infer<typeof GenerateChaptersInputSchema>;

const ChapterSchema = z.object({
  title: z.string().describe('A concise and descriptive title for the chapter.'),
  startTimeSeconds: z.number().int().nonnegative().describe('The start time of the chapter in whole seconds from the beginning of the video.'),
});
export type Chapter = z.infer<typeof ChapterSchema>;

const GenerateChaptersOutputSchema = z.object({
  chapters: z.array(ChapterSchema).describe('A list of chapters identified from the transcript, each with a title and start time in seconds.'),
});
export type GenerateChaptersOutput = z.infer<typeof GenerateChaptersOutputSchema>;

export async function generateChapters(input: GenerateChaptersInput): Promise<GenerateChaptersOutput> {
  return generateChaptersFlow(input);
}

const generateChaptersPrompt = ai.definePrompt({
  name: 'generateChaptersPrompt',
  input: {schema: GenerateChaptersInputSchema},
  output: {schema: GenerateChaptersOutputSchema},
  prompt: `You are an expert at analyzing video transcripts to identify distinct chapters or thematic sections.
Given the following transcript segments, each with its text and start time offset in milliseconds, your task is to:
1. Identify logical breaks in the content to define chapters. Aim for meaningful sections that cover distinct topics or stages in the video.
2. For each chapter, provide a concise and descriptive title (e.g., "Introduction to Photosynthesis", "Step 1: Mixing Ingredients", "Understanding Quantum Entanglement").
3. For each chapter, determine its start time in SECONDS. This should be the offset of the *first* transcript segment that belongs to that chapter. Convert this offset from milliseconds to seconds by dividing by 1000 and rounding to the nearest whole number.
4. Aim for a reasonable number of chapters, typically between 5 and 15, depending on the transcript's length and content diversity. Ensure chapter titles are distinct.

Transcript segments:
{{#each transcriptSegments}}
- Text: "{{this.text}}" (Starts at: {{this.offset}}ms)
{{/each}}

Return your response as a list of chapter objects, where each object contains a 'title' and 'startTimeSeconds'.
Example chapter object: { "title": "Key Concept Explanation", "startTimeSeconds": 123 }
`,
});

const generateChaptersFlow = ai.defineFlow(
  {
    name: 'generateChaptersFlow',
    inputSchema: GenerateChaptersInputSchema,
    outputSchema: GenerateChaptersOutputSchema,
  },
  async (input) => {
    // Basic validation for empty transcript
    if (!input.transcriptSegments || input.transcriptSegments.length === 0) {
      return { chapters: [] };
    }
    // Cap the number of segments to avoid overly long prompts, e.g., first 500 segments
    // This is a practical limit; adjust as needed.
    const MAX_SEGMENTS = 700; 
    const truncatedSegments = input.transcriptSegments.slice(0, MAX_SEGMENTS);

    const {output} = await generateChaptersPrompt({ transcriptSegments: truncatedSegments });
    if (!output) {
        throw new Error('Failed to generate chapters from transcript.');
    }
    // Sort chapters by start time, as LLM might not always return them in order
    output.chapters.sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
    return output;
  }
);
