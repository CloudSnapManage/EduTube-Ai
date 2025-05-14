
"use client";

import * as React from "react";
import type { QuizQuestion, GenerateQuizOutput } from "@/ai/flows/generate-quiz";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Lightbulb, HelpCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizDisplayProps {
  quizData: GenerateQuizOutput;
  onRetakeQuiz: () => void; // Callback to allow re-generating/re-taking the quiz
}

interface UserAnswer {
  questionIndex: number;
  answer: string;
  isCorrect?: boolean;
}

export function QuizDisplay({ quizData, onRetakeQuiz }: QuizDisplayProps) {
  const [userAnswers, setUserAnswers] = React.useState<Record<number, string>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [score, setScore] = React.useState(0);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmit = () => {
    let currentScore = 0;
    quizData.questions.forEach((q, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer) {
        if (q.type === "fill-in-the-blank") {
          if (userAnswer.trim().toLowerCase() === q.correctAnswer.toLowerCase()) {
            currentScore++;
          }
        } else {
          if (userAnswer === q.correctAnswer) {
            currentScore++;
          }
        }
      }
    });
    setScore(currentScore);
    setSubmitted(true);
  };

  const handleTryAgain = () => {
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
    // Optionally call onRetakeQuiz if we want to re-fetch a new quiz from AI
    // For now, just resets the current quiz instance
  };

  const getFillInTheBlankParts = (questionText: string) => {
    return questionText.split("____");
  };

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const userAnswer = userAnswers[index];
    const isCorrect = submitted && userAnswer && (
      question.type === "fill-in-the-blank"
        ? userAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase()
        : userAnswer === question.correctAnswer
    );

    return (
      <Card key={index} className={cn("mb-6 shadow-md rounded-lg overflow-hidden", submitted && (isCorrect ? "border-green-500" : "border-red-500"))}>
        <CardHeader className={cn("pb-4", submitted && (isCorrect ? "bg-green-500/10" : "bg-red-500/10"))}>
          <CardTitle className="text-lg font-medium flex items-start">
            <HelpCircle className="mr-2 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            Question {index + 1}: <span className="ml-2 font-normal">{question.questionText.includes("____") ? getFillInTheBlankParts(question.questionText)[0] + "..." : question.questionText}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {question.type === "multiple-choice" && (
            <RadioGroup
              value={userAnswer}
              onValueChange={(value) => !submitted && handleAnswerChange(index, value)}
              disabled={submitted}
              className="space-y-2"
            >
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={option} id={`q${index}-option${optionIndex}`} />
                  <Label htmlFor={`q${index}-option${optionIndex}`} className={cn("cursor-pointer", submitted && option === question.correctAnswer && "text-green-600 font-semibold", submitted && option !== question.correctAnswer && userAnswer === option && "text-red-600")}>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          {question.type === "true-false" && (
            <RadioGroup
              value={userAnswer}
              onValueChange={(value) => !submitted && handleAnswerChange(index, value)}
              disabled={submitted}
              className="space-y-2"
            >
              {["True", "False"].map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={option} id={`q${index}-option${optionIndex}`} />
                  <Label htmlFor={`q${index}-option${optionIndex}`} className={cn("cursor-pointer", submitted && option === question.correctAnswer && "text-green-600 font-semibold", submitted && option !== question.correctAnswer && userAnswer === option && "text-red-600")}>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          {question.type === "fill-in-the-blank" && (
            <div className="flex items-center space-x-2">
              {getFillInTheBlankParts(question.questionText)[0]}
              <Input
                type="text"
                value={userAnswer || ""}
                onChange={(e) => !submitted && handleAnswerChange(index, e.target.value)}
                disabled={submitted}
                className={cn("w-auto min-w-[100px] inline-block mx-1 px-2 py-1 h-8 border-b-2 focus:border-primary bg-transparent", submitted && (isCorrect ? "border-green-500" : "border-red-500"))}
                placeholder="Your answer"
              />
              {getFillInTheBlankParts(question.questionText)[1]}
            </div>
          )}

          {submitted && (
            <div className="mt-4 p-3 rounded-md bg-muted/50">
              {isCorrect ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Correct!
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <XCircle className="mr-2 h-5 w-5" /> Incorrect.
                </div>
              )}
              <p className="text-sm mt-1">
                Correct Answer: <span className="font-semibold">{question.correctAnswer}</span>
              </p>
              {question.explanation && (
                <div className="mt-2 text-sm text-muted-foreground flex items-start">
                  <Lightbulb className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-500" />
                  Explanation: {question.explanation}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Quiz Error</AlertTitle>
        <AlertDescription>No quiz questions found or quiz data is invalid.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center text-2xl font-semibold">
           {/* Using an inline SVG for a brain/quiz icon if Brain from lucide is not suitable */}
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-primary"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1.167A4.002 4.002 0 0 1 15 9.5V10h1a2 2 0 0 1 2 2v1.5a2.5 2.5 0 0 1-2.5 2.5h-1.333A4.002 4.002 0 0 1 12 19.833V21.5A2.5 2.5 0 0 1 9.5 24h-.083A2.5 2.5 0 0 1 7 21.5v-1.667a4.002 4.002 0 0 1-3-3.833V16h-1a2 2 0 0 1-2-2v-1.5A2.5 2.5 0 0 1 3.5 10h1.333A4.002 4.002 0 0 1 8 6.167V4.5A2.5 2.5 0 0 1 10.5 2h.083Z"/><path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>
          {quizData.quizTitle || "Test Your Knowledge"}
        </CardTitle>
        <CardDescription className="text-base">
          Answer the questions below to check your understanding.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {quizData.questions.map(renderQuestion)}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-6 border-t bg-muted/20">
        {!submitted ? (
          <Button onClick={handleSubmit} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
            Submit Quiz
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <Alert className={cn("flex-grow", score / quizData.questions.length >= 0.7 ? "border-green-500 bg-green-500/10 text-green-700" : "border-amber-500 bg-amber-500/10 text-amber-700")}>
              <AlertTitle className="font-semibold">Quiz Complete!</AlertTitle>
              <AlertDescription>
                You scored {score} out of {quizData.questions.length}.
                ({Math.round((score / quizData.questions.length) * 100)}%)
              </AlertDescription>
            </Alert>
            <div className="flex gap-2 mt-4 sm:mt-0">
                 <Button onClick={handleTryAgain} variant="outline" className="w-full sm:w-auto">
                    <RotateCcw className="mr-2 h-4 w-4" /> Try Again
                </Button>
                 <Button onClick={onRetakeQuiz} variant="secondary" className="w-full sm:w-auto">
                    <HelpCircle className="mr-2 h-4 w-4" /> Generate New Quiz
                </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
