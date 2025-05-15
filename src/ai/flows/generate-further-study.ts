
'use server';

/**
 * @fileOverview Defines a Genkit flow for generating "further study" prompts or questions based on a video summary.
 *
 * - generateFurtherStudyPrompts - A function that takes a video summary and returns a list of further study prompts.
 * - GenerateFurtherStudyInput - The input type for the generateFurtherStudyPrompts function.
 * - GenerateFurtherStudyOutput - The return type for the generateFurtherStudyPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFurtherStudyInputSchema = z.object({
  videoSummary: z.string().describe('A summary of the video content to generate further study prompts from.'),
  targetLanguage: z.string().optional().default("English").describe("The language for the further study prompts."),
});
export type GenerateFurtherStudyInput = z.infer<typeof GenerateFurtherStudyInputSchema>;

const GenerateFurtherStudyOutputSchema = z.object({
  furtherStudyPrompts: z.array(z.string()).describe('A list of 3-4 thought-provoking questions or research prompts related to the video topic, designed to encourage deeper exploration. These prompts should be in the target language.'),
});
export type GenerateFurtherStudyOutput = z.infer<typeof GenerateFurtherStudyOutputSchema>;

export async function generateFurtherStudyPrompts(input: GenerateFurtherStudyInput): Promise<GenerateFurtherStudyOutput> {
  return generateFurtherStudyPromptsFlow(input);
}

const generateFurtherStudyPromptsPrompt = ai.definePrompt({
  name: 'generateFurtherStudyPromptsPrompt',
  input: {schema: GenerateFurtherStudyInputSchema},
  output: {schema: GenerateFurtherStudyOutputSchema},
  prompt: `You are an expert educator skilled at stimulating critical thinking and further learning.
Based on the following video summary, generate 3-4 thought-provoking questions or research prompts. These prompts should encourage the user to explore the topic more deeply beyond the video itself.
The prompts must be in {{{targetLanguage}}}.

Video Summary (this summary is already in {{{targetLanguage}}} or should be treated as such for prompt generation):
{{{videoSummary}}}

Return these further study prompts as a list of strings in {{{targetLanguage}}}.
Focus on questions that spark curiosity, encourage critical analysis, or suggest avenues for additional research.
Example prompt (if topic was photosynthesis): "How might advancements in artificial photosynthesis impact global energy challenges?"
`,
});

const generateFurtherStudyPromptsFlow = ai.defineFlow(
  {
    name: 'generateFurtherStudyPromptsFlow',
    inputSchema: GenerateFurtherStudyInputSchema,
    outputSchema: GenerateFurtherStudyOutputSchema,
  },
  async (input) => {
    const {output} = await generateFurtherStudyPromptsPrompt(input);
     if (!output) {
        throw new Error('Failed to generate further study prompts from the summary.');
    }
    return output;
  }
);
