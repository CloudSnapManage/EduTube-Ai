
"use client";

import * as React from "react";
import type { Chapter } from "@/ai/flows/generate-chapters"; // Import Chapter type
import { UrlInputForm } from "@/components/edutube/UrlInputForm";
import { SummaryDisplay } from "@/components/edutube/SummaryDisplay";
import { FlashcardViewer } from "@/components/edutube/FlashcardViewer";
import { NoteDisplay } from "@/components/edutube/NoteDisplay";
import { QuestionAnswerSection } from "@/components/edutube/QuestionAnswerSection";
import { ChapterDisplay } from "@/components/edutube/ChapterDisplay"; // Import ChapterDisplay
import { LoadingSpinner } from "@/components/edutube/LoadingSpinner";
import { processVideoUrl, createFlashcardsFromSummary, type ProcessedVideoData } from "./actions";
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
  const [chapters, setChapters] = React.useState<Chapter[] | null>(null); // State for chapters
  const [isLoading, setIsLoading] = React.useState(false);
  // Extended loading steps to include chapters
  const [loadingStep, setLoadingStep] = React.useState<"" | "processing" | "summary" | "flashcards" | "notes" | "chapters">("");
  const [isGeneratingMoreFlashcards, setIsGeneratingMoreFlashcards] = React.useState(false);
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
    setLoadingStep("processing"); // General processing step
    setError(null);
    setSummary(null);
    setFlashcards(null);
    setNotes(null);
    setChapters(null); // Reset chapters
    setVideoUrl(submittedVideoUrl);

    toast({
      title: "Processing Video...",
      description: "Fetching transcript and generating content. This may take a moment.",
    });

    const result: ProcessedVideoData = await processVideoUrl(submittedVideoUrl);

    if (result.error || !result.summary) { // Check for summary as a primary success indicator for dependent steps
      setError(result.error || "An unknown error occurred during processing.");
      toast({
        title: "Error Processing Video",
        description: result.error || "Failed to process the video.",
        variant: "destructive",
      });
      setSummary(null); // Ensure summary is null on error
      setFlashcards(null);
      setNotes(null);
      setChapters(null);
    } else {
      setSummary(result.summary);
      toast({
        title: "Summary Generated!",
        description: "Video summary successfully created.",
        className: "bg-primary text-primary-foreground",
      });

      if (result.flashcards && result.flashcards.length > 0) {
        setFlashcards(result.flashcards);
        toast({
          title: "Flashcards Ready!",
          description: "Flashcards generated from the summary.",
          className: "bg-accent text-accent-foreground",
        });
      } else if (result.summary) { // Only show flashcard error if summary was successful
         toast({
          title: "Flashcard Generation Skipped",
          description: "Could not generate flashcards. The summary might be too short or an issue occurred.",
          variant: "default", className: "bg-muted text-muted-foreground" 
        });
      }
      
      if (result.notes) {
        setNotes(result.notes);
        toast({
          title: "Revision Notes Ready!",
          description: "Detailed notes generated from the summary.",
          className: "bg-accent text-accent-foreground",
        });
      } else if (result.summary) {
         toast({
          title: "Note Generation Skipped",
          description: "Could not generate notes. An issue might have occurred.",
          variant: "default", className: "bg-muted text-muted-foreground"
        });
      }
    }

    // Chapters are generated regardless of summary success, as they depend on transcript
    if (result.chapters && result.chapters.length > 0) {
      setChapters(result.chapters);
      toast({
        title: "Chapters Identified!",
        description: "Video chapters and timestamps are ready.",
        className: "bg-accent text-accent-foreground",
      });
    } else if (!result.error || !result.error.includes("transcript")) { // Don't show chapter error if transcript itself failed
       toast({
        title: "Chapter Generation Skipped",
        description: "Could not identify distinct chapters for this video.",
        variant: "default", className: "bg-muted text-muted-foreground"
      });
    }
    
    // Consolidate any errors from the backend
    if (result.error) {
        setError(prevError => prevError ? `${prevError} Additionally: ${result.error}` : result.error);
    }

    setIsLoading(false);
    setLoadingStep("");
  };

  const handleGenerateMoreFlashcards = async () => {
    if (!summary) {
      toast({
        title: "No Summary Available",
        description: "Cannot generate more flashcards without a video summary.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingMoreFlashcards(true);
    setError(prevError => prevError && prevError.toLowerCase().includes("flashcard") ? null : prevError);

    const flashcardsResult = await createFlashcardsFromSummary(summary);

    if (flashcardsResult.error || !flashcardsResult.flashcards) {
      setError(flashcardsResult.error || "Error generating more flashcards.");
      toast({
        title: "Error Generating More Flashcards",
        description: flashcardsResult.error || "Failed to generate a new set of flashcards.",
        variant: "destructive",
      });
    } else {
      setFlashcards(flashcardsResult.flashcards);
      toast({
        title: "New Flashcards Ready!",
        description: "A fresh set of flashcards has been generated.",
        className: "bg-accent text-accent-foreground",
      });
    }
    setIsGeneratingMoreFlashcards(false);
  };

  return (
    <div className="container mx-auto min-h-screen p-4 py-8 md:p-8 font-sans">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <Sparkles className="mr-3 h-10 w-10" />
          EduTube AI
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Unlock knowledge faster. Summarize YouTube videos, generate flashcards, detailed notes, chapters, and ask questions with AI.
        </p>
      </header>

      <main className="max-w-3xl mx-auto">
        <UrlInputForm onSubmit={handleUrlSubmit} isLoading={isLoading} />

        {isLoading && loadingStep === "processing" && (
          <LoadingSpinner message="Processing video... generating summary, chapters, and more. Please wait." className="mt-8" />
        )}
        
        {/* More specific loading messages removed for brevity since 'processing' covers all steps.
            Individual toasts provide feedback for each step's completion or failure. */}

        {error && !isLoading && !isGeneratingMoreFlashcards && ( 
          <Alert variant="destructive" className="mt-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Process Interrupted or Partially Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {error && isGeneratingMoreFlashcards && (
           <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Flashcard Regeneration Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Display sections if their data is available */}
        {summary && !isLoading && <SummaryDisplay summary={summary} />}
        {chapters && videoUrl && !isLoading && <ChapterDisplay chapters={chapters} videoUrl={videoUrl} />}
        {flashcards && !isLoading && (
          <FlashcardViewer 
            flashcards={flashcards} 
            onGenerateMore={handleGenerateMoreFlashcards}
            isGeneratingMore={isGeneratingMoreFlashcards}
          />
        )}
        {notes && !isLoading && <NoteDisplay notes={notes} videoTitle={videoTitle} />}
        
        {!isLoading && <QuestionAnswerSection videoSummary={summary} />}

      </main>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} EduTube AI. Powered by GenAI.</p>
      </footer>
    </div>
  );
}
