
'use server';

/**
 * @fileOverview Defines a Genkit flow for generating a graphical mind map outline using Mermaid syntax from a video summary and chapters.
 *
 * - generateMindMapOutline - A function that takes a video summary and optional chapters, returning Mermaid syntax for a mind map.
 * - GenerateMindMapOutlineInput - The input type for the generateMindMapOutline function.
 * - GenerateMindMapOutlineOutput - The return type for the generateMindMapOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LocalChapterSchemaDefinition = z.object({
  title: z.string().describe('A concise and descriptive title for the chapter, ideally in the target language.'),
  startTimeSeconds: z.number().int().nonnegative().describe('The start time of the chapter in whole seconds from the beginning of the video.'),
});

const GenerateMindMapOutlineInputSchema = z.object({
  videoSummary: z.string().describe('A summary of the video content.'),
  chapters: z.array(LocalChapterSchemaDefinition).optional().describe('Optional list of chapters derived from the video, which can help structure the mind map.'),
  targetLanguage: z.string().optional().default("English").describe("The language for the mind map content."),
});
export type GenerateMindMapOutlineInput = z.infer<typeof GenerateMindMapOutlineInputSchema>;

const GenerateMindMapOutlineOutputSchema = z.object({
  mindMapMermaidSyntax: z.string().describe('A mind map of the video content, formatted using Mermaid.js mindmap syntax. The mind map content should be in the target language.'),
});
export type GenerateMindMapOutlineOutput = z.infer<typeof GenerateMindMapOutlineOutputSchema>;

export async function generateMindMapOutline(input: GenerateMindMapOutlineInput): Promise<GenerateMindMapOutlineOutput> {
  return generateMindMapOutlineFlow(input);
}

const generateMindMapOutlinePrompt = ai.definePrompt({
  name: 'generateMindMapOutlinePrompt',
  input: {schema: GenerateMindMapOutlineInputSchema},
  output: {schema: GenerateMindMapOutlineOutputSchema},
  prompt: `You are an expert at creating structured mind maps using Mermaid.js syntax.
Based on the following video summary{{#if chapters}} and chapter list{{/if}}, generate a mind map in Mermaid syntax.
The content of the mind map (node labels) must be in {{{targetLanguage}}}.

Use the following Mermaid mindmap syntax structure:
\`\`\`mermaid
mindmap
  root((Main Video Topic - in {{{targetLanguage}}}))
    (Chapter 1 Title or Main Idea 1 - in {{{targetLanguage}}})
      (Sub-topic 1.1 - in {{{targetLanguage}}})
      (Sub-topic 1.2 - in {{{targetLanguage}}})
        (Detail 1.2.1 - in {{{targetLanguage}}})
    (Chapter 2 Title or Main Idea 2 - in {{{targetLanguage}}})
      (Sub-topic 2.1 - in {{{targetLanguage}}})
\`\`\`
Ensure the root node clearly states the main topic of the video.
If chapters are provided, use them to help structure the main branches of your mind map. If not, derive main branches from the summary.
Keep node labels concise yet descriptive. Aim for 3-5 levels of depth where appropriate.

Video Summary (this summary is already in {{{targetLanguage}}} or should be treated as such):
{{{videoSummary}}}

{{#if chapters}}
Video Chapters (titles are in {{{targetLanguage}}} or should be treated as such):
{{#each chapters}}
- {{this.title}} (starts at {{this.startTimeSeconds}}s)
{{/each}}
{{/if}}

Generate only the Mermaid mindmap syntax string for the 'mindMapMermaidSyntax' field. Do not include any other text or explanations outside the Mermaid syntax block.
Ensure the output starts with \`mindmap\` and correctly follows Mermaid mindmap syntax.
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
    if (!output || !output.mindMapMermaidSyntax || !output.mindMapMermaidSyntax.trim().startsWith("mindmap")) {
        throw new Error('Failed to generate valid Mermaid mind map syntax.');
    }
    // Basic cleanup: ensure it doesn't include the markdown ```mermaid block
    let syntax = output.mindMapMermaidSyntax;
    if (syntax.startsWith("```mermaid")) {
        syntax = syntax.substring("```mermaid".length);
    }
    if (syntax.endsWith("```")) {
        syntax = syntax.substring(0, syntax.length - "```".length);
    }
    
    return { mindMapMermaidSyntax: syntax.trim() };
  }
);
