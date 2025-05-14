
"use server";

import type { TranscriptResponse } from "youtube-transcript";
import { getYouTubeTranscript } from "@/services/youtube";

import { summarizeYouTubeVideo, type SummarizeYouTubeVideoInput, type SummarizeYouTubeVideoOutput } from "@/ai/flows/summarize-youtube-video";
import { generateFlashcards, type GenerateFlashcardsInput, type GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { generateNotes, type GenerateNotesInput, type GenerateNotesOutput } from "@/ai/flows/generate-notes";
import { answerUserQuestion, type AnswerUserQuestionInput, type AnswerUserQuestionOutput } from "@/ai/flows/answer-question-flow";
import { generateChapters, type GenerateChaptersInput, type GenerateChaptersOutput, type Chapter } from "@/ai/flows/generate-chapters";

export interface ProcessedVideoData {
  videoUrl: string;
  summary: string | null;
  flashcards: GenerateFlashcardsOutput['flashcards'] | null;
  notes: string | null;
  chapters: Chapter[] | null;
  error?: string | null; // Consolidated error message
}

export async function processVideoUrl(videoUrl: string): Promise<ProcessedVideoData> {
  let summary: string | null = null;
  let flashcards: GenerateFlashcardsOutput['flashcards'] | null = null;
  let notes: string | null = null;
  let chapters: Chapter[] | null = null;
  let accumulatedError: string | null = null;

  try {
    // 1. Get Transcript
    const rawTranscript: TranscriptResponse[] | null = await getYouTubeTranscript(videoUrl);

    if (!rawTranscript || rawTranscript.length === 0) {
      return { videoUrl, summary, flashcards, notes, chapters, error: "Could not retrieve transcript for the video. It might be unavailable or have transcripts disabled." };
    }

    // 2. Generate Summary
    try {
      const textForSummary = rawTranscript.map(t => t.text).join(' ');
      const summaryInput: SummarizeYouTubeVideoInput = { videoTranscript: textForSummary };
      const summaryResult: SummarizeYouTubeVideoOutput = await summarizeYouTubeVideo(summaryInput);
      summary = summaryResult.summary;
    } catch (e: any) {
      console.error("Error generating summary:", e);
      accumulatedError = (accumulatedError ? accumulatedError + " " : "") + "Failed to generate summary.";
    }

    if (summary) {
      // 3. Generate Flashcards (depends on summary)
      try {
        const flashcardsInput: GenerateFlashcardsInput = { videoSummary: summary };
        const flashcardsResult: GenerateFlashcardsOutput = await generateFlashcards(flashcardsInput);
        flashcards = flashcardsResult.flashcards;
      } catch (e: any) {
        console.error("Error generating flashcards:", e);
        accumulatedError = (accumulatedError ? accumulatedError + " " : "") + "Failed to generate flashcards.";
      }

      // 4. Generate Notes (depends on summary)
      try {
        const notesInput: GenerateNotesInput = { videoSummary: summary };
        const notesResult: GenerateNotesOutput = await generateNotes(notesInput);
        notes = notesResult.notes;
      } catch (e: any) {
        console.error("Error generating notes:", e);
        accumulatedError = (accumulatedError ? accumulatedError + " " : "") + "Failed to generate notes.";
      }
    } else {
        // If summary failed, skip dependent steps
        if (!accumulatedError) accumulatedError = "Summary generation failed, skipping flashcards and notes.";
        else accumulatedError += " Summary generation failed, skipping flashcards and notes.";
    }
    
    // 5. Generate Chapters (depends on raw transcript)
    try {
      const segmentsForChapters = rawTranscript.map(t => ({ text: t.text, offset: t.offset }));
      const chaptersInput: GenerateChaptersInput = { transcriptSegments: segmentsForChapters };
      const chaptersResult: GenerateChaptersOutput = await generateChapters(chaptersInput);
      chapters = chaptersResult.chapters;
    } catch (e: any) {
      console.error("Error generating chapters:", e);
      accumulatedError = (accumulatedError ? accumulatedError + " " : "") + "Failed to generate chapters.";
    }

    return { videoUrl, summary, flashcards, notes, chapters, error: accumulatedError };

  } catch (error: any) {
    console.error("Error processing video URL:", error);
    // This catches errors from getYouTubeTranscript or other unexpected issues
    return { videoUrl, summary, flashcards, notes, chapters, error: error.message || "An unexpected error occurred during video processing." };
  }
}


// This function is kept for generating more flashcards, as it only depends on the summary.
export async function createFlashcardsFromSummary(summary: string): Promise<{ flashcards: GenerateFlashcardsOutput['flashcards'] | null, error?: string }> {
  try {
    const input: GenerateFlashcardsInput = { videoSummary: summary };
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
  conversationHistory?: AnswerUserQuestionInput['conversationHistory']
): Promise<{ answer: string | null, error?: string }> {
  try {
    const input: AnswerUserQuestionInput = { videoSummary, userQuestion, conversationHistory };
    const result: AnswerUserQuestionOutput = await answerUserQuestion(input);
    return { answer: result.answer };
  } catch (error) {
    console.error("Error answering question:", error);
    return { answer: null, error: "Failed to get an answer for your question." };
  }
}
