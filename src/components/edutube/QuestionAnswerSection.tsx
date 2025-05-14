
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
import { Loader2, AlertTriangle, MessageCircleQuestion, Send, RefreshCw } from "lucide-react";
import { LoadingSpinner } from "@/components/edutube/LoadingSpinner";
import { askQuestionAboutSummary, type AnswerUserQuestionInput } from "@/app/actions"; // Added AnswerUserQuestionInput type
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
  question: string;
  answer: string;
}

export function QuestionAnswerSection({ videoSummary }: QuestionAnswerSectionProps) {
  const [qaPairs, setQaPairs] = React.useState<QAPair[]>([]);
  const [isLoadingAnswer, setIsLoadingAnswer] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

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
    // Don't clear previous Q&A, append to it
    // setCurrentQA(null); 

    const conversationHistory: AnswerUserQuestionInput['conversationHistory'] = qaPairs.map(pair => ({
      question: pair.question,
      answer: pair.answer,
    }));

    const result = await askQuestionAboutSummary(videoSummary, data.userQuestion, conversationHistory);

    if (result.error || !result.answer) {
      setError(result.error || "An unknown error occurred while fetching the answer.");
      toast({
        title: "Error Getting Answer",
        description: result.error || "Failed to get an answer.",
        variant: "destructive",
      });
    } else {
      setQaPairs(prevPairs => [...prevPairs, { question: data.userQuestion, answer: result.answer! }]);
      toast({
        title: "Answer Ready!",
        description: "Your question has been answered.",
        className: "bg-primary text-primary-foreground",
      });
      form.reset(); // Reset form after successful submission for a new question
    }

    setIsLoadingAnswer(false);
  };
  
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
    // Don't render the component if there's no summary yet
    return null; 
  }

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <CardTitle className="flex items-center text-2xl">
              <MessageCircleQuestion className="mr-2 h-6 w-6 text-primary" />
              Ask a Question
            </CardTitle>
            <CardDescription>Get detailed answers about the video content. The AI will use the summary and conversation context.</CardDescription>
          </div>
          {qaPairs.length > 0 && (
            <Button onClick={handleResetConversation} variant="outline" size="sm" disabled={isLoadingAnswer}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear Chat
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleQuestionSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userQuestion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Question</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your question here... (e.g., 'Can you explain the main argument in more detail?')"
                      className="resize-none"
                      {...field}
                      rows={3}
                      disabled={isLoadingAnswer}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoadingAnswer || !videoSummary} className="w-full sm:w-auto">
              {isLoadingAnswer ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Answer...
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

        {isLoadingAnswer && qaPairs.length === 0 && ( // Only show general spinner if no QAs yet
          <LoadingSpinner message="The AI is thinking... please wait for your answer." className="mt-6" />
        )}
        
        {error && !isLoadingAnswer && ( // Show error if it exists and not loading
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Question Answering Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {qaPairs.length > 0 && (
          <div className="mt-6 space-y-6">
            <h3 className="text-xl font-semibold">Conversation Thread:</h3>
            <ScrollArea className="h-[500px] w-full rounded-md border p-4 bg-secondary/20">
              {qaPairs.map((qa, index) => (
                <React.Fragment key={index}>
                  <Card className="mb-4 bg-background shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary">Your Question:</CardTitle>
                      <CardDescription className="text-base pt-1 text-foreground">{qa.question}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold mb-1 text-lg text-accent">AI's Answer:</h4>
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">{qa.answer}</pre>
                    </CardContent>
                  </Card>
                  {index < qaPairs.length -1 && <Separator className="my-6"/>}
                </React.Fragment>
              ))}
               {isLoadingAnswer && ( // Show spinner at the end of thread if loading next answer
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                    <p className="text-muted-foreground">Getting next answer...</p>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
