
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating flashcards from a video summary.
 *
 * - generateFlashcards - A function that takes a video summary as input and returns a set of flashcards.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  videoSummary: z
    .string()
    .describe('A summary of the video content to generate flashcards from.'),
  targetLanguage: z.string().optional().default("English").describe("The language for the flashcards."),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string().describe('The question on the flashcard.'),
      answer: z.string().describe('The answer to the question on the flashcard.'),
    })
  ).describe('A list of flashcards generated from the video summary, in the specified language.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const generateFlashcardsPrompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an expert educator. Generate a *fresh and distinct* set of flashcards from the following video summary.
The flashcards (both questions and answers) should be in {{{targetLanguage}}}.

Video Summary (this summary is already in {{{targetLanguage}}} or should be treated as such for flashcard generation):
{{{videoSummary}}}

Each flashcard should have a question and an answer. The questions should be designed to test the user's understanding of the material. Aim for variety if previous sets have been generated.
Produce the questions and answers in {{{targetLanguage}}}.
`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await generateFlashcardsPrompt(input);
    return output!;
  }
);

