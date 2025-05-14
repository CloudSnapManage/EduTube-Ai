
'use server';

/**
 * @fileOverview Defines a Genkit flow for generating an advanced quiz from text content.
 *
 * - generateAdvancedQuizFlow - A function that takes text content and returns a structured quiz.
 * - GenerateQuizInput - The input type for the generateAdvancedQuizFlow function.
 * - GenerateQuizOutput - The return type for the generateAdvancedQuizFlow function.
 * - QuizQuestion - Represents a single quiz question with various types.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuizQuestionSchema = z.object({
  type: z.enum(['multiple-choice', 'true-false', 'fill-in-the-blank']).describe('The type of the quiz question.'),
  questionText: z.string().describe('The text of the quiz question. For fill-in-the-blank, use "____" to indicate the blank.'),
  options: z.array(z.string()).optional().describe('An array of options for multiple-choice questions. Typically 3-4 options.'),
  correctAnswer: z.string().describe('The correct answer. For fill-in-the-blank, this is the word/phrase that fits the blank. For true/false, it is "True" or "False". For multiple-choice, it is the exact text of the correct option.'),
  explanation: z.string().optional().describe('A brief explanation for why the answer is correct, especially for true/false or complex multiple-choice questions.'),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

const GenerateQuizInputSchema = z.object({
  textContent: z.string().describe('The text content (e.g., video summary or detailed notes) to generate the quiz from.'),
  numberOfQuestions: z.number().int().min(3).max(10).optional().default(5).describe('The desired number of quiz questions.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  quizTitle: z.string().describe('A suitable title for the quiz, related to the content.'),
  questions: z.array(QuizQuestionSchema).describe('An array of quiz questions of various types.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateAdvancedQuizAction(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateAdvancedQuizFlow(input);
}

const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert quiz creator for students. Based on the provided text content, generate a quiz with a variety of question types: multiple-choice, true/false, and fill-in-the-blank.
The quiz should test understanding of the key concepts, facts, and ideas presented in the text.

Text Content:
{{{textContent}}}

Generate exactly {{{numberOfQuestions}}} questions.

For each question:
- Provide a clear 'questionText'.
- For 'multiple-choice' questions, provide 3-4 'options' and ensure one is the 'correctAnswer'.
- For 'fill-in-the-blank' questions, use "____" in the 'questionText' to indicate where the blank is. The 'correctAnswer' should be the word or phrase that fills the blank.
- For 'true-false' questions, the 'correctAnswer' should be either "True" or "False".
- Optionally, provide a brief 'explanation' for the correct answer, especially if the question is tricky or involves a nuanced concept.
- Ensure the 'quizTitle' is relevant to the provided text content.

Aim for a mix of question difficulties. Ensure questions are distinct and cover different aspects of the text.
`,
});

const generateAdvancedQuizFlow = ai.defineFlow(
  {
    name: 'generateAdvancedQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const {output} = await generateQuizPrompt(input);
    if (!output) {
        throw new Error('Failed to generate quiz from the provided content.');
    }
    // Ensure number of questions matches request, or handle if LLM provides different number
    if (output.questions.length !== (input.numberOfQuestions || 5) ) {
        console.warn(`LLM generated ${output.questions.length} questions, requested ${input.numberOfQuestions || 5}. Using what was generated.`);
    }
    // Basic validation on questions
    output.questions = output.questions.filter(q => {
        if (q.type === 'multiple-choice' && (!q.options || q.options.length < 2 || !q.options.includes(q.correctAnswer))) {
            console.warn("Invalid multiple-choice question:", q);
            return false;
        }
        if (q.type === 'true-false' && (q.correctAnswer !== "True" && q.correctAnswer !== "False")) {
            console.warn("Invalid true-false question:", q);
            return false;
        }
        return true;
    });

    return output;
  }
);

    