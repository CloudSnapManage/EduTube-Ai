
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Network } from "lucide-react"; // AlertTriangle removed as specific error handling is simpler
import type { MindMapNode } from "@/ai/flows/generate-mindmap-outline";

interface MindMapDisplayProps {
  mindMapData: MindMapNode | null;
  targetLanguage?: string;
}

// Constants for layout
const NODE_BASE_WIDTH = 120; // Base width, will expand with text
const NODE_HEIGHT = 40;
const HORIZONTAL_SPACING = 40;
const VERTICAL_SPACING = 60;
const PADDING = 20;
const FONT_SIZE = 10; // For text within nodes
const CHAR_WIDTH_APPROX = FONT_SIZE * 0.6; // Approximate width of a character

interface SvgNode extends MindMapNode {
  x: number;
  y: number;
  visualWidth: number; // Visual width of the node rectangle
  children?: SvgNode[];
}

// Helper to calculate text width (client-side only)
const calculateNodeWidth = (text: string): number => {
  const maxLength = 30; // Max chars before truncating for width calculation
  const effectiveText = text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  const calculated = Math.max(NODE_BASE_WIDTH, effectiveText.length * CHAR_WIDTH_APPROX + 20); // +20 for padding
  return Math.min(calculated, 250); // Max width to prevent overly wide nodes
};


// Recursive function to layout the tree
// This is a very basic horizontal tree layout. Improvements would involve more sophisticated algorithms.
const layoutTree = (node: MindMapNode, depth = 0, startingX = PADDING): SvgNode => {
  const visualWidth = calculateNodeWidth(node.name);
  let currentX = startingX;
  
  // Position current node
  const svgNode: SvgNode = {
    ...node,
    x: currentX,
    y: depth * (NODE_HEIGHT + VERTICAL_SPACING) + PADDING,
    visualWidth: visualWidth,
    children: [],
  };

  if (node.children && node.children.length > 0) {
    // Calculate total width required by children for rudimentary centering
    const childrenTotalWidth = node.children.reduce((sum, child) => sum + calculateNodeWidth(child.name) + HORIZONTAL_SPACING, -HORIZONTAL_SPACING);
    let childStartX = svgNode.x + (svgNode.visualWidth / 2) - (childrenTotalWidth / 2);

    svgNode.children = node.children.map(child => {
      const childNode = layoutTree(child, depth + 1, childStartX);
      childStartX += childNode.visualWidth + HORIZONTAL_SPACING;
      return childNode;
    });

    // Adjust parent position to be centered above its children block
    if (svgNode.children.length > 0) {
        const firstChildX = svgNode.children[0].x;
        const lastChild = svgNode.children[svgNode.children.length - 1];
        const lastChildEndX = lastChild.x + lastChild.visualWidth;
        const childrenBlockMidpoint = firstChildX + (lastChildEndX - firstChildX) / 2;
        svgNode.x = Math.max(PADDING, childrenBlockMidpoint - svgNode.visualWidth / 2); // Ensure not less than PADDING
    }
  }
  return svgNode;
};


// Flatten tree to get all nodes for dimension calculation
const getAllNodes = (node: SvgNode): SvgNode[] => {
  let list: SvgNode[] = [node];
  if (node.children) {
    node.children.forEach(child => {
      list = list.concat(getAllNodes(child));
    });
  }
  return list;
};


export function MindMapDisplay({ mindMapData, targetLanguage = "English" }: MindMapDisplayProps) {
  const [laidOutTree, setLaidOutTree] = React.useState<SvgNode | null>(null);
  const [svgDimensions, setSvgDimensions] = React.useState({ width: 800, height: 600 });

  React.useEffect(() => {
    if (mindMapData) {
      const tree = layoutTree(mindMapData);
      setLaidOutTree(tree);

      const allNodes = getAllNodes(tree);
      if (allNodes.length > 0) {
        const maxX = Math.max(...allNodes.map(n => n.x + n.visualWidth)) + PADDING;
        const maxY = Math.max(...allNodes.map(n => n.y + NODE_HEIGHT)) + PADDING;
        setSvgDimensions({ width: Math.max(600, maxX), height: Math.max(400, maxY) });
      }
    } else {
      setLaidOutTree(null);
    }
  }, [mindMapData]);

  const renderSvgNodesRecursive = (node: SvgNode): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    const isRoot = node.y === PADDING;

    // Node Rectangle
    elements.push(
      <rect
        key={`rect-${node.name}-${node.x}-${node.y}`}
        x={node.x}
        y={node.y}
        width={node.visualWidth}
        height={NODE_HEIGHT}
        rx="5"
        className={isRoot ? "fill-primary stroke-primary-foreground/50" : "fill-card stroke-border"}
        strokeWidth="1"
      />
    );

    // Node Text (with tspan for basic line breaking if needed, though true wrapping is hard in SVG text)
    const words = node.name.split(' ');
    const lines = [];
    let currentLine = "";
    for (const word of words) {
        const testLine = currentLine ? currentLine + " " + word : word;
        if (calculateNodeWidth(testLine) < node.visualWidth -10 ) { // -10 for internal padding
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine);
    
    const lineHeight = FONT_SIZE + 2;
    const totalTextHeight = lines.length * lineHeight;
    const textStartY = (NODE_HEIGHT - totalTextHeight) / 2 + lineHeight * 0.75; // Adjusted for better vertical centering


    lines.forEach((line, i) => {
        elements.push(
            <text
                key={`text-${node.name}-${node.x}-${node.y}-line-${i}`}
                x={node.x + node.visualWidth / 2}
                y={node.y + textStartY + i * lineHeight}
                textAnchor="middle"
                className={`text-[${FONT_SIZE}px] ${isRoot ? "fill-primary-foreground" : "fill-card-foreground"} font-medium select-none pointer-events-none`}
            >
                {line}
            </text>
        );
    });


    // Lines to Children & Recursive Call
    if (node.children) {
      node.children.forEach(child => {
        elements.push(
          <line
            key={`line-to-${child.name}-${child.x}-${child.y}`}
            x1={node.x + node.visualWidth / 2}
            y1={node.y + NODE_HEIGHT}
            x2={child.x + child.visualWidth / 2}
            y2={child.y}
            className="stroke-muted-foreground/60"
            strokeWidth="1.5"
          />
        );
        elements.push(...renderSvgNodesRecursive(child));
      });
    }
    return elements;
  };

  if (!mindMapData) {
    return (
      <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center text-2xl font-semibold">
            <Network className="mr-3 h-7 w-7 text-primary" />
            Conceptual Mind Map
          </CardTitle>
          <CardDescription className="text-base">
            No mind map data generated or an error occurred.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (!laidOutTree) {
     return (
        <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
            <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center text-2xl font-semibold">
                    <Network className="mr-3 h-7 w-7 text-primary" />
                    Conceptual Mind Map ({targetLanguage})
                </CardTitle>
                 <CardDescription className="text-base">Processing mind map data for visualization...</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex justify-center items-center h-[400px]">
                 <p className="text-muted-foreground">Generating mind map visualization...</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center text-2xl font-semibold">
          <Network className="mr-3 h-7 w-7 text-primary" />
          Conceptual Mind Map ({targetLanguage})
        </CardTitle>
        <CardDescription className="text-base">
          A visual representation of the video's structure. Scroll to explore.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-[500px] w-full rounded-md border bg-background">
          <div className="p-4" style={{ minWidth: svgDimensions.width, minHeight: svgDimensions.height }}>
            <svg 
                width={svgDimensions.width} 
                height={svgDimensions.height} 
                viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
            >
              {renderSvgNodesRecursive(laidOutTree)}
            </svg>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
