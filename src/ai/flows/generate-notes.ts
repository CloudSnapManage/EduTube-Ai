
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating detailed revision notes from a video summary.
 *
 * - generateNotes - A function that takes a video summary as input and returns detailed, structured notes.
 * - GenerateNotesInput - The input type for the generateNotes function.
 * - GenerateNotesOutput - The return type for the generateNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNotesInputSchema = z.object({
  videoSummary: z
    .string()
    .describe('A summary of the video content to generate notes from.'),
  targetLanguage: z.string().optional().default("English").describe("The language in which the notes should be generated."),
});
export type GenerateNotesInput = z.infer<typeof GenerateNotesInputSchema>;

const GenerateNotesOutputSchema = z.object({
  notes: z.string().describe('Detailed, comprehensive, and well-explained notes derived from the video summary, suitable for in-depth study, in the specified language. The notes should elaborate on key concepts, provide examples if applicable from the summary, and offer thorough explanations of the main ideas and arguments presented.'),
});
export type GenerateNotesOutput = z.infer<typeof GenerateNotesOutputSchema>;

export async function generateNotes(input: GenerateNotesInput): Promise<GenerateNotesOutput> {
  return generateNotesFlow(input);
}

const generateNotesPrompt = ai.definePrompt({
  name: 'generateNotesPrompt',
  input: {schema: GenerateNotesInputSchema},
  output: {schema: GenerateNotesOutputSchema},
  prompt: `You are an expert academic assistant. Your task is to transform the following video summary into detailed, comprehensive, and well-explained notes suitable for in-depth study.
The notes should be generated in {{{targetLanguage}}}.

Focus on:
- Elaborating on key concepts and definitions with clear explanations.
- Providing thorough coverage of important takeaways and main ideas.
- Expanding on core arguments or steps, offering context and detailed descriptions if available in the summary.
- Structuring the notes logically for easy understanding and retention.

Use paragraphs, bullet points, or numbered lists where appropriate to present the information clearly. The notes should be significantly more detailed than a brief summary.

Video Summary (this summary is already in {{{targetLanguage}}} or should be treated as such for note generation):
{{{videoSummary}}}

Generate the detailed notes in {{{targetLanguage}}} based on this summary.
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

