
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating revision notes from a video summary.
 *
 * - generateNotes - A function that takes a video summary as input and returns structured notes.
 * - GenerateNotesInput - The input type for the generateNotes function.
 * - GenerateNotesOutput - The return type for the generateNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNotesInputSchema = z.object({
  videoSummary: z
    .string()
    .describe('A summary of the video content to generate notes from.'),
});
export type GenerateNotesInput = z.infer<typeof GenerateNotesInputSchema>;

const GenerateNotesOutputSchema = z.object({
  notes: z.string().describe('Concise, well-structured notes suitable for quick revision, derived from the video summary. May include bullet points or numbered lists.'),
});
export type GenerateNotesOutput = z.infer<typeof GenerateNotesOutputSchema>;

export async function generateNotes(input: GenerateNotesInput): Promise<GenerateNotesOutput> {
  return generateNotesFlow(input);
}

const generateNotesPrompt = ai.definePrompt({
  name: 'generateNotesPrompt',
  input: {schema: GenerateNotesInputSchema},
  output: {schema: GenerateNotesOutputSchema},
  prompt: `You are an expert academic assistant. Your task is to transform the following video summary into concise, well-structured notes suitable for quick revision.

Focus on extracting and clearly presenting:
- Key concepts and definitions
- Important takeaways and main ideas
- Core arguments or steps, if applicable

Use bullet points, numbered lists, or short paragraphs where appropriate to enhance readability and structure. The notes should be easy to scan and digest.

Video Summary:
{{{videoSummary}}}

Generate the notes based on this summary.
`,
});

const generateNotesFlow = ai.defineFlow(
  {
    name: 'generateNotesFlow',
    inputSchema: GenerateNotesInputSchema,
    outputSchema: GenerateNotesOutputSchema,
  },
  async input => {
    const {output} = await generateNotesPrompt(input);
    return output!;
  }
);
