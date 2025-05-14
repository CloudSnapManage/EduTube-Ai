
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
import { Loader2, AlertTriangle, MessageCircleQuestion, Send } from "lucide-react"; // Changed icon here
import { LoadingSpinner } from "@/components/edutube/LoadingSpinner";
import { askQuestionAboutSummary } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area"; // Added missing import

const questionFormSchema = z.object({
  userQuestion: z.string().min(10, { message: "Question must be at least 10 characters long." }).max(500, { message: "Question must be 500 characters or less."}),
});
type QuestionFormValues = z.infer<typeof questionFormSchema>;

interface QuestionAnswerSectionProps {
  videoSummary: string | null;
}

export function QuestionAnswerSection({ videoSummary }: QuestionAnswerSectionProps) {
  const [currentQA, setCurrentQA] = React.useState<{ question: string; answer: string } | null>(null);
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
    setCurrentQA(null); // Clear previous Q&A

    const result = await askQuestionAboutSummary(videoSummary, data.userQuestion);

    if (result.error || !result.answer) {
      setError(result.error || "An unknown error occurred while fetching the answer.");
      toast({
        title: "Error Getting Answer",
        description: result.error || "Failed to get an answer.",
        variant: "destructive",
      });
    } else {
      setCurrentQA({ question: data.userQuestion, answer: result.answer });
      toast({
        title: "Answer Ready!",
        description: "Your question has been answered.",
        className: "bg-primary text-primary-foreground",
      });
    }

    setIsLoadingAnswer(false);
    // form.reset(); // Optionally reset form, or let user edit their question
  };

  if (!videoSummary) {
    // Don't render the component if there's no summary yet
    return null; 
  }

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <MessageCircleQuestion className="mr-2 h-6 w-6 text-primary" /> {/* Changed icon here */}
          Ask a Question
        </CardTitle>
        <CardDescription>Get detailed answers about the video content based on its summary. The AI will use only the information from the summary.</CardDescription>
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
                      placeholder="Type your question here..."
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

        {isLoadingAnswer && (
          <LoadingSpinner message="The AI is thinking... please wait for your answer." className="mt-6" />
        )}
        
        {error && !isLoadingAnswer && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Question Answering Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentQA && !isLoadingAnswer && (
          <Card className="mt-6 bg-secondary/50">
            <CardHeader>
              <CardTitle className="text-lg">Your Question:</CardTitle>
              <CardDescription className="text-base pt-1">{currentQA.question}</CardDescription>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-1 text-lg">Answer:</h4>
              <ScrollArea className="h-60 w-full rounded-md border p-4 bg-background">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{currentQA.answer}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
