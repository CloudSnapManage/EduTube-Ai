
"use server";

import type { TranscriptResponse } from "youtube-transcript";
import { getYouTubeTranscript } from "@/services/youtube";

import { summarizeYouTubeVideo, type SummarizeYouTubeVideoInput, type SummarizeYouTubeVideoOutput, type SummaryStyle } from "@/ai/flows/summarize-youtube-video";
import { generateFlashcards, type GenerateFlashcardsInput, type GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { generateNotes, type GenerateNotesInput, type GenerateNotesOutput } from "@/ai/flows/generate-notes";
import { answerUserQuestion, type AnswerUserQuestionInput, type AnswerUserQuestionOutput } from "@/ai/flows/answer-question-flow";
import { generateChapters, type GenerateChaptersInput, type GenerateChaptersOutput, type Chapter } from "@/ai/flows/generate-chapters";
import { generateAdvancedQuizAction, type GenerateQuizInput, type GenerateQuizOutput } from "@/ai/flows/generate-quiz";
import { generateKeyTakeaways, type GenerateKeyTakeawaysInput, type GenerateKeyTakeawaysOutput } from "@/ai/flows/generate-key-takeaways";
import { generateFurtherStudyPrompts, type GenerateFurtherStudyInput, type GenerateFurtherStudyOutput } from "@/ai/flows/generate-further-study";
import { generateExam, type GenerateExamInput, type GenerateExamOutput } from "@/ai/flows/generate-exam";


export interface ProcessedVideoData {
  videoUrl: string;
  summary: string | null;
  flashcards: GenerateFlashcardsOutput['flashcards'] | null;
  notes: string | null;
  chapters: Chapter[] | null;
  keyTakeaways: string[] | null;
  furtherStudyPrompts: string[] | null;
  error?: string | null; 
}

export async function processVideoUrl(
  videoUrl: string, 
  summaryStyle: SummaryStyle, 
  targetLanguage: string
): Promise<ProcessedVideoData> {
  let summary: string | null = null;
  let flashcards: GenerateFlashcardsOutput['flashcards'] | null = null;
  let notes: string | null = null;
  let chapters: Chapter[] | null = null;
  let keyTakeaways: string[] | null = null;
  let furtherStudyPrompts: string[] | null = null;
  let rawTranscriptResult: TranscriptResponse[] | null = null; 
  let accumulatedError: string | null = null;

  const commonInput = { targetLanguage };

  try {
    rawTranscriptResult = await getYouTubeTranscript(videoUrl);

    if (!rawTranscriptResult || rawTranscriptResult.length === 0) {
      return { videoUrl, summary, flashcards, notes, chapters, keyTakeaways, furtherStudyPrompts, error: "Could not retrieve transcript for the video. It might be unavailable or have transcripts disabled." };
    }

    try {
      const textForSummary = rawTranscriptResult.map(t => t.text).join(' ');
      const summaryInput: SummarizeYouTubeVideoInput = { videoTranscript: textForSummary, summaryStyle, ...commonInput };
      const summaryResult: SummarizeYouTubeVideoOutput = await summarizeYouTubeVideo(summaryInput);
      summary = summaryResult.summary;
    } catch (e: any) {
      console.error("Error generating summary:", e);
      accumulatedError = (accumulatedError ? accumulatedError + " " : "") + `Failed to generate summary (Lang: ${targetLanguage}, Style: ${summaryStyle}).`;
    }

    if (summary) {
      // These run in parallel once summary is available
      const results = await Promise.allSettled([
        generateFlashcards({ videoSummary: summary, ...commonInput }),
        generateNotes({ videoSummary: summary, ...commonInput }),
        generateKeyTakeaways({ videoSummary: summary, ...commonInput }),
        generateFurtherStudyPrompts({ videoSummary: summary, ...commonInput }),
      ]);

      if (results[0].status === 'fulfilled') flashcards = (results[0].value as GenerateFlashcardsOutput).flashcards;
      else { console.error("Error generating flashcards:", results[0].reason); accumulatedError = (accumulatedError ? accumulatedError + " " : "") + "Failed to generate flashcards."; }
      
      if (results[1].status === 'fulfilled') notes = (results[1].value as GenerateNotesOutput).notes;
      else { console.error("Error generating notes:", results[1].reason); accumulatedError = (accumulatedError ? accumulatedError + " " : "") + "Failed to generate notes."; }

      if (results[2].status === 'fulfilled') keyTakeaways = (results[2].value as GenerateKeyTakeawaysOutput).keyTakeaways;
      else { console.error("Error generating key takeaways:", results[2].reason); accumulatedError = (accumulatedError ? accumulatedError + " " : "") + "Failed to generate key takeaways."; }

      if (results[3].status === 'fulfilled') furtherStudyPrompts = (results[3].value as GenerateFurtherStudyOutput).furtherStudyPrompts;
      else { console.error("Error generating further study prompts:", results[3].reason); accumulatedError = (accumulatedError ? accumulatedError + " " : "") + "Failed to generate further study prompts."; }
      

    } else {
        if (!accumulatedError) accumulatedError = "Summary generation failed, skipping dependent AI features.";
        else accumulatedError += " Summary generation failed, skipping dependent AI features.";
    }
    
    try {
      const segmentsForChapters = rawTranscriptResult.map(t => ({ text: t.text, offset: t.offset }));
      const chaptersInput: GenerateChaptersInput = { transcriptSegments: segmentsForChapters, targetLanguage };
      const chaptersResult: GenerateChaptersOutput = await generateChapters(chaptersInput);
      chapters = chaptersResult.chapters;

    } catch (e: any) {
      console.error("Error generating chapters:", e);
      accumulatedError = (accumulatedError ? accumulatedError + " " : "") + "Failed to generate chapters.";
    }

    return { videoUrl, summary, flashcards, notes, chapters, keyTakeaways, furtherStudyPrompts, error: accumulatedError };

  } catch (error: any) {
    console.error("Error processing video URL:", error);
    return { videoUrl, summary, flashcards, notes, chapters, keyTakeaways, furtherStudyPrompts, error: error.message || "An unexpected error occurred during video processing." };
  }
}


export async function createFlashcardsFromSummary(summary: string, targetLanguage: string): Promise<{ flashcards: GenerateFlashcardsOutput['flashcards'] | null, error?: string }> {
  try {
    const input: GenerateFlashcardsInput = { videoSummary: summary, targetLanguage };
    const result: GenerateFlashcardsOutput = await generateFlashcards(input);
    return { flashcards: result.flashcards };
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return { flashcards: null, error: "Failed to generate flashcards from the summary." };
  }
}


export async function askQuestionAboutSummary(
  videoSummary: string,
  userQuestion: string,
  targetLanguage: string,
  conversationHistory?: AnswerUserQuestionInput['conversationHistory']
): Promise<{ answer: string | null, error?: string }> {
  try {
    const input: AnswerUserQuestionInput = { videoSummary, userQuestion, targetLanguage, conversationHistory };
    const result: AnswerUserQuestionOutput = await answerUserQuestion(input);
    return { answer: result.answer };
  } catch (error) {
    console.error("Error answering question:", error);
    return { answer: null, error: "Failed to get an answer for your question." };
  }
}

export async function generateAdvancedQuiz(
  textContent: string,
  targetLanguage: string,
  numberOfQuestions: number = 5
): Promise<{ quiz: GenerateQuizOutput | null, error?: string }> {
  try {
    const input: GenerateQuizInput = { textContent, targetLanguage, numberOfQuestions };
    const result: GenerateQuizOutput = await generateAdvancedQuizAction(input);
    return { quiz: result };
  } catch (error: any) {
    console.error("Error generating advanced quiz:", error);
    return { quiz: null, error: "Failed to generate the advanced quiz: " + error.message };
  }
}

export async function generateExamAction(
  textContent: string,
  targetLanguage: string,
  totalMarks: number 
): Promise<{ exam: GenerateExamOutput | null, error?: string }> {
  try {
    const input: GenerateExamInput = { textContent, targetLanguage, totalMarks };
    const result: GenerateExamOutput = await generateExam(input);
    return { exam: result };
  } catch (error: any) {
    console.error("Error generating exam:", error);
    return { exam: null, error: "Failed to generate the exam: " + error.message };
  }
}
    
