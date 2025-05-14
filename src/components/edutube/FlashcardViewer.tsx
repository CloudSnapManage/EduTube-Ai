
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCcw, Lightbulb, CheckCircle2, BookOpen, Loader2, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onGenerateMore: () => Promise<void>;
  isGeneratingMore: boolean;
}

export function FlashcardViewer({ flashcards, onGenerateMore, isGeneratingMore }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isAnimatingFlip, setIsAnimatingFlip] = React.useState(false);

  React.useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards]);

  if (!flashcards || flashcards.length === 0) {
    return (
      <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center text-2xl font-semibold">
            <BookOpen className="mr-3 h-7 w-7 text-primary" />
            Flashcards
          </CardTitle>
          <CardDescription className="text-base">No flashcards available to display.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground mb-4">It seems no flashcards were generated for this video yet.</p>
          <Button onClick={onGenerateMore} disabled={isGeneratingMore} className="w-full">
            {isGeneratingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Shuffle className="mr-2 h-4 w-4" />
                Generate Flashcards
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentFlashcard = flashcards[currentIndex];

  const handleNext = () => {
    if (isAnimatingFlip) return;
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length), isFlipped ? 150 : 0);
  };

  const handlePrev = () => {
    if (isAnimatingFlip) return;
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length), isFlipped ? 150 : 0);
  };

  const handleFlip = () => {
    if (isAnimatingFlip) return;
    setIsAnimatingFlip(true);
    setIsFlipped(!isFlipped);
    setTimeout(() => {
      setIsAnimatingFlip(false);
    }, 500); // Match transition duration
  };

  return (
    <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center justify-between text-2xl font-semibold">
          <div className="flex items-center">
            <BookOpen className="mr-3 h-7 w-7 text-primary" />
            Flashcards
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {currentIndex + 1} / {flashcards.length}
          </span>
        </CardTitle>
         <CardDescription className="text-base">Click the card to flip it. Use buttons to navigate or generate more.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center p-6">
        <div
          className="w-full h-72 p-6 border rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-transform duration-500 ease-in-out relative preserve-3d"
          onClick={handleFlip}
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front of the card (Question) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-card rounded-lg backface-hidden">
            <Lightbulb className="h-10 w-10 mb-4 text-yellow-400" />
            <h3 className="text-xl font-semibold mb-3">Question:</h3>
            <p className="text-lg">{currentFlashcard.question}</p>
          </div>
          {/* Back of the card (Answer) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-accent/10 rounded-lg backface-hidden border border-accent" style={{ transform: 'rotateY(180deg)' }}>
            <CheckCircle2 className="h-10 w-10 mb-4 text-accent" />
            <h3 className="text-xl font-semibold mb-3">Answer:</h3>
            <p className="text-lg">{currentFlashcard.answer}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 w-full">
          <Button variant="outline" onClick={handlePrev} disabled={flashcards.length <= 1 || isAnimatingFlip}>
            <ChevronLeft /> Previous
          </Button>
          <Button variant="ghost" onClick={handleFlip} className="text-primary hover:text-primary/90" disabled={isAnimatingFlip}>
            <RefreshCcw /> Flip Card
          </Button>
          <Button variant="outline" onClick={handleNext} disabled={flashcards.length <= 1 || isAnimatingFlip}>
            Next <ChevronRight />
          </Button>
        </div>
         <div className="mt-4 w-full">
            <Button onClick={onGenerateMore} disabled={isGeneratingMore || isAnimatingFlip} className="w-full bg-primary hover:bg-primary/90">
              {isGeneratingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating More...
                </>
              ) : (
                <>
                  <Shuffle className="mr-2 h-4 w-4" />
                  Generate New Set
                </>
              )}
            </Button>
          </div>
      </CardContent>
      <style jsx global>{`
        .preserve-3d {
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </Card>
  );
}
