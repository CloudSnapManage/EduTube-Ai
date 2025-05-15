
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
  children: z.array(z.lazy(() => MindMapNodeSchema)).optional().describe('Optional child nodes, forming a recursive tree structure. Omit this field or use an empty array [] if a node has no children.'),
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
  mindMapData: MindMapNodeSchema.nullable().describe('A hierarchical JSON structure representing the mind map. The content should be in the target language. Null if generation fails or AI determines no map can be made.'),
});
export type GenerateMindMapOutlineOutput = z.infer<typeof GenerateMindMapOutlineOutputSchema>;

export async function generateMindMapOutline(input: GenerateMindMapOutlineInput): Promise<GenerateMindMapOutlineOutput> {
  return generateMindMapOutlineFlow(input);
}

const generateMindMapOutlinePrompt = ai.definePrompt({
  name: 'generateMindMapOutlinePrompt',
  input: {schema: GenerateMindMapOutlineInputSchema},
  output: {schema: GenerateMindMapOutlineOutputSchema},
  prompt: `You are an expert at creating structured hierarchical JSON outlines for mind maps from video content.
Based on the following video summary{{#if chapters}} and chapter list{{/if}}, generate a JSON object representing a tree structure for a mind map.
The content of the mind map (node names) must be in {{{targetLanguage}}}.

The root of the JSON object should be a single node representing the main video topic.
The JSON structure for each node is:
{
  "name": "Node Name (in {{{targetLanguage}}})",
  "children": [ /* array of child node objects. Omit this field or use an empty array [] if a node has no children. */ ]
}

Example JSON Output (ensure this is the structure for the 'mindMapData' field):
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


Ensure the root node (which will be the value of the 'mindMapData' field in the output object) clearly states the main topic of the video.
If chapters are provided, use their titles to help structure the main branches (first-level children of the root node). If not, derive main branches from the summary.
Keep node names concise yet descriptive. Aim for 2-4 levels of depth where appropriate.
The output must be a single, valid JSON object where the 'mindMapData' field contains the root node of the mind map tree.
If you cannot generate a meaningful mind map from the provided content, the value for 'mindMapData' should be null.

Video Summary (this summary is already in {{{targetLanguage}}} or should be treated as such):
{{{videoSummary}}}

{{#if chapters}}
Video Chapters (titles are in {{{targetLanguage}}} or should be treated as such):
{{#each chapters}}
- {{this.title}} (starts at {{this.startTimeSeconds}}s)
{{/each}}
{{/if}}

Generate *only* the JSON object structure defined by GenerateMindMapOutlineOutputSchema. Do NOT wrap the JSON in markdown code fences like \`\`\`json ... \`\`\`.
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

    // Check if the output is structured as expected and if mindMapData field is present
    if (!output || typeof output.mindMapData === 'undefined') {
      // Fallback for trying to parse if output was a string (less likely with structured output, but a safeguard)
      if (output && typeof (output as any) === 'string') {
        try {
          const parsedJson = JSON.parse(output as any);
          if (parsedJson.mindMapData !== undefined) { // Check if mindMapData field exists after parsing
             // If mindMapData is explicitly null, it's a valid decision by AI
            if (parsedJson.mindMapData === null) {
                console.log("AI returned null for mindMapData after string parsing, indicating no mind map could be generated.");
                return { mindMapData: null };
            }
            // Try to validate the parsed mindMapData
            const validationResultFromString = MindMapNodeSchema.safeParse(parsedJson.mindMapData);
            if (validationResultFromString.success) {
                return { mindMapData: validationResultFromString.data };
            } else {
                 console.error(
                    'Parsed string mindMapData does not match schema. Issues:',
                    validationResultFromString.error.issues,
                    'Parsed Data:',
                    JSON.stringify(parsedJson.mindMapData, null, 2)
                );
            }
          }
        } catch (e) {
          console.error(
            'Failed to parse AI output string as JSON for mind map. String received:',
            output,
            'Error:', e
          );
        }
      }
      console.error(
        'AI output is not in the expected structured format or mindMapData field is missing. Output received:',
        JSON.stringify(output, null, 2)
      );
      return {mindMapData: null};
    }

    // If output.mindMapData is explicitly null, the AI decided not to generate a map.
    if (output.mindMapData === null) {
        console.log("AI returned null for mindMapData directly, indicating no mind map could be generated.");
        return { mindMapData: null };
    }

    // Validate the structure of mindMapData (which should be an object here)
    const validationResult = MindMapNodeSchema.safeParse(output.mindMapData);
    if (!validationResult.success) {
      console.error(
        'Generated mindMapData does not match schema. Issues:',
        validationResult.error.issues,
        'Data received for mindMapData field:',
        JSON.stringify(output.mindMapData, null, 2)
      );
      return {mindMapData: null};
    }

    return { mindMapData: validationResult.data };
  }
);

