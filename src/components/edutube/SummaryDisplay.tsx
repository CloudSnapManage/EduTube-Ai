
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, Volume2, PauseCircle, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SummaryDisplayProps {
  summary: string;
}

export function SummaryDisplay({ summary }: SummaryDisplayProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [utterance, setUtterance] = React.useState<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    // Cleanup speech synthesis on component unmount or when summary changes
    return () => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    };
  }, [summary]);

  const handleTextToSpeech = () => {
    if (!summary) return;

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast({ title: "Text-to-Speech Error", description: "Your browser does not support speech synthesis.", variant: "destructive" });
      return;
    }

    if (isPlaying && utterance) { // If playing, this button becomes "Pause"
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else if (!isPlaying && utterance && window.speechSynthesis.paused) { // If paused, this button becomes "Resume"
      window.speechSynthesis.resume();
      setIsPlaying(true);
    } else { // Start new speech
      if (window.speechSynthesis.speaking) { // Stop any current speech before starting new
        window.speechSynthesis.cancel();
      }
      
      const newUtterance = new SpeechSynthesisUtterance(summary);
      newUtterance.onstart = () => {
        setIsPlaying(true);
      };
      newUtterance.onend = () => {
        setIsPlaying(false);
        setUtterance(null);
      };
      newUtterance.onerror = (event) => {
        console.error("SpeechSynthesisUtterance.onerror event object:", event);
        const errorMessage = typeof event.error === 'string' ? event.error : "An unknown speech error occurred.";
        toast({ title: "Speech Error", description: `Could not read summary: ${errorMessage}`, variant: "destructive" });
        setIsPlaying(false);
        setUtterance(null);
      };
      setUtterance(newUtterance);
      window.speechSynthesis.speak(newUtterance);
    }
  };

  const handleStopSpeech = () => {
     if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setUtterance(null);
  };


  return (
    <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center text-2xl font-semibold">
                <FileText className="mr-3 h-7 w-7 text-primary" />
                Video Summary
                </CardTitle>
                <CardDescription className="text-base">Key points and topics covered in the video.</CardDescription>
            </div>
            <div className="flex space-x-2">
                <Button onClick={handleTextToSpeech} variant="outline" size="sm" disabled={!summary}>
                    {isPlaying && utterance ? <PauseCircle className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
                    {isPlaying && utterance ? "Pause" : (utterance && window.speechSynthesis && window.speechSynthesis.paused ? "Resume" : "Read Aloud")}
                </Button>
                {isPlaying && utterance && (
                    <Button onClick={handleStopSpeech} variant="outline" size="sm" >
                        <StopCircle className="mr-2 h-4 w-4" />
                        Stop
                    </Button>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-60 w-full rounded-md border p-4 bg-background">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{summary}</p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
