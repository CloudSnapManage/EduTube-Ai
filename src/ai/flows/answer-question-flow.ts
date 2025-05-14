
'use server';

/**
 * @fileOverview Defines a Genkit flow for answering user questions based on a video summary and conversation history.
 *
 * - answerUserQuestion - A function that takes a video summary, a user's question, and optional conversation history, returning a detailed answer.
 * - AnswerUserQuestionInput - The input type for the answerUserQuestion function.
 * - AnswerUserQuestionOutput - The return type for the answerUserQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConversationTurnSchema = z.object({
  question: z.string().describe("A previous question from the user in this conversation."),
  answer: z.string().describe("The AI's answer to that previous question."),
});

const AnswerUserQuestionInputSchema = z.object({
  videoSummary: z
    .string()
    .describe('The summary of the video content to provide context for answering the question.'),
  userQuestion: z
    .string()
    .describe('The specific current question asked by the user about the video summary.'),
  conversationHistory: z.array(ConversationTurnSchema).optional().describe('An optional history of the current conversation to provide context for follow-up questions.'),
});
export type AnswerUserQuestionInput = z.infer<typeof AnswerUserQuestionInputSchema>;

const AnswerUserQuestionOutputSchema = z.object({
  answer: z.string().describe('A detailed, comprehensive, and well-explained answer to the user_s question, derived strictly from the provided video summary and conversation history. The answer should elaborate on concepts, provide thorough explanations of main ideas, and be presented in easy-to-understand language.'),
});
export type AnswerUserQuestionOutput = z.infer<typeof AnswerUserQuestionOutputSchema>;

export async function answerUserQuestion(input: AnswerUserQuestionInput): Promise<AnswerUserQuestionOutput> {
  return answerUserQuestionFlow(input);
}

const answerUserQuestionPrompt = ai.definePrompt({
  name: 'answerUserQuestionPrompt',
  input: {schema: AnswerUserQuestionInputSchema},
  output: {schema: AnswerUserQuestionOutputSchema},
  prompt: `You are an expert educational assistant. Your primary task is to answer the user's current question based *solely* on the provided video summary and the existing conversation history.
Do not use any external knowledge or make assumptions beyond what is stated in the summary.

If a conversation history is provided, use it to understand the context of the current question and ensure your answer is relevant and builds upon the previous interaction. If the current question is a follow-up, address it as such.

When answering, ensure your response is:
- **Detailed and Comprehensive**: Elaborate on concepts and provide thorough explanations of the main ideas and arguments present in the summary related to the question.
- **Easy to Understand**: Use simple language and clear sentence structures.
- **Well-Structured**: Organize your answer logically, using paragraphs, bullet points, or numbered lists if appropriate to enhance clarity.
- **Focused**: Directly address the user's question using only the information available in the video summary and conversation history. If the information is not available, state that clearly.

Video Summary:
{{{videoSummary}}}

{{#if conversationHistory}}
Conversation History:
{{#each conversationHistory}}
User: {{{this.question}}}
AI: {{{this.answer}}}
---
{{/each}}
{{/if}}

Current User's Question:
{{{userQuestion}}}

Provide a detailed and well-explained answer to the user's current question using only the information from the video summary and the conversation history provided.
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
