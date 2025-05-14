
"use client";

import * as React from "react";
import { UrlInputForm } from "@/components/edutube/UrlInputForm";
import { SummaryDisplay } from "@/components/edutube/SummaryDisplay";
import { FlashcardViewer } from "@/components/edutube/FlashcardViewer";
import { NoteDisplay } from "@/components/edutube/NoteDisplay";
import { LoadingSpinner } from "@/components/edutube/LoadingSpinner";
import { processVideoUrl, createFlashcardsFromSummary, createNotesFromVideoSummary } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Sparkles } from "lucide-react";

interface Flashcard {
  question: string;
  answer: string;
}

export default function EduTubePage() {
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState<string | null>(null);
  const [flashcards, setFlashcards] = React.useState<Flashcard[] | null>(null);
  const [notes, setNotes] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingStep, setLoadingStep] = React.useState<"" | "summary" | "flashcards" | "notes">("");
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const getYouTubeVideoTitle = (url: string): string => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.substring(1) || "YouTube Video";
      }
      if (urlObj.hostname === "www.youtube.com" || urlObj.hostname === "youtube.com") {
        const videoId = urlObj.searchParams.get("v");
        // In a real app, you might fetch the title via an API, but for simplicity:
        return videoId ? `Video ${videoId}` : "YouTube Video";
      }
    } catch (e) {
      // Invalid URL
    }
    return "YouTube Video";
  };
  
  const videoTitle = React.useMemo(() => videoUrl ? getYouTubeVideoTitle(videoUrl) : "EduTube Study Material", [videoUrl]);


  const handleUrlSubmit = async (submittedVideoUrl: string) => {
    setIsLoading(true);
    setLoadingStep("summary");
    setError(null);
    setSummary(null);
    setFlashcards(null);
    setNotes(null);
    setVideoUrl(submittedVideoUrl);

    const summaryResult = await processVideoUrl(submittedVideoUrl);

    if (summaryResult.error || !summaryResult.summary) {
      setError(summaryResult.error || "An unknown error occurred while summarizing.");
      toast({
        title: "Error Summarizing",
        description: summaryResult.error || "Failed to get summary.",
        variant: "destructive",
      });
      setIsLoading(false);
      setLoadingStep("");
      return;
    }

    setSummary(summaryResult.summary);
    toast({
      title: "Summary Generated!",
      description: "Video summary successfully created.",
      className: "bg-primary text-primary-foreground",
    });

    // Generate Flashcards
    setLoadingStep("flashcards");
    const flashcardsResult = await createFlashcardsFromSummary(summaryResult.summary);
    if (flashcardsResult.error || !flashcardsResult.flashcards) {
      setError(flashcardsResult.error || "Error generating flashcards."); // Keep main error for display
      toast({
        title: "Error Generating Flashcards",
        description: flashcardsResult.error || "Failed to generate flashcards.",
        variant: "destructive",
      });
      // Continue to notes generation even if flashcards fail for now
    } else {
      setFlashcards(flashcardsResult.flashcards);
      toast({
        title: "Flashcards Ready!",
        description: "Flashcards generated from the summary.",
        className: "bg-accent text-accent-foreground",
      });
    }
    
    // Generate Notes
    setLoadingStep("notes");
    const notesResult = await createNotesFromVideoSummary(summaryResult.summary);
    if (notesResult.error || !notesResult.notes) {
      setError(notesResult.error || "Error generating notes."); // Update main error if this also fails
      toast({
        title: "Error Generating Notes",
        description: notesResult.error || "Failed to generate revision notes.",
        variant: "destructive",
      });
    } else {
      setNotes(notesResult.notes);
      toast({
        title: "Revision Notes Ready!",
        description: "Notes generated from the summary.",
        className: "bg-accent text-accent-foreground",
      });
    }

    setIsLoading(false);
    setLoadingStep("");
  };

  return (
    <div className="container mx-auto min-h-screen p-4 py-8 md:p-8 font-sans">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <Sparkles className="mr-3 h-10 w-10" />
          EduTube AI
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Unlock knowledge faster. Summarize YouTube videos, generate flashcards and notes with AI.
        </p>
      </header>

      <main className="max-w-3xl mx-auto">
        <UrlInputForm onSubmit={handleUrlSubmit} isLoading={isLoading} />

        {isLoading && loadingStep === "summary" && (
          <LoadingSpinner message="Generating summary, please wait..." className="mt-8" />
        )}
        {isLoading && loadingStep === "flashcards" && (
          <LoadingSpinner message="Generating flashcards..." className="mt-8" />
        )}
        {isLoading && loadingStep === "notes" && (
          <LoadingSpinner message="Crafting revision notes..." className="mt-8" />
        )}

        {error && !isLoading && ( // Show general error only if not loading something new
          <Alert variant="destructive" className="mt-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Process Interrupted</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {summary && !isLoading && <SummaryDisplay summary={summary} />}
        {flashcards && !isLoading && <FlashcardViewer flashcards={flashcards} />}
        {notes && !isLoading && <NoteDisplay notes={notes} videoTitle={videoTitle} />}
      </main>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} EduTube AI. Powered by GenAI.</p>
      </footer>
    </div>
  );
}
