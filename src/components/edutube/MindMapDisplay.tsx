
"use client";

import * as React from "react";
import mermaid from "mermaid";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Network, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MindMapDisplayProps {
  mermaidSyntax: string;
}

// Generate a unique ID for each instance of the component
let mindmapIdCounter = 0;
const generateMindmapId = () => `mermaid-mindmap-${mindmapIdCounter++}`;

export function MindMapDisplay({ mermaidSyntax }: MindMapDisplayProps) {
  const [svg, setSvg] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const mindmapContainerId = React.useMemo(() => generateMindmapId(), []);
  const { toast } = useToast();

  React.useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      // securityLevel: 'loose', // Uncomment if you face issues with complex diagrams, but be aware of security implications.
      mindmap: {
        padding: 15,
        maxGrowth: 4,
      },
      fontFamily: "var(--font-geist-sans)", // Use app's font if possible
    });

    const renderMermaid = async () => {
      if (mermaidSyntax && mermaidSyntax.trim().startsWith("mindmap")) {
        try {
          // Mermaid's render function needs a unique ID for the container
          // It will directly manipulate the DOM element with this ID.
          // To get the SVG string, we use a temporary invisible div.
          const tempDiv = document.createElement('div');
          tempDiv.style.visibility = 'hidden';
          tempDiv.id = `temp-${mindmapContainerId}`;
          document.body.appendChild(tempDiv);

          const { svg: renderedSvg, bindFunctions } = await mermaid.render(tempDiv.id, mermaidSyntax);
          setSvg(renderedSvg);
          setError(null);
          
          document.body.removeChild(tempDiv); // Clean up the temporary div

        } catch (e: any) {
          console.error("Mermaid rendering error:", e);
          setError(`Failed to render mind map: ${e.message || "Invalid Mermaid syntax"}. Please try regenerating.`);
          setSvg(null);
          toast({
            title: "Mind Map Rendering Error",
            description: `Could not display the mind map. The AI might have generated invalid syntax. Error: ${e.message}`,
            variant: "destructive",
            duration: 7000,
          });
        }
      } else if (mermaidSyntax) {
         setError("Invalid or empty Mermaid syntax provided for mind map.");
         setSvg(null);
      }
    };

    renderMermaid();
    
    // Re-render if theme changes
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          mermaid.initialize({
            startOnLoad: false,
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
            mindmap: { padding: 15, maxGrowth: 4 },
            fontFamily: "var(--font-geist-sans)",
          });
          renderMermaid(); // Re-render with new theme
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
      // Clean up any temporary divs if component unmounts during an error state
      const tempDiv = document.getElementById(`temp-${mindmapContainerId}`);
      if (tempDiv) document.body.removeChild(tempDiv);
    };

  }, [mermaidSyntax, mindmapContainerId, toast]);

  if (!mermaidSyntax && !error) {
    return null; 
  }

  return (
    <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center text-2xl font-semibold">
          <Network className="mr-3 h-7 w-7 text-primary" />
          Conceptual Mind Map
        </CardTitle>
        <CardDescription className="text-base">A graphical representation of the video's structure. May require regeneration if syntax is invalid.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Rendering Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <ScrollArea className="h-[500px] w-full rounded-md border p-2 bg-background flex items-center justify-center">
          {svg ? (
            // The container for the SVG. Mermaid directly injects into this.
            // For safety with dangerouslySetInnerHTML, ensure the SVG content is trusted.
            <div
              className="mermaid-mindmap-container flex justify-center items-center w-full h-full [&_svg]:max-w-full [&_svg]:max-h-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : !error ? (
            <p className="text-muted-foreground">Generating mind map visualization...</p>
          ) : null}
        </ScrollArea>
         {mermaidSyntax && !svg && !error && (
            <div className="text-center py-4">
                <p className="text-muted-foreground">Loading mind map visualization...</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
