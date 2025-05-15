
'use server';

/**
 * @fileOverview Defines a Genkit flow for generating a hierarchical JSON outline for a mind map from video content.
 *
 * - generateMindMapOutline - A function that takes video summary/chapters and returns a JSON tree.
 * - GenerateMindMapOutlineInput - The input type for the generateMindMapOutline function.
 * - GenerateMindMapOutlineOutput - The return type for the generateMindMapOutline function.
 * - MindMapNode - Represents a node in the mind map JSON tree.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the recursive schema for a mind map node
const MindMapNodeSchema = z.object({
  name: z.string().describe('The name or label of this node in the mind map (in the target language).'),
  children: z.array(z.lazy(() => MindMapNodeSchema)).optional().describe('Optional child nodes, forming a recursive tree structure.'),
});
export type MindMapNode = z.infer<typeof MindMapNodeSchema>;

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

// Output schema now directly uses the MindMapNode for the root of the tree
const GenerateMindMapOutlineOutputSchema = z.object({
  mindMapData: MindMapNodeSchema.nullable().describe('A hierarchical JSON structure representing the mind map. The content should be in the target language. Null if generation fails.'),
});
export type GenerateMindMapOutlineOutput = z.infer<typeof GenerateMindMapOutlineOutputSchema>;

export async function generateMindMapOutline(input: GenerateMindMapOutlineInput): Promise<GenerateMindMapOutlineOutput> {
  return generateMindMapOutlineFlow(input);
}

const generateMindMapOutlinePrompt = ai.definePrompt({
  name: 'generateMindMapOutlinePrompt',
  input: {schema: GenerateMindMapOutlineInputSchema},
  output: {schema: GenerateMindMapOutlineOutputSchema}, // This now expects the full JSON structure
  prompt: `You are an expert at creating structured hierarchical JSON outlines for mind maps from video content.
Based on the following video summary{{#if chapters}} and chapter list{{/if}}, generate a JSON object representing a tree structure for a mind map.
The content of the mind map (node names) must be in {{{targetLanguage}}}.

The root of the JSON object should be a single node representing the main video topic.
The JSON structure for each node is:
{
  "name": "Node Name (in {{{targetLanguage}}})",
  "children": [ /* array of child node objects, or omitted if no children */ ]
}

Example JSON Output:
{
  "mindMapData": {
    "name": "Main Video Topic - in {{{targetLanguage}}}",
    "children": [
      {
        "name": "Chapter 1 Title or Main Idea 1 - in {{{targetLanguage}}}",
        "children": [
          { "name": "Sub-topic 1.1 - in {{{targetLanguage}}}" },
          {
            "name": "Sub-topic 1.2 - in {{{targetLanguage}}}",
            "children": [
              { "name": "Detail 1.2.1 - in {{{targetLanguage}}}" }
            ]
          }
        ]
      },
      {
        "name": "Chapter 2 Title or Main Idea 2 - in {{{targetLanguage}}}",
        "children": [
          { "name": "Sub-topic 2.1 - in {{{targetLanguage}}}" }
        ]
      }
    ]
  }
}


Ensure the root node ('mindMapData' field in the output object) clearly states the main topic of the video.
If chapters are provided, use their titles to help structure the main branches (first-level children of the root node). If not, derive main branches from the summary.
Keep node names concise yet descriptive. Aim for 2-4 levels of depth where appropriate.
The output must be a single, valid JSON object where the 'mindMapData' field contains the root node of the mind map tree.

Video Summary (this summary is already in {{{targetLanguage}}} or should be treated as such):
{{{videoSummary}}}

{{#if chapters}}
Video Chapters (titles are in {{{targetLanguage}}} or should be treated as such):
{{#each chapters}}
- {{this.title}} (starts at {{this.startTimeSeconds}}s)
{{/each}}
{{/if}}

Generate *only* the JSON object structure defined by GenerateMindMapOutlineOutputSchema.
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

    if (!output || !output.mindMapData) {
      // Attempt to parse if output might be a stringified JSON (less likely now with structured output but good fallback)
      if (output && typeof (output as any) === 'string') {
        try {
          const parsedJson = JSON.parse(output as any);
          // Check if the parsed JSON has the mindMapData field and if it's a valid node
          if (parsedJson.mindMapData && MindMapNodeSchema.safeParse(parsedJson.mindMapData).success) {
            return { mindMapData: parsedJson.mindMapData };
          }
        } catch (e) {
          console.error("Failed to parse AI output as JSON for mind map or missing mindMapData field:", e);
        }
      }
      console.error("Failed to generate valid mind map JSON data from AI. Output received:", output);
      // Return null on failure or if validation fails, as per schema.
      return { mindMapData: null };
    }
    
    // Validate the structure of mindMapData
    const validationResult = MindMapNodeSchema.safeParse(output.mindMapData);
    if (!validationResult.success) {
        console.error("Generated mindMapData does not match schema:", validationResult.error.issues);
        return { mindMapData: null };
    }

    return { mindMapData: validationResult.data };
  }
);
