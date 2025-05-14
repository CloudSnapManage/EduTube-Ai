
'use server';

/**
 * @fileOverview Defines a Genkit flow for answering user questions based on a video summary.
 *
 * - answerUserQuestion - A function that takes a video summary and a user's question, returning a detailed answer.
 * - AnswerUserQuestionInput - The input type for the answerUserQuestion function.
 * - AnswerUserQuestionOutput - The return type for the answerUserQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerUserQuestionInputSchema = z.object({
  videoSummary: z
    .string()
    .describe('The summary of the video content to provide context for answering the question.'),
  userQuestion: z
    .string()
    .describe('The specific question asked by the user about the video summary.'),
});
export type AnswerUserQuestionInput = z.infer<typeof AnswerUserQuestionInputSchema>;

const AnswerUserQuestionOutputSchema = z.object({
  answer: z.string().describe('A detailed, comprehensive, and well-explained answer to the user_s question, derived strictly from the provided video summary. The answer should elaborate on concepts, provide thorough explanations of main ideas, and be presented in easy-to-understand language.'),
});
export type AnswerUserQuestionOutput = z.infer<typeof AnswerUserQuestionOutputSchema>;

export async function answerUserQuestion(input: AnswerUserQuestionInput): Promise<AnswerUserQuestionOutput> {
  return answerUserQuestionFlow(input);
}

const answerUserQuestionPrompt = ai.definePrompt({
  name: 'answerUserQuestionPrompt',
  input: {schema: AnswerUserQuestionInputSchema},
  output: {schema: AnswerUserQuestionOutputSchema},
  prompt: `You are an expert educational assistant. Your primary task is to answer the user's question based *solely* on the provided video summary.
Do not use any external knowledge or make assumptions beyond what is stated in the summary.

When answering, ensure your response is:
- **Detailed and Comprehensive**: Elaborate on concepts and provide thorough explanations of the main ideas and arguments present in the summary related to the question.
- **Easy to Understand**: Use simple language and clear sentence structures.
- **Well-Structured**: Organize your answer logically, using paragraphs, bullet points, or numbered lists if appropriate to enhance clarity.
- **Focused**: Directly address the user's question using only the information available in the video summary. If the summary does not contain information to answer a specific part of the question, state that clearly.

Video Summary:
{{{videoSummary}}}

User's Question:
{{{userQuestion}}}

Provide a detailed and well-explained answer to the user's question using only the information from the video summary.
`,
});

const answerUserQuestionFlow = ai.defineFlow(
  {
    name: 'answerUserQuestionFlow',
    inputSchema: AnswerUserQuestionInputSchema,
    outputSchema: AnswerUserQuestionOutputSchema,
  },
  async input => {
    const {output} = await answerUserQuestionPrompt(input);
    return output!;
  }
);
