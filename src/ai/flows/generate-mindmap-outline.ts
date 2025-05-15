
'use server';

/**
 * @fileOverview Defines a Genkit flow for generating a textual mind map outline from a video summary and chapters.
 *
 * - generateMindMapOutline - A function that takes a video summary and optional chapters, returning a textual mind map.
 * - GenerateMindMapOutlineInput - The input type for the generateMindMapOutline function.
 * - GenerateMindMapOutlineOutput - The return type for the generateMindMapOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// ChapterSchema is no longer imported from './generate-chapters'
// We will define a local schema for validation if needed or rely on the type from generate-chapters for data structure.

// Local Chapter schema definition for input validation within this flow
const LocalChapterSchemaDefinition = z.object({
  title: z.string().describe('A concise and descriptive title for the chapter, ideally in the target language.'),
  startTimeSeconds: z.number().int().nonnegative().describe('The start time of the chapter in whole seconds from the beginning of the video.'),
});

const GenerateMindMapOutlineInputSchema = z.object({
  videoSummary: z.string().describe('A summary of the video content.'),
  chapters: z.array(LocalChapterSchemaDefinition).optional().describe('Optional list of chapters derived from the video, which can help structure the mind map.'),
  targetLanguage: z.string().optional().default("English").describe("The language for the mind map outline."),
});
export type GenerateMindMapOutlineInput = z.infer<typeof GenerateMindMapOutlineInputSchema>;

const GenerateMindMapOutlineOutputSchema = z.object({
  mindMapOutline: z.string().describe('A textual, hierarchical outline representing a mind map of the video content, formatted using Markdown (e.g., using hyphens and indentation for levels). The outline should be in the target language.'),
});
export type GenerateMindMapOutlineOutput = z.infer<typeof GenerateMindMapOutlineOutputSchema>;

export async function generateMindMapOutline(input: GenerateMindMapOutlineInput): Promise<GenerateMindMapOutlineOutput> {
  return generateMindMapOutlineFlow(input);
}

const generateMindMapOutlinePrompt = ai.definePrompt({
  name: 'generateMindMapOutlinePrompt',
  input: {schema: GenerateMindMapOutlineInputSchema},
  output: {schema: GenerateMindMapOutlineOutputSchema},
  prompt: `You are an expert at creating structured, hierarchical outlines that can represent a mind map.
Based on the following video summary{{#if chapters}} and chapter list{{/if}}, generate a textual mind map outline.
The outline must be in {{{targetLanguage}}}.
Use Markdown-style formatting for the hierarchy:
- Main Topic (Level 1)
  - Sub-topic (Level 2)
    - Detail or Sub-sub-topic (Level 3)
      - Further Detail (Level 4)
  - Another Sub-topic (Level 2)
- Another Main Topic (Level 1)

Focus on identifying the core concepts, their relationships, and supporting details. If chapters are provided, use them to help structure the main branches of your mind map.

Video Summary (this summary is already in {{{targetLanguage}}} or should be treated as such):
{{{videoSummary}}}

{{#if chapters}}
Video Chapters (titles are in {{{targetLanguage}}} or should be treated as such):
{{#each chapters}}
- {{this.title}} (starts at {{this.startTimeSeconds}}s)
{{/each}}
{{/if}}

Generate the mind map outline text in {{{targetLanguage}}}.
`,
});

const generateMindMapOutlineFlow = ai.defineFlow(
  {
    name: 'generateMindMapOutlineFlow',
    inputSchema: GenerateMindMapOutlineInputSchema,
    outputSchema: GenerateMindMapOutlineOutputSchema,
  },
  async (input) => {
    const {output} = await generateMindMapOutlinePrompt(input);
    if (!output) {
        throw new Error('Failed to generate mind map outline.');
    }
    return output;
  }
);

