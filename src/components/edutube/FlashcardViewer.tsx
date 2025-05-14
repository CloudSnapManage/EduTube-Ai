"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCcw, Lightbulb, CheckCircle2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardViewerProps {
  flashcards: Flashcard[];
}

export function FlashcardViewer({ flashcards }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isFlipping, setIsFlipping] = React.useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <BookOpen className="mr-2 h-6 w-6 text-primary" />
            Flashcards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No flashcards generated.</p>
        </CardContent>
      </Card>
    );
  }

  const currentFlashcard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  const handleFlip = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setIsFlipped(!isFlipped);
      setIsFlipping(false);
    }, 150); // Half of the animation duration
  };

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-2xl">
          <div className="flex items-center">
            <BookOpen className="mr-2 h-6 w-6 text-primary" />
            Flashcards
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {currentIndex + 1} / {flashcards.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div
          className={cn(
            "w-full h-64 p-6 border rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-transform duration-300 ease-in-out relative perspective",
            isFlipping ? "animate-pulse" : "", // Temporary visual feedback during flip state change
          )}
          onClick={handleFlip}
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front of the card (Question) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-card rounded-lg backface-hidden">
            <Lightbulb className="h-8 w-8 mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2">Question:</h3>
            <p className="text-base">{currentFlashcard.question}</p>
          </div>
          {/* Back of the card (Answer) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-card rounded-lg backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
            <CheckCircle2 className="h-8 w-8 mb-4 text-accent" />
            <h3 className="text-lg font-semibold mb-2">Answer:</h3>
            <p className="text-base">{currentFlashcard.answer}</p>
          </div>
        </div>

        <div className="mt-6 flex w-full justify-between items-center">
          <Button variant="outline" onClick={handlePrev} disabled={flashcards.length <= 1}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button variant="ghost" onClick={handleFlip} className="text-primary hover:text-primary/90">
            <RefreshCcw className="mr-2 h-4 w-4" /> Flip Card
          </Button>
          <Button variant="outline" onClick={handleNext} disabled={flashcards.length <= 1}>
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      <style jsx global>{`
        .perspective {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </Card>
  );
}
