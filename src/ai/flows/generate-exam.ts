
'use server';

/**
 * @fileOverview Defines a Genkit flow for generating an exam with questions and model answers from text content.
 *
 * - generateExam - A function that takes text content, conceptual total marks, and language, returning a structured exam.
 * - GenerateExamInput - The input type for the generateExam function.
 * - GenerateExamOutput - The return type for the generateExam function.
 * - ExamQuestion - Represents a single exam question with its model answer.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExamQuestionSchema = z.object({
  questionText: z.string().describe('The text of the exam question. Should be open-ended and require a descriptive answer.'),
  modelAnswer: z.string().describe('A detailed model answer for the question, providing a comprehensive and correct response.'),
});
export type ExamQuestion = z.infer<typeof ExamQuestionSchema>;

const GenerateExamInputSchema = z.object({
  textContent: z.string().describe('The text content (e.g., video summary or detailed notes) to generate the exam from.'),
  totalMarks: z.number().int().min(10).max(100).optional().default(50).describe('The conceptual total marks for the exam. This helps guide the AI on the scope and depth of questions. Typically 5-7 questions will be generated.'),
  targetLanguage: z.string().optional().default("English").describe("The language for the exam questions and answers."),
});
export type GenerateExamInput = z.infer<typeof GenerateExamInputSchema>;

const GenerateExamOutputSchema = z.object({
  examTitle: z.string().describe('A suitable title for the exam, related to the content and in the target language.'),
  questions: z.array(ExamQuestionSchema).describe('An array of 5-7 exam questions, each with a question and a model answer, in the target language.'),
});
export type GenerateExamOutput = z.infer<typeof GenerateExamOutputSchema>;

export async function generateExam(input: GenerateExamInput): Promise<GenerateExamOutput> {
  return generateExamFlow(input);
}

const generateExamPrompt = ai.definePrompt({
  name: 'generateExamPrompt',
  input: {schema: GenerateExamInputSchema},
  output: {schema: GenerateExamOutputSchema},
  prompt: `You are an expert educator tasked with creating an exam.
Based on the provided text content, generate a challenging and comprehensive exam.
The exam (title, questions, model answers) should be entirely in {{{targetLanguage}}}.
The user has indicated this exam would notionally be for {{{totalMarks}}} marks. Generate 5-7 diverse, open-ended questions that cover the key concepts, arguments, and details from the text. The questions should require descriptive answers, not just single-word or multiple-choice responses.
For each question, provide a detailed and accurate model answer.

Text Content (this content is already in {{{targetLanguage}}} or should be treated as such for exam generation):
{{{textContent}}}

Return:
- A relevant 'examTitle' for the exam in {{{targetLanguage}}}.
- An array of 5-7 'questions', where each question object contains:
    - 'questionText': The open-ended exam question.
    - 'modelAnswer': A comprehensive model answer for that question.

Ensure the questions encourage critical thinking and in-depth understanding of the material.
`,
});

const generateExamFlow = ai.defineFlow(
  {
    name: 'generateExamFlow',
    inputSchema: GenerateExamInputSchema,
    outputSchema: GenerateExamOutputSchema,
  },
  async (input) => {
    const {output} = await generateExamPrompt(input);
    if (!output || !output.questions || output.questions.length === 0) {
        throw new Error('Failed to generate exam questions from the provided content.');
    }
    // Ensure questions are not empty (basic validation)
    output.questions = output.questions.filter(q => q.questionText.trim() !== "" && q.modelAnswer.trim() !== "");
    if (output.questions.length === 0) {
         throw new Error('Generated exam questions were empty or invalid.');
    }
    return output;
  }
);
