"use server";

import { summarizeYouTubeVideo, type SummarizeYouTubeVideoInput, type SummarizeYouTubeVideoOutput } from "@/ai/flows/summarize-youtube-video";
import { generateFlashcards, type GenerateFlashcardsInput, type GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";

export async function processVideoUrl(videoUrl: string): Promise<{ summary: string | null, error?: string }> {
  try {
    const input: SummarizeYouTubeVideoInput = { videoUrl };
    const result: SummarizeYouTubeVideoOutput = await summarizeYouTubeVideo(input);
    return { summary: result.summary };
  } catch (error) {
    console.error("Error summarizing video:", error);
    return { summary: null, error: "Failed to summarize video. Please check the URL and try again." };
  }
}

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
