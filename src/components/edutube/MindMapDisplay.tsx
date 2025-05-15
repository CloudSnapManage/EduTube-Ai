
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Network } from "lucide-react"; // Or Workflow, GitFork

interface MindMapDisplayProps {
  outline: string;
}

export function MindMapDisplay({ outline }: MindMapDisplayProps) {
  if (!outline) {
    return null; 
  }

  // Basic Markdown-to-HTML for hierarchical lists (hyphens/asterisks and indentation)
  // This is a simplified renderer. For full Markdown, a library would be better.
  const renderMarkdownList = (markdown: string) => {
    const lines = markdown.split('\n');
    let html = '<ul>';
    let currentLevel = 0;

    lines.forEach(line => {
      const trimmedLine = line.trimStart();
      const match = trimmedLine.match(/^(\s*)[-*+]\s+(.*)/);
      if (match) {
        const indentation = match[1].length; // Approximation of level based on spaces
        const itemText = match[2];
        const level = Math.floor(indentation / 2); // Assuming 2 spaces per indent level

        if (level > currentLevel) {
          for (let i = 0; i < (level - currentLevel); i++) html += '<ul>';
        } else if (level < currentLevel) {
          for (let i = 0; i < (currentLevel - level); i++) html += '</ul></li>';
        } else if (currentLevel > 0 && level === currentLevel) {
            html += '</li>'; // Close previous item at same level
        }
        
        html += `<li>${itemText}`;
        currentLevel = level;
      } else if (trimmedLine) { // Non-list item, just append (could be improved)
         if (currentLevel > 0) { // Close any open lists if we encounter non-list text
            for (let i = 0; i < currentLevel; i++) html += '</ul></li>';
            currentLevel = 0;
         }
         html += `</ul><p>${trimmedLine}</p><ul>`; // Wrap non-list text in p, restart ul for safety
      }
    });

    for (let i = 0; i < currentLevel; i++) html += '</ul></li>'; // Close any remaining open tags
    html += '</ul>';
    
    // Remove empty <ul></ul> if nothing was rendered
    if(html === "<ul></ul>" || html === "<ul><ul></ul></li></ul>" ) return "<p class='text-muted-foreground'>Outline format not recognized or empty.</p>"
    return html;
  };


  return (
    <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center text-2xl font-semibold">
          <Network className="mr-3 h-7 w-7 text-primary" />
          Conceptual Outline (Mind Map)
        </CardTitle>
        <CardDescription className="text-base">A hierarchical text representation of the video's structure.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-80 w-full rounded-md border p-4 bg-background">
          <div 
            className="prose prose-sm max-w-none prose-ul:my-1 prose-li:my-0.5 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: renderMarkdownList(outline) }} 
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
