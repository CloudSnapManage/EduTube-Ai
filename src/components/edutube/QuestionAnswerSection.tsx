
"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, MessageCircleQuestion, Send, RefreshCw, Sparkles } from "lucide-react";
import { LoadingSpinner } from "@/components/edutube/LoadingSpinner";
import { askQuestionAboutSummary, type AnswerUserQuestionInput } from "@/app/actions"; 
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const questionFormSchema = z.object({
  userQuestion: z.string().min(10, { message: "Question must be at least 10 characters long." }).max(500, { message: "Question must be 500 characters or less."}),
});
type QuestionFormValues = z.infer<typeof questionFormSchema>;

interface QuestionAnswerSectionProps {
  videoSummary: string | null;
}

interface QAPair {
  id: string;
  question: string;
  answer: string;
}

export function QuestionAnswerSection({ videoSummary }: QuestionAnswerSectionProps) {
  const [qaPairs, setQaPairs] = React.useState<QAPair[]>([]);
  const [isLoadingAnswer, setIsLoadingAnswer] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);


  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: { userQuestion: "" },
  });

  const handleQuestionSubmit: SubmitHandler<QuestionFormValues> = async (data) => {
    if (!videoSummary) {
      setError("Cannot ask a question without a video summary being generated first.");
      toast({ title: "Error", description: "Please generate a video summary before asking questions.", variant: "destructive" });
      return;
    }
    setIsLoadingAnswer(true);
    setError(null);
    
    const conversationHistory: AnswerUserQuestionInput['conversationHistory'] = qaPairs.map(pair => ({
      question: pair.question,
      answer: pair.answer,
    }));

    const result = await askQuestionAboutSummary(videoSummary, data.userQuestion, conversationHistory);

    if (result.error || !result.answer) {
      setError(result.error || "An unknown error occurred while fetching the answer.");
      toast({
        title: "😕 Error Getting Answer",
        description: result.error || "Failed to get an answer. Please try rephrasing or ask another question.",
        variant: "destructive",
      });
    } else {
      setQaPairs(prevPairs => [...prevPairs, { id: Date.now().toString(), question: data.userQuestion, answer: result.answer! }]);
      toast({
        title: "💡 Answer Ready!",
        description: "Your question has been answered by the AI.",
        className: "bg-primary text-primary-foreground",
      });
      form.reset(); 
    }

    setIsLoadingAnswer(false);
  };
  
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [qaPairs]);


  const handleResetConversation = () => {
    setQaPairs([]);
    form.reset();
    setError(null);
    toast({
      title: "Conversation Cleared",
      description: "You can now start a new line of questioning.",
    });
  };


  if (!videoSummary) {
    return null; 
  }

  return (
    <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <CardTitle className="flex items-center text-2xl font-semibold">
              <MessageCircleQuestion className="mr-3 h-7 w-7 text-primary" />
              Ask AI About The Video
            </CardTitle>
            <CardDescription className="text-base">Get detailed answers based on the video's summary. Context from this chat is remembered.</CardDescription>
          </div>
          {qaPairs.length > 0 && (
            <Button onClick={handleResetConversation} variant="outline" size="sm" disabled={isLoadingAnswer} className="whitespace-nowrap">
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear Chat
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleQuestionSubmit)} className="space-y-4 mb-6">
            <FormField
              control={form.control}
              name="userQuestion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-md">Your Question:</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Can you explain the concept of X in more detail?' or 'What were the main arguments for Y?'"
                      className="resize-none bg-background focus:border-primary"
                      {...field}
                      rows={4}
                      disabled={isLoadingAnswer}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoadingAnswer || !videoSummary} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              {isLoadingAnswer ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI is Thinking...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Ask Question
                </>
              )}
            </Button>
          </form>
        </Form>
        
        {error && !isLoadingAnswer && ( 
          <Alert variant="destructive" className="mt-6 shadow-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Question Answering Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {qaPairs.length > 0 && (
          <div className="mt-6 space-y-6">
            <h3 className="text-xl font-semibold text-primary flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-accent" />
              Conversation Thread:
            </h3>
            <ScrollArea className="h-[500px] w-full rounded-lg border p-1 bg-muted/20" ref={scrollAreaRef}>
              <div className="p-3 space-y-4">
                {qaPairs.map((qa, index) => (
                  <React.Fragment key={qa.id}>
                    <Card className="bg-background shadow-md rounded-lg overflow-hidden">
                      <CardHeader className="bg-secondary/40 p-4">
                        <CardTitle className="text-md font-medium text-foreground">You asked:</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-foreground/90">{qa.question}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/5 shadow-md rounded-lg overflow-hidden border-primary/30">
                       <CardHeader className="bg-primary/10 p-4">
                        <CardTitle className="text-md font-medium text-primary flex items-center">
                          <Sparkles className="mr-2 h-4 w-4 text-accent" /> AI Answered:
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground/90">{qa.answer}</pre>
                      </CardContent>
                    </Card>
                    {index < qaPairs.length -1 && <Separator className="my-6 bg-border/50"/>}
                  </React.Fragment>
                ))}
                 {isLoadingAnswer && ( 
                  <div className="flex items-center justify-center p-6">
                      <Loader2 className="mr-3 h-6 w-6 animate-spin text-primary" />
                      <p className="text-muted-foreground text-md">Getting AI's brilliant answer...</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
         {qaPairs.length === 0 && !isLoadingAnswer && !error && (
          <div className="text-center py-10">
            <MessageCircleQuestion className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Ask your first question about the video summary above!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
