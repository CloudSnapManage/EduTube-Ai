
"use client";

import * as React from "react";
import type { SummaryStyle } from "@/ai/flows/summarize-youtube-video";
import type { Chapter } from "@/ai/flows/generate-chapters";
import type { GenerateQuizOutput } from "@/ai/flows/generate-quiz"; 
import type { GenerateExamOutput } from "@/ai/flows/generate-exam"; 

import { UrlInputForm } from "@/components/edutube/UrlInputForm";
import { SummaryDisplay } from "@/components/edutube/SummaryDisplay";
import { FlashcardViewer } from "@/components/edutube/FlashcardViewer";
import { NoteDisplay } from "@/components/edutube/NoteDisplay";
import { QuestionAnswerSection } from "@/components/edutube/QuestionAnswerSection";
import { ChapterDisplay } from "@/components/edutube/ChapterDisplay";
import { QuizDisplay } from "@/components/edutube/QuizDisplay"; 
import { KeyTakeawaysDisplay } from "@/components/edutube/KeyTakeawaysDisplay";
import { FurtherStudyDisplay } from "@/components/edutube/FurtherStudyDisplay";
import { MindMapDisplay } from "@/components/edutube/MindMapDisplay";
import { LoadingSpinner } from "@/components/edutube/LoadingSpinner";
import { EmbeddedVideoPlayer } from "@/components/edutube/EmbeddedVideoPlayer";
import { ExamDisplay } from "@/components/edutube/ExamDisplay"; 

import { 
  processVideoUrl, 
  createFlashcardsFromSummary, 
  type ProcessedVideoData, 
  generateAdvancedQuiz, 
  askQuestionAboutSummary, 
  type AnswerUserQuestionInput,
  generateExamAction 
} from "./actions"; 
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; 
import { AlertTriangle, Sparkles, BookCheck, Languages, Settings2, MessageSquareMore, Network, ListChecks, BookOpenCheck, FileSignature, Brain } from "lucide-react"; 
import { getYouTubeVideoId } from "@/lib/youtube-utils";

interface Flashcard {
  id?: string;
  question: string;
  answer: string;
}

const availableLanguages = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Español (Spanish)" },
  { value: "French", label: "Français (French)" },
  { value: "German", label: "Deutsch (German)" },
  { value: "Hindi", label: "हिन्दी (Hindi)" },
  { value: "Nepali", label: "नेपाली (Nepali)" },
  { value: "Portuguese", label: "Português (Portuguese)" },
  { value: "Japanese", label: "日本語 (Japanese)" },
  { value: "Korean", label: "한국어 (Korean)" },
];

const summaryStyleOptions: { value: SummaryStyle; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium (Default)" },
  { value: "detailed", label: "Detailed" },
  { value: "eli5", label: "ELI5 (Simple)" },
  { value: "academic", label: "Academic" },
];


export default function EduTubePage() {
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [currentVideoId, setCurrentVideoId] = React.useState<string | null>(null);
  const [playerTimestamp, setPlayerTimestamp] = React.useState<number | undefined>(undefined);
  
  const [summary, setSummary] = React.useState<string | null>(null);
  const [flashcards, setFlashcards] = React.useState<Flashcard[] | null>(null);
  const [notes, setNotes] = React.useState<string | null>(null);
  const [chapters, setChapters] = React.useState<Chapter[] | null>(null);
  const [keyTakeaways, setKeyTakeaways] = React.useState<string[] | null>(null);
  const [furtherStudyPrompts, setFurtherStudyPrompts] = React.useState<string[] | null>(null);
  const [mindMapMermaidSyntax, setMindMapMermaidSyntax] = React.useState<string | null>(null);
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingStep, setLoadingStep] = React.useState<string>("");
  const [isGeneratingMoreFlashcards, setIsGeneratingMoreFlashcards] = React.useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = React.useState(false); 
  const [generatedQuizData, setGeneratedQuizData] = React.useState<GenerateQuizOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  const [selectedSummaryStyle, setSelectedSummaryStyle] = React.useState<SummaryStyle>("medium");
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("English");

  const [isGeneratingExam, setIsGeneratingExam] = React.useState(false);
  const [generatedExamData, setGeneratedExamData] = React.useState<GenerateExamOutput | null>(null);
  const [examTotalMarks, setExamTotalMarks] = React.useState<number>(50);


  const { toast } = useToast();

  const getYouTubeVideoTitleFromUrl = (url: string): string => {
    try {
      const videoId = getYouTubeVideoId(url);
      return videoId ? `Video (${videoId})` : "YouTube Video";
    } catch (e) { /* Invalid URL */ }
    return "YouTube Video";
  };
  
  const videoTitle = React.useMemo(() => videoUrl ? getYouTubeVideoTitleFromUrl(videoUrl) : "EduTube Study Material", [videoUrl]);

  const resetAllData = () => {
    setSummary(null);
    setFlashcards(null);
    setNotes(null);
    setChapters(null);
    setKeyTakeaways(null);
    setFurtherStudyPrompts(null);
    setMindMapMermaidSyntax(null);
    setGeneratedQuizData(null);
    setGeneratedExamData(null); 
    setCurrentVideoId(null);
    setPlayerTimestamp(undefined);
    setError(null);
  };

  const handleUrlSubmit = async (submittedVideoUrl: string) => {
    setIsLoading(true);
    setLoadingStep("processing video..."); 
    resetAllData();
    setVideoUrl(submittedVideoUrl);
    
    const extractedVideoId = getYouTubeVideoId(submittedVideoUrl);
    setCurrentVideoId(extractedVideoId);

    toast({
      title: "🚀 Processing Video...",
      description: `Fetching transcript for ${selectedLanguage} output. This might take a moment!`,
    });

    const result: ProcessedVideoData = await processVideoUrl(submittedVideoUrl, selectedSummaryStyle, selectedLanguage);

    if (result.error && !result.summary) { // Total failure
      setError(result.error || "An unknown error occurred during processing.");
      toast({
        title: "😕 Error Processing Video",
        description: result.error || "Failed to process the video. Please check the URL or try another.",
        variant: "destructive",
      });
    } else {
      if (result.summary) {
        setSummary(result.summary);
        toast({ title: "✅ Summary Generated!", description: `Summary (${selectedSummaryStyle}, ${selectedLanguage}) created.`, className: "bg-primary text-primary-foreground" });
      } else {
        toast({ title: "⚠️ Summary Failed", description: `Could not generate summary in ${selectedLanguage}.`, variant: "destructive" });
      }

      if (result.flashcards && result.flashcards.length > 0) {
        setFlashcards(result.flashcards);
        toast({ title: "✨ Flashcards Ready!", description: `Flashcards in ${selectedLanguage} generated.`, className: "bg-accent text-accent-foreground" });
      } else if (result.summary) { 
         toast({ title: "📭 Flashcard Generation Skipped/Failed", description: `Could not generate flashcards in ${selectedLanguage}.`, variant: "default", className: "bg-muted text-muted-foreground" });
      }
      
      if (result.notes) {
        setNotes(result.notes);
        toast({ title: "📝 Revision Notes Ready!", description: `Detailed notes in ${selectedLanguage} generated.`, className: "bg-accent text-accent-foreground" });
      } else if (result.summary) {
         toast({ title: "📑 Note Generation Skipped/Failed", description: `Could not generate notes in ${selectedLanguage}.`, variant: "default", className: "bg-muted text-muted-foreground" });
      }

      if (result.chapters && result.chapters.length > 0) {
        setChapters(result.chapters);
        toast({ title: "📚 Chapters Identified!", description: `Video chapters (titles in ${selectedLanguage}) ready.`, className: "bg-accent text-accent-foreground" });
      } else if (!result.error || (result.error && !result.error.includes("transcript"))) { 
         toast({ title: "📖 Chapter Generation Skipped/Failed", description: `Could not generate chapters with titles in ${selectedLanguage}.`, variant: "default", className: "bg-muted text-muted-foreground" });
      }

      if (result.keyTakeaways && result.keyTakeaways.length > 0) {
        setKeyTakeaways(result.keyTakeaways);
        toast({ title: "🔑 Key Takeaways Extracted!", description: `Key points in ${selectedLanguage} ready.`, className: "bg-accent text-accent-foreground" });
      } else if (result.summary) {
        toast({ title: "📉 Key Takeaways Skipped/Failed", description: `Could not generate key takeaways in ${selectedLanguage}.`, variant: "default", className: "bg-muted text-muted-foreground" });
      }

      if (result.furtherStudyPrompts && result.furtherStudyPrompts.length > 0) {
        setFurtherStudyPrompts(result.furtherStudyPrompts);
        toast({ title: "💡 Further Study Prompts Generated!", description: `Exploration ideas in ${selectedLanguage} ready.`, className: "bg-accent text-accent-foreground" });
      } else if (result.summary) {
        toast({ title: "🤔 Further Study Prompts Skipped/Failed", description: `Could not generate further study prompts in ${selectedLanguage}.`, variant: "default", className: "bg-muted text-muted-foreground" });
      }
      
      if (result.mindMapOutline) { // This is now Mermaid syntax
        setMindMapMermaidSyntax(result.mindMapOutline);
        toast({ title: "🗺️ Mind Map Syntax Created!", description: `Mermaid syntax for mind map in ${selectedLanguage} ready.`, className: "bg-accent text-accent-foreground" });
      } else if (result.summary) {
        toast({ title: "🕸️ Mind Map Syntax Skipped/Failed", description: `Could not generate mind map syntax in ${selectedLanguage}.`, variant: "default", className: "bg-muted text-muted-foreground" });
      }

      if (result.error) { 
        setError(prevError => prevError ? `${prevError} Additionally: ${result.error}` : result.error);
        if (!result.summary) setCurrentVideoId(null); 
      }
    }
    setIsLoading(false);
    setLoadingStep("");
  };

  const handleGenerateMoreFlashcards = async () => {
    if (!summary) {
      toast({ title: "No Summary Available", description: "Cannot generate more flashcards without a video summary.", variant: "destructive" });
      return;
    }
    setIsGeneratingMoreFlashcards(true);
    setError(prevError => prevError && prevError.toLowerCase().includes("flashcard") ? null : prevError);

    const flashcardsResult = await createFlashcardsFromSummary(summary, selectedLanguage);

    if (flashcardsResult.error || !flashcardsResult.flashcards) {
      setError(flashcardsResult.error || "Error generating more flashcards.");
      toast({ title: "Error Generating More Flashcards", description: flashcardsResult.error || `Failed to generate a new set of flashcards in ${selectedLanguage}.`, variant: "destructive" });
    } else {
      setFlashcards(flashcardsResult.flashcards); 
      toast({ title: "✨ New Flashcards Ready!", description: `A fresh set of flashcards in ${selectedLanguage} has been generated.`, className: "bg-accent text-accent-foreground" });
    }
    setIsGeneratingMoreFlashcards(false);
  };

  const handleGenerateQuiz = async () => {
    const contentForQuiz = notes || summary || ""; 
    if (!contentForQuiz) {
      toast({ title: "No Content for Quiz", description: "Please generate a summary or notes first to create a quiz.", variant: "destructive" });
      return;
    }
    setIsGeneratingQuiz(true);
    setLoadingStep("quiz");
    setGeneratedQuizData(null);
    setError(null);

    toast({ title: "🧠 Generating Advanced Quiz...", description: `AI is crafting questions in ${selectedLanguage}. Hang tight!`, });

    const quizResult = await generateAdvancedQuiz(contentForQuiz, selectedLanguage);

    if (quizResult.error || !quizResult.quiz || quizResult.quiz.questions.length === 0) {
      setError(quizResult.error || "Failed to generate quiz questions.");
      toast({ title: "😕 Quiz Generation Failed", description: quizResult.error || `Could not generate a quiz in ${selectedLanguage}.`, variant: "destructive" });
      setGeneratedQuizData(null);
    } else {
      setGeneratedQuizData(quizResult.quiz);
      toast({ title: "🎉 Advanced Quiz Generated!", description: `Quiz "${quizResult.quiz.quizTitle}" in ${selectedLanguage} is ready.`, className: "bg-primary text-primary-foreground", duration: 7000 });
    }
    setIsGeneratingQuiz(false);
    setLoadingStep("");
  };

  const handleGenerateExam = async () => {
    const contentForExam = notes || summary || "";
    if (!contentForExam) {
      toast({ title: "No Content for Exam", description: "Please generate a summary or notes first to create an exam.", variant: "destructive" });
      return;
    }
    if (examTotalMarks < 10 || examTotalMarks > 100) {
        toast({ title: "Invalid Marks", description: "Conceptual total marks should be between 10 and 100.", variant: "destructive" });
        return;
    }

    setIsGeneratingExam(true);
    setLoadingStep("exam questions");
    setGeneratedExamData(null);
    setError(null);

    toast({ title: "📝 Generating Exam...", description: `AI is preparing exam questions in ${selectedLanguage} (for approx. ${examTotalMarks} marks).`, });
    
    const examResult = await generateExamAction(contentForExam, selectedLanguage, examTotalMarks);

    if (examResult.error || !examResult.exam || examResult.exam.questions.length === 0) {
      setError(examResult.error || "Failed to generate exam questions.");
      toast({ title: "😕 Exam Generation Failed", description: examResult.error || `Could not generate an exam in ${selectedLanguage}.`, variant: "destructive" });
      setGeneratedExamData(null);
    } else {
      setGeneratedExamData(examResult.exam);
      toast({ title: "📜 Exam Ready!", description: `Exam "${examResult.exam.examTitle}" in ${selectedLanguage} is ready to view/download.`, className: "bg-primary text-primary-foreground", duration: 7000 });
    }
    setIsGeneratingExam(false);
    setLoadingStep("");
  };


  const handleChapterClick = (timeInSeconds: number) => {
    setPlayerTimestamp(timeInSeconds);
    const playerElement = document.getElementById("embedded-video-player-card");
    if (playerElement) {
      playerElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const animationClasses = "animate-in fade-in-0 slide-in-from-top-5 duration-700 ease-out";

  return (
    <div className="container mx-auto min-h-screen p-4 py-8 md:p-10 font-sans">
      <header className="mb-10 text-center">
        <div className="flex justify-center items-center mb-6">
          <Sparkles className="mr-3 h-10 w-10 md:h-12 md:w-12 text-accent" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary">
            EduTube AI
          </h1>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Unlock knowledge faster. Input a YouTube URL to get AI-powered summaries, notes, flashcards, chapters, quizzes, and more in your chosen language and style.
        </p>
      </header>
      
      <main className="max-w-3xl mx-auto">
        <Card className="mb-10 p-6 bg-card shadow-xl rounded-lg">
            <UrlInputForm onSubmit={handleUrlSubmit} isLoading={isLoading} />
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="summary-style-select" className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                        <Settings2 className="mr-2 h-4 w-4" /> Summary Style
                    </Label>
                    <Select value={selectedSummaryStyle} onValueChange={(value) => setSelectedSummaryStyle(value as SummaryStyle)} disabled={isLoading}>
                        <SelectTrigger id="summary-style-select" className="w-full h-11">
                            <SelectValue placeholder="Select summary style" />
                        </SelectTrigger>
                        <SelectContent>
                            {summaryStyleOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="language-select" className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                        <Languages className="mr-2 h-4 w-4" /> Output Language
                    </Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isLoading}>
                        <SelectTrigger id="language-select" className="w-full h-11">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableLanguages.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </Card>


        {isLoading && loadingStep && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <LoadingSpinner message={`AI is ${loadingStep}... this may take a few moments.`} className="mt-8" size={60} />
            <p className="text-muted-foreground mt-2">Your enhanced learning materials are being crafted!</p>
          </div>
        )}
        
        {error && !isLoading && !isGeneratingMoreFlashcards && !isGeneratingQuiz && !isGeneratingExam && ( 
          <Alert variant="destructive" className="mt-8 shadow-lg animate-in fade-in-0 duration-500">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Process Interrupted or Partially Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {error && (isGeneratingMoreFlashcards || isGeneratingQuiz || isGeneratingExam) && (
           <Alert variant="destructive" className="mt-4 shadow-lg animate-in fade-in-0 duration-500">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{isGeneratingMoreFlashcards ? "Flashcard Regeneration Failed" : isGeneratingQuiz ? "Quiz Generation Failed" : "Exam Generation Failed"}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentVideoId && !isLoading && (
          <div id="embedded-video-player-card" className={animationClasses}>
            <EmbeddedVideoPlayer videoId={currentVideoId} seekToTime={playerTimestamp} />
          </div>
        )}

        {chapters && videoUrl && currentVideoId && !isLoading && (
          <div className={animationClasses}>
            <ChapterDisplay 
              chapters={chapters} 
              videoId={currentVideoId} 
              onChapterClick={handleChapterClick}
            />
          </div>
        )}
        {summary && !isLoading && (
          <div className={animationClasses}>
            <SummaryDisplay summary={summary} />
          </div>
        )}
         {keyTakeaways && keyTakeaways.length > 0 && !isLoading && (
          <div className={animationClasses}>
            <KeyTakeawaysDisplay takeaways={keyTakeaways} />
          </div>
        )}
         {mindMapMermaidSyntax && !isLoading && (
          <div className={animationClasses}>
            <MindMapDisplay mermaidSyntax={mindMapMermaidSyntax} />
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
        {furtherStudyPrompts && furtherStudyPrompts.length > 0 && !isLoading && (
            <div className={animationClasses}>
                <FurtherStudyDisplay prompts={furtherStudyPrompts} />
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
                  <CardDescription className="text-base">Ready to check your understanding? Generate an advanced quiz based on the video content (in {selectedLanguage}).</CardDescription>
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
                    <LoadingSpinner message={`AI is crafting your quiz in ${selectedLanguage}...`} size={40} />
                    <p className="text-muted-foreground mt-3">This can take a few moments.</p>
                </div>
            )}

            {generatedQuizData && !isGeneratingQuiz && (
              <QuizDisplay quizData={generatedQuizData} onRetakeQuiz={handleGenerateQuiz} />
            )}
           </div>
        )}

        {!isLoading && summary && (
           <div className={`${animationClasses} mt-8`}>
            {!generatedExamData && !isGeneratingExam && (
              <Card className="shadow-xl rounded-lg overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center text-2xl font-semibold">
                    <FileSignature className="mr-3 h-7 w-7 text-primary" />
                    Create an Exam
                  </CardTitle>
                  <CardDescription className="text-base">Generate exam-style questions based on the video content (in {selectedLanguage}).</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="exam-total-marks" className="text-sm font-medium text-muted-foreground">Conceptual Total Marks (10-100):</Label>
                    <Input 
                      id="exam-total-marks"
                      type="number" 
                      value={examTotalMarks}
                      onChange={(e) => setExamTotalMarks(parseInt(e.target.value, 10) || 0)}
                      min={10}
                      max={100}
                      className="mt-1 h-11"
                      disabled={isGeneratingExam}
                    />
                  </div>
                  <Button onClick={handleGenerateExam} disabled={isGeneratingExam || (!summary && !notes)} className="w-full">
                    {isGeneratingExam ? (
                      <>
                        <LoadingSpinner size={16} className="mr-2 py-0" /> Generating Exam Questions...
                      </>
                    ) : (
                      "Generate Exam"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {isGeneratingExam && loadingStep === "exam questions" && (
                <div className="flex flex-col items-center justify-center p-10 my-8 border rounded-lg bg-card shadow-lg">
                    <LoadingSpinner message={`AI is preparing your exam questions in ${selectedLanguage}...`} size={40} />
                    <p className="text-muted-foreground mt-3">This can take a few moments.</p>
                </div>
            )}

            {generatedExamData && !isGeneratingExam && (
              <ExamDisplay examData={generatedExamData} videoTitle={videoTitle} targetLanguage={selectedLanguage} />
            )}
           </div>
        )}


        {!isLoading && summary && (
           <div className={animationClasses}>
            <QuestionAnswerSection videoSummary={summary} targetLanguage={selectedLanguage} />
           </div>
        )}

      </main>

      <footer className="mt-20 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} EduTube AI. Powered by GenAI & Next.js.</p>
        <p>Designed with <span role="img" aria-label="heart">❤️</span> for impactful learning across languages.</p>
      </footer>
    </div>
  );
}
