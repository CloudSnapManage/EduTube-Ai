
"use client";

import * as React from "react";
import type { Chapter } from "@/ai/flows/generate-chapters";
import type { QuizQuestion, GenerateQuizOutput } from "@/ai/flows/generate-quiz"; // Import QuizQuestion type
import { UrlInputForm } from "@/components/edutube/UrlInputForm";
import { SummaryDisplay } from "@/components/edutube/SummaryDisplay";
import { FlashcardViewer } from "@/components/edutube/FlashcardViewer";
import { NoteDisplay } from "@/components/edutube/NoteDisplay";
import { QuestionAnswerSection } from "@/components/edutube/QuestionAnswerSection";
import { ChapterDisplay } from "@/components/edutube/ChapterDisplay";
import { QuizDisplay } from "@/components/edutube/QuizDisplay"; // Import QuizDisplay
import { LoadingSpinner } from "@/components/edutube/LoadingSpinner";
import { processVideoUrl, createFlashcardsFromSummary, type ProcessedVideoData, generateAdvancedQuiz } from "./actions"; 
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"; 
import { AlertTriangle, Sparkles, Brain, BookCheck } from "lucide-react"; 

interface Flashcard {
  question: string;
  answer: string;
}

export default function EduTubePage() {
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState<string | null>(null);
  const [flashcards, setFlashcards] = React.useState<Flashcard[] | null>(null);
  const [notes, setNotes] = React.useState<string | null>(null);
  const [chapters, setChapters] = React.useState<Chapter[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingStep, setLoadingStep] = React.useState<"" | "processing" | "summary" | "flashcards" | "notes" | "chapters" | "quiz">("");
  const [isGeneratingMoreFlashcards, setIsGeneratingMoreFlashcards] = React.useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = React.useState(false); 
  const [generatedQuizData, setGeneratedQuizData] = React.useState<GenerateQuizOutput | null>(null);
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
    setLoadingStep("processing"); 
    setError(null);
    setSummary(null);
    setFlashcards(null);
    setNotes(null);
    setChapters(null);
    setGeneratedQuizData(null); 
    setVideoUrl(submittedVideoUrl);

    toast({
      title: "🚀 Processing Video...",
      description: "Fetching transcript and conjuring AI magic. This might take a moment!",
    });

    const result: ProcessedVideoData = await processVideoUrl(submittedVideoUrl);

    if (result.error || !result.summary) { 
      setError(result.error || "An unknown error occurred during processing.");
      toast({
        title: "😕 Error Processing Video",
        description: result.error || "Failed to process the video. Please check the URL or try another.",
        variant: "destructive",
      });
      setSummary(null); 
      setFlashcards(null);
      setNotes(null);
      setChapters(null);
    } else {
      setSummary(result.summary);
      toast({
        title: "✅ Summary Generated!",
        description: "Video summary successfully created.",
        className: "bg-primary text-primary-foreground",
      });

      if (result.flashcards && result.flashcards.length > 0) {
        setFlashcards(result.flashcards);
        toast({
          title: "✨ Flashcards Ready!",
          description: "Flashcards generated from the summary.",
          className: "bg-accent text-accent-foreground",
        });
      } else if (result.summary) { 
         toast({
          title: "📭 Flashcard Generation Skipped",
          description: "Could not generate flashcards. The summary might be too short or an issue occurred.",
          variant: "default", className: "bg-muted text-muted-foreground" 
        });
      }
      
      if (result.notes) {
        setNotes(result.notes);
        toast({
          title: "📝 Revision Notes Ready!",
          description: "Detailed notes generated from the summary.",
          className: "bg-accent text-accent-foreground",
        });
      } else if (result.summary) {
         toast({
          title: "📑 Note Generation Skipped",
          description: "Could not generate notes. An issue might have occurred.",
          variant: "default", className: "bg-muted text-muted-foreground"
        });
      }

      if (result.chapters && result.chapters.length > 0) {
        setChapters(result.chapters);
        toast({
          title: "📚 Chapters Identified!",
          description: "Video chapters and timestamps are ready.",
          className: "bg-accent text-accent-foreground",
        });
      } else if (!result.error || !result.error?.includes("transcript")) { 
         toast({
          title: "📖 Chapter Generation Skipped",
          description: "Could not identify distinct chapters for this video.",
          variant: "default", className: "bg-muted text-muted-foreground"
        });
      }
    }
    
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
        title: "✨ New Flashcards Ready!",
        description: "A fresh set of flashcards has been generated.",
        className: "bg-accent text-accent-foreground",
      });
    }
    setIsGeneratingMoreFlashcards(false);
  };

  const handleGenerateQuiz = async () => {
    if (!summary && !notes) {
      toast({
        title: "No Content for Quiz",
        description: "Please generate a summary or notes first to create a quiz.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingQuiz(true);
    setLoadingStep("quiz");
    setGeneratedQuizData(null);
    setError(null);

    toast({
      title: "🧠 Generating Advanced Quiz...",
      description: "AI is crafting some challenging questions. Hang tight!",
    });

    const contentForQuiz = notes || summary || ""; 
    const quizResult = await generateAdvancedQuiz(contentForQuiz);

    if (quizResult.error || !quizResult.quiz || quizResult.quiz.questions.length === 0) {
      setError(quizResult.error || "Failed to generate quiz questions.");
      toast({
        title: "😕 Quiz Generation Failed",
        description: quizResult.error || "Could not generate a quiz. The content might be too short or an issue occurred.",
        variant: "destructive",
      });
      setGeneratedQuizData(null);
    } else {
      setGeneratedQuizData(quizResult.quiz);
      toast({
        title: "🎉 Advanced Quiz Generated!",
        description: `Quiz "${quizResult.quiz.quizTitle}" is ready for you to take.`,
        className: "bg-primary text-primary-foreground",
        duration: 7000,
      });
    }
    setIsGeneratingQuiz(false);
    setLoadingStep("");
  };


  const animationClasses = "animate-in fade-in-0 slide-in-from-top-5 duration-700 ease-out";

  return (
    <div className="container mx-auto min-h-screen p-4 py-8 md:p-10 font-sans">
      <header className="mb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-primary flex items-center justify-center">
          <Sparkles className="mr-3 h-10 w-10 md:h-12 md:w-12 text-accent" />
          EduTube AI
        </h1>
        <p className="mt-3 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock knowledge faster. Summarize YouTube videos, generate flashcards, detailed notes, chapters, quizzes, and ask questions with AI.
        </p>
      </header>

      <main className="max-w-3xl mx-auto">
        <div className="mb-10 p-6 bg-card shadow-xl rounded-lg">
          <UrlInputForm onSubmit={handleUrlSubmit} isLoading={isLoading} />
        </div>

        {isLoading && loadingStep === "processing" && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <LoadingSpinner message="AI is working its magic... this may take a few moments." className="mt-8" size={60} />
            <p className="text-muted-foreground mt-2">Hang tight, awesome content is on its way!</p>
          </div>
        )}
        
        {error && !isLoading && !isGeneratingMoreFlashcards && !isGeneratingQuiz && ( 
          <Alert variant="destructive" className="mt-8 shadow-lg animate-in fade-in-0 duration-500">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Process Interrupted or Partially Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {error && (isGeneratingMoreFlashcards || isGeneratingQuiz) && (
           <Alert variant="destructive" className="mt-4 shadow-lg animate-in fade-in-0 duration-500">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{isGeneratingMoreFlashcards ? "Flashcard Regeneration Failed" : "Quiz Generation Failed"}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {summary && !isLoading && (
          <div className={animationClasses}>
            <SummaryDisplay summary={summary} />
          </div>
        )}
        {chapters && videoUrl && !isLoading && (
          <div className={animationClasses}>
            <ChapterDisplay chapters={chapters} videoUrl={videoUrl} />
          </div>
        )}
        {flashcards && !isLoading && (
          <div className={animationClasses}>
            <FlashcardViewer 
              initialFlashcards={flashcards} 
              onGenerateMore={handleGenerateMoreFlashcards}
              isGeneratingMore={isGeneratingMoreFlashcards}
              videoTitle={videoTitle}
            />
          </div>
        )}
        {notes && !isLoading && (
          <div className={animationClasses}>
            <NoteDisplay notes={notes} videoTitle={videoTitle} />
          </div>
        )}
        
        {!isLoading && summary && (
           <div className={`${animationClasses} mt-8`}>
            {!generatedQuizData && !isGeneratingQuiz && (
              <Card className="shadow-xl rounded-lg overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center text-2xl font-semibold">
                    <BookCheck className="mr-3 h-7 w-7 text-primary" />
                    Test Your Knowledge
                  </CardTitle>
                  <CardDescription className="text-base">Ready to check your understanding? Generate an advanced quiz based on the video content.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Button onClick={handleGenerateQuiz} disabled={isGeneratingQuiz || (!summary && !notes)} className="w-full">
                    {isGeneratingQuiz ? (
                      <>
                        <LoadingSpinner size={16} className="mr-2 py-0" /> Generating Quiz...
                      </>
                    ) : (
                      "Generate Advanced Quiz"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {isGeneratingQuiz && loadingStep === "quiz" && (
                <div className="flex flex-col items-center justify-center p-10 my-8 border rounded-lg bg-card shadow-lg">
                    <LoadingSpinner message="AI is crafting your quiz..." size={40} />
                    <p className="text-muted-foreground mt-3">This can take a few moments.</p>
                </div>
            )}

            {generatedQuizData && !isGeneratingQuiz && (
              <QuizDisplay quizData={generatedQuizData} onRetakeQuiz={handleGenerateQuiz} />
            )}
           </div>
        )}

        {!isLoading && summary && (
           <div className={animationClasses}>
            <QuestionAnswerSection videoSummary={summary} />
           </div>
        )}

      </main>

      <footer className="mt-20 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} EduTube AI. Powered by GenAI & Next.js.</p>
        <p>Designed with <span role="img" aria-label="heart">❤️</span> for impactful learning.</p>
      </footer>
    </div>
  );
}
