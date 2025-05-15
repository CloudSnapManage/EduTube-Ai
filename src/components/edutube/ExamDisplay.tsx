
"use client";

import * as React from "react";
import type { GenerateExamOutput, ExamQuestion } from "@/ai/flows/generate-exam";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, BookOpenCheck } from "lucide-react";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

interface ExamDisplayProps {
  examData: GenerateExamOutput;
  videoTitle?: string; // Optional: for PDF filename
  targetLanguage?: string; // Optional: for PDF title
}

export function ExamDisplay({ examData, videoTitle = "EduTube Study Exam", targetLanguage = "English" }: ExamDisplayProps) {
  const { toast } = useToast();

  const handleDownloadPdf = () => {
    if (!examData || !examData.questions || examData.questions.length === 0) {
      toast({ title: "Error", description: "No exam data to download.", variant: "destructive" });
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const themePrimaryColor = "#2074d4"; // EduTube blue
    const themeWhiteColor = "#FFFFFF";
    const themeTextColor = "#333333";
    const themeMutedTextColor = "#555555";
    const themeLightGrayColor = "#f0f0f0";

    doc.setProperties({
      title: `${examData.examTitle} - EduTube AI (${targetLanguage})`,
      subject: `Exam Questions & Answers for ${videoTitle}`,
      author: 'EduTube AI',
      creator: 'EduTube AI'
    });

    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = 0;

    const addHeaderAndFooter = (isFirstPage = false, pageTitle = "") => {
      doc.setFillColor(themePrimaryColor);
      doc.rect(0, 0, pageWidth, margin + 5, 'F');
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(themeWhiteColor);
      doc.text("EduTube AI", margin, margin - 2);
      if (pageTitle) {
        doc.setFontSize(10);
        doc.text(pageTitle, pageWidth - margin, margin -2, { align: 'right' });
      }


      doc.setFillColor(themePrimaryColor);
      doc.rect(0, pageHeight - margin, pageWidth, margin, 'F');
      const pageNum = doc.getNumberOfPages();
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(themeWhiteColor);
      doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - (margin / 2) + 2, { align: 'right' });
    };

    // --- Cover Page / Title Section ---
    addHeaderAndFooter(true, "Exam Document");
    yPosition = margin + 25;

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(themePrimaryColor);
    const examTitleLines = doc.splitTextToSize(examData.examTitle, contentWidth);
    doc.text(examTitleLines, margin, yPosition);
    yPosition += (examTitleLines.length * 10) + 5;

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(themeMutedTextColor);
    const videoTitleCleaned = videoTitle.replace("EduTube Study Material for ", "");
    const videoTitleLines = doc.splitTextToSize(`Based on: ${videoTitleCleaned}`, contentWidth);
    doc.text(videoTitleLines, margin, yPosition);
    yPosition += (videoTitleLines.length * 6) + 5;
    
    doc.setFontSize(11);
    doc.setTextColor(themeTextColor);
    doc.text(`Language: ${targetLanguage}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Number of Questions: ${examData.questions.length}`, margin, yPosition);
    yPosition += 10;

    // --- Questions Section ---
    doc.addPage();
    addHeaderAndFooter(false, "Exam Questions");
    yPosition = margin + 15;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(themePrimaryColor);
    doc.text("Exam Questions", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(themeTextColor);
    doc.setLineHeightFactor(1.4);

    examData.questions.forEach((q, index) => {
      const questionNumberText = `${index + 1}. `;
      const questionTextLines = doc.splitTextToSize(q.questionText, contentWidth - doc.getTextWidth(questionNumberText) - 2);
      
      const requiredHeightForQuestion = questionTextLines.length * (11 * 0.352778 * 1.4) + 5; // 5 for spacing
      if (yPosition + requiredHeightForQuestion > pageHeight - (margin + 10)) {
        doc.addPage();
        yPosition = 0; addHeaderAndFooter(false, "Exam Questions"); yPosition = margin + 15;
        doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(themeTextColor); doc.setLineHeightFactor(1.4);
      }

      doc.setFont("helvetica", "bold");
      doc.text(questionNumberText, margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(questionTextLines, margin + doc.getTextWidth(questionNumberText) + 1, yPosition);
      yPosition += requiredHeightForQuestion;
    });

    // --- Model Answers Section ---
    doc.addPage();
    addHeaderAndFooter(false, "Model Answers");
    yPosition = margin + 15;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(themePrimaryColor);
    doc.text("Model Answers", margin, yPosition);
    yPosition += 10;
    
    doc.setLineHeightFactor(1.4);

    examData.questions.forEach((q, index) => {
      const questionNumberText = `${index + 1}. ${q.questionText}`;
      const answerText = `Answer: ${q.modelAnswer}`;
      
      const questionLines = doc.splitTextToSize(questionNumberText, contentWidth);
      const answerLines = doc.splitTextToSize(answerText, contentWidth - 5); // Indent answer slightly

      const requiredHeight = (questionLines.length + answerLines.length) * (11 * 0.352778 * 1.4) + 8; // 8 for spacing

      if (yPosition + requiredHeight > pageHeight - (margin + 10)) {
        doc.addPage();
        yPosition = 0; addHeaderAndFooter(false, "Model Answers"); yPosition = margin + 15;
        doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(themeTextColor); doc.setLineHeightFactor(1.4);
      }

      doc.setFont("helvetica", "bold");
      doc.text(questionLines, margin, yPosition);
      yPosition += questionLines.length * (11 * 0.352778 * 1.4) + 2;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(themeMutedTextColor);
      doc.text(answerLines, margin + 5, yPosition); // Indented answer
      yPosition += answerLines.length * (11 * 0.352778 * 1.4) + 6; // Extra space after answer
      doc.setTextColor(themeTextColor); // Reset text color
    });

    const safeVideoTitle = videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`EduTubeAI_Exam_${safeVideoTitle}_${targetLanguage}.pdf`);
    toast({ title: "📄 Exam PDF Downloaded!", description: "Your exam (questions & answers) has been saved." });
  };


  if (!examData || !examData.questions || examData.questions.length === 0) {
    return (
      <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center text-2xl font-semibold">
            <BookOpenCheck className="mr-3 h-7 w-7 text-primary" />
            Exam Questions
          </CardTitle>
          <CardDescription className="text-base">No exam questions generated.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center text-2xl font-semibold">
              <BookOpenCheck className="mr-3 h-7 w-7 text-primary" />
              {examData.examTitle || "Generated Exam"}
            </CardTitle>
            <CardDescription className="text-base">
              Review the questions below. You can download the full exam with questions and model answers as a PDF.
            </CardDescription>
          </div>
          <Button onClick={handleDownloadPdf} variant="outline" size="sm" className="whitespace-nowrap">
            <Download className="mr-2 h-4 w-4" />
            Download Exam (Q & A)
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-primary">Exam Questions:</h3>
        <ScrollArea className="h-96 w-full rounded-md border p-4 bg-background">
          <ol className="list-decimal list-inside space-y-5">
            {examData.questions.map((q, index) => (
              <li key={index} className="text-sm leading-relaxed">
                <span className="font-medium">{q.questionText}</span>
                {/* Model answers are not shown here, only in the PDF */}
              </li>
            ))}
          </ol>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-6 border-t bg-muted/10">
        <p className="text-xs text-muted-foreground">
            This exam was generated by AI based on the video content. Use the downloaded PDF to review model answers.
        </p>
      </CardFooter>
    </Card>
  );
}
