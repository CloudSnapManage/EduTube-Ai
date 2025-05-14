"use client";

import * as React from "react";
import { UrlInputForm } from "@/components/edutube/UrlInputForm";
import { SummaryDisplay } from "@/components/edutube/SummaryDisplay";
import { FlashcardViewer } from "@/components/edutube/FlashcardViewer";
import { LoadingSpinner } from "@/components/edutube/LoadingSpinner";
import { processVideoUrl, createFlashcardsFromSummary } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Sparkles } from "lucide-react";

interface Flashcard {
  question: string;
  answer: string;
}

export default function EduTubePage() {
  const [summary, setSummary] = React.useState<string | null>(null);
  const [flashcards, setFlashcards] = React.useState<Flashcard[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingStep, setLoadingStep] = React.useState<"" | "summary" | "flashcards">("");
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleUrlSubmit = async (videoUrl: string) => {
    setIsLoading(true);
    setLoadingStep("summary");
    setError(null);
    setSummary(null);
    setFlashcards(null);

    const summaryResult = await processVideoUrl(videoUrl);

    if (summaryResult.error || !summaryResult.summary) {
      setError(summaryResult.error || "An unknown error occurred while summarizing.");
      toast({
        title: "Error",
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
      className: "bg-accent text-accent-foreground",
    });

    setLoadingStep("flashcards");
    const flashcardsResult = await createFlashcardsFromSummary(summaryResult.summary);

    if (flashcardsResult.error || !flashcardsResult.flashcards) {
      setError(flashcardsResult.error || "An unknown error occurred while generating flashcards.");
      toast({
        title: "Error",
        description: flashcardsResult.error || "Failed to generate flashcards.",
        variant: "destructive",
      });
    } else {
      setFlashcards(flashcardsResult.flashcards);
      toast({
        title: "Flashcards Ready!",
        description: "Flashcards generated from the summary.",
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
          Unlock knowledge faster. Summarize YouTube videos and generate flashcards with AI.
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

        {error && (
          <Alert variant="destructive" className="mt-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {summary && !isLoading && <SummaryDisplay summary={summary} />}
        {flashcards && !isLoading && <FlashcardViewer flashcards={flashcards} />}
      </main>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} EduTube AI. Powered by GenAI.</p>
      </footer>
    </div>
  );
}
