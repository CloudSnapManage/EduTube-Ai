
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, RefreshCcw, Lightbulb, CheckCircle2, BookOpen, Loader2, Shuffle, Edit3, Save, Trash2, PlusCircle, FileText, Sheet as CsvIcon, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Flashcard {
  id?: string; // Optional temporary ID for client-side keying
  question: string;
  answer: string;
}

interface FlashcardViewerProps {
  initialFlashcards: Flashcard[];
  onGenerateMore: () => Promise<void>;
  isGeneratingMore: boolean;
  videoTitle?: string;
}

export function FlashcardViewer({ initialFlashcards, onGenerateMore, isGeneratingMore, videoTitle = "flashcards" }: FlashcardViewerProps) {
  const [flashcards, setFlashcards] = React.useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isAnimatingFlip, setIsAnimatingFlip] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [editQuestion, setEditQuestion] = React.useState("");
  const [editAnswer, setEditAnswer] = React.useState("");
  const { toast } = useToast();

  React.useEffect(() => {
    // Initialize local flashcards with IDs for stable keying during editing
    setFlashcards(initialFlashcards.map((fc, index) => ({ ...fc, id: fc.id || `fc-${Date.now()}-${index}` })));
    setCurrentIndex(0);
    setIsFlipped(false);
    setEditingIndex(null);
  }, [initialFlashcards]);

  const handleNext = () => {
    if (isAnimatingFlip || editingIndex !== null) return;
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prevIndex) => (prevIndex + 1) % (flashcards.length || 1)), isFlipped ? 150 : 0);
  };

  const handlePrev = () => {
    if (isAnimatingFlip || editingIndex !== null) return;
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prevIndex) => (prevIndex - 1 + (flashcards.length || 1)) % (flashcards.length || 1)), isFlipped ? 150 : 0);
  };

  const handleFlip = () => {
    if (isAnimatingFlip || editingIndex !== null) return;
    setIsAnimatingFlip(true);
    setIsFlipped(!isFlipped);
    setTimeout(() => setIsAnimatingFlip(false), 500);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    // Ensure flashcards[index] exists, which it should if called from 'Edit Card' button
    if (flashcards[index]) {
      setEditQuestion(flashcards[index].question);
      setEditAnswer(flashcards[index].answer);
    } else {
      // Fallback, though this case should ideally not be hit if UI prevents editing non-existent cards
      setEditQuestion("");
      setEditAnswer("");
    }
    setIsFlipped(false); // Ensure card is on question side for editing
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditQuestion("");
    setEditAnswer("");
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    if (!editQuestion.trim() || !editAnswer.trim()) {
      toast({ title: "Error", description: "Question and Answer cannot be empty.", variant: "destructive" });
      return;
    }
    const updatedFlashcards = flashcards.map((fc, i) => 
      i === editingIndex ? { ...fc, question: editQuestion, answer: editAnswer } : fc
    );
    setFlashcards(updatedFlashcards);
    setEditingIndex(null);
    toast({ title: "Flashcard Updated", description: "Your changes have been saved locally." });
  };

  const deleteFlashcard = (indexToDelete: number) => {
    const updatedFlashcards = flashcards.filter((_, i) => i !== indexToDelete);
    setFlashcards(updatedFlashcards);
    if (currentIndex >= updatedFlashcards.length && updatedFlashcards.length > 0) {
      setCurrentIndex(updatedFlashcards.length - 1);
    } else if (updatedFlashcards.length === 0) {
      setCurrentIndex(0);
    }
    toast({ title: "Flashcard Deleted", description: "Flashcard removed from the current set." });
  };

  const addNewFlashcard = () => {
    const newCard: Flashcard = { id: `fc-${Date.now()}-${Math.random()}`, question: "", answer: "" };
    setFlashcards(prevFlashcards => {
      const updatedFlashcards = [...prevFlashcards, newCard];
      const newCardIndex = updatedFlashcards.length - 1;
      
      // Set all states needed for editing the new card
      setCurrentIndex(newCardIndex); 
      setEditingIndex(newCardIndex);
      setEditQuestion(newCard.question); // Will be ""
      setEditAnswer(newCard.answer);   // Will be ""
      setIsFlipped(false); // Ensure new card starts on question side and isn't flipped

      return updatedFlashcards; // Return the new array for React to update the state
    });
  };
  
  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  const exportToCSV = () => {
    if (flashcards.length === 0) {
      toast({ title: "No Flashcards", description: "There are no flashcards to export.", variant: "destructive" });
      return;
    }
    const header = "Question,Answer\n";
    const csvContent = flashcards.map(fc => `"${fc.question.replace(/"/g, '""')}","${fc.answer.replace(/"/g, '""')}"`).join("\n");
    downloadFile(`${videoTitle}_flashcards.csv`, header + csvContent, "text/csv;charset=utf-8;");
    toast({ title: "Exported to CSV", description: "Flashcards downloaded as CSV file." });
  };

  const exportToTXT = () => {
     if (flashcards.length === 0) {
      toast({ title: "No Flashcards", description: "There are no flashcards to export.", variant: "destructive" });
      return;
    }
    const txtContent = flashcards.map((fc, i) => `Card ${i + 1}:\nQuestion: ${fc.question}\nAnswer: ${fc.answer}\n\n`).join("");
    downloadFile(`${videoTitle}_flashcards.txt`, txtContent, "text/plain;charset=utf-8;");
    toast({ title: "Exported to TXT", description: "Flashcards downloaded as TXT file." });
  };


  if (initialFlashcards.length === 0 && flashcards.length === 0) {
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
          <p className="text-muted-foreground mb-4">It seems no flashcards were generated for this video yet, or you've cleared them.</p>
           <div className="space-y-3">
            <Button onClick={onGenerateMore} disabled={isGeneratingMore} className="w-full bg-primary hover:bg-primary/90">
              {isGeneratingMore ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Shuffle className="mr-2 h-4 w-4" /> Generate Flashcards from AI</>
              )}
            </Button>
            <Button onClick={addNewFlashcard} variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Blank Card
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const currentFlashcard = flashcards[currentIndex] || { id: 'empty', question: "No flashcards. Add one!", answer: "No flashcards. Add one!" };


  return (
    <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-2xl font-semibold">
            <BookOpen className="mr-3 h-7 w-7 text-primary" />
            Flashcards
          </CardTitle>
          {flashcards.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              {editingIndex === null ? `${currentIndex + 1} / ${flashcards.length}` : `Editing ${currentIndex +1}`}
            </span>
          )}
        </div>
         <CardDescription className="text-base">
           {editingIndex !== null ? "Edit the question and answer below." : "Click card to flip. Use buttons to navigate, edit, or generate more."}
         </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center p-6">
        {flashcards.length === 0 ? (
            <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">No flashcards. Add your first one or generate from AI.</p>
                 <div className="space-y-3">
                    <Button onClick={onGenerateMore} disabled={isGeneratingMore} className="w-full bg-primary hover:bg-primary/90">
                        {isGeneratingMore ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                        ) : (
                            <><Shuffle className="mr-2 h-4 w-4" /> Generate Flashcards from AI</>
                        )}
                    </Button>
                    <Button onClick={addNewFlashcard} variant="outline" className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Blank Card
                    </Button>
                 </div>
            </div>
        ) : editingIndex === currentIndex ? (
          <div className="w-full h-auto p-4 border rounded-lg flex flex-col space-y-4">
            <div>
              <label htmlFor="edit-question" className="block text-sm font-medium text-muted-foreground mb-1">Question:</label>
              <Textarea id="edit-question" value={editQuestion} onChange={(e) => setEditQuestion(e.target.value)} className="min-h-[80px] bg-background" />
            </div>
            <div>
              <label htmlFor="edit-answer" className="block text-sm font-medium text-muted-foreground mb-1">Answer:</label>
              <Textarea id="edit-answer" value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)} className="min-h-[80px] bg-background"/>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={cancelEditing}><XCircle className="mr-2 h-4 w-4" />Cancel</Button>
              <Button onClick={saveEdit} className="bg-primary hover:bg-primary/80"><Save className="mr-2 h-4 w-4" />Save Changes</Button>
            </div>
          </div>
        ) : (
          <div
            className="w-full h-72 p-6 border rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-transform duration-500 ease-in-out relative preserve-3d"
            onClick={handleFlip}
            style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-card rounded-lg backface-hidden">
              <Lightbulb className="h-10 w-10 mb-4 text-yellow-400" />
              <h3 className="text-xl font-semibold mb-3">Question:</h3>
              <p className="text-lg">{currentFlashcard.question}</p>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-accent/10 rounded-lg backface-hidden border border-accent" style={{ transform: 'rotateY(180deg)' }}>
              <CheckCircle2 className="h-10 w-10 mb-4 text-accent" />
              <h3 className="text-xl font-semibold mb-3">Answer:</h3>
              <p className="text-lg">{currentFlashcard.answer}</p>
            </div>
          </div>
        )}

        {flashcards.length > 0 && editingIndex === null && (
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
        )}
         <div className="mt-4 w-full space-y-3">
            {flashcards.length > 0 && editingIndex === null && (
                 <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => startEditing(currentIndex)} variant="secondary" disabled={isAnimatingFlip}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Card
                    </Button>
                    <Button onClick={() => deleteFlashcard(currentIndex)} variant="destructive" disabled={isAnimatingFlip}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Card
                    </Button>
                </div>
            )}
            <Button onClick={addNewFlashcard} variant="outline" className="w-full" disabled={isAnimatingFlip || editingIndex !== null}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Card
            </Button>
            <Button onClick={onGenerateMore} disabled={isGeneratingMore || isAnimatingFlip || editingIndex !== null} className="w-full bg-primary hover:bg-primary/90">
              {isGeneratingMore ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating More...</>
              ) : (
                <><Shuffle className="mr-2 h-4 w-4" /> Regenerate AI Set</>
              )}
            </Button>
             {flashcards.length > 0 && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button onClick={exportToCSV} variant="outline" className="w-full" disabled={isAnimatingFlip || editingIndex !== null}>
                        <CsvIcon className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    <Button onClick={exportToTXT} variant="outline" className="w-full" disabled={isAnimatingFlip || editingIndex !== null}>
                        <FileText className="mr-2 h-4 w-4" /> Export TXT
                    </Button>
                </div>
            )}
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
