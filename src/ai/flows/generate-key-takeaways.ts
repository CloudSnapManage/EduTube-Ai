
'use server';

/**
 * @fileOverview Defines a Genkit flow for generating key takeaways from a video summary.
 *
 * - generateKeyTakeaways - A function that takes a video summary and returns a list of key takeaways.
 * - GenerateKeyTakeawaysInput - The input type for the generateKeyTakeaways function.
 * - GenerateKeyTakeawaysOutput - The return type for the generateKeyTakeaways function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateKeyTakeawaysInputSchema = z.object({
  videoSummary: z.string().describe('A summary of the video content to extract key takeaways from.'),
  targetLanguage: z.string().optional().default("English").describe("The language for the key takeaways."),
});
export type GenerateKeyTakeawaysInput = z.infer<typeof GenerateKeyTakeawaysInputSchema>;

const GenerateKeyTakeawaysOutputSchema = z.object({
  keyTakeaways: z.array(z.string()).describe('A list of 3-5 concise key takeaways or critical bullet points from the video summary, in the target language.'),
});
export type GenerateKeyTakeawaysOutput = z.infer<typeof GenerateKeyTakeawaysOutputSchema>;

export async function generateKeyTakeaways(input: GenerateKeyTakeawaysInput): Promise<GenerateKeyTakeawaysOutput> {
  return generateKeyTakeawaysFlow(input);
}

const generateKeyTakeawaysPrompt = ai.definePrompt({
  name: 'generateKeyTakeawaysPrompt',
  input: {schema: GenerateKeyTakeawaysInputSchema},
  output: {schema: GenerateKeyTakeawaysOutputSchema},
  prompt: `You are an expert at identifying the most crucial points in a text.
Based on the following video summary, extract 3-5 concise key takeaways. These should be the absolute most important points or critical messages.
The key takeaways must be in {{{targetLanguage}}}.

Video Summary (this summary is already in {{{targetLanguage}}} or should be treated as such for takeaway extraction):
{{{videoSummary}}}

Return these takeaways as a list of strings in {{{targetLanguage}}}.
`,
});

const generateKeyTakeawaysFlow = ai.defineFlow(
  {
    name: 'generateKeyTakeawaysFlow',
    inputSchema: GenerateKeyTakeawaysInputSchema,
    outputSchema: GenerateKeyTakeawaysOutputSchema,
  },
  async (input) => {
    const {output} = await generateKeyTakeawaysPrompt(input);
    if (!output) {
        throw new Error('Failed to generate key takeaways from the summary.');
    }
    return output;
  }
);
