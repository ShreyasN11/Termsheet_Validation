
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ZoomIn, 
  ZoomOut, 
  MoveHorizontal, 
  RotateCw, 
  Download,
  PanelLeftClose,
  PanelTopClose
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  document: any;
}

export default function DocumentViewer({ document }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [splitView, setSplitView] = useState<'horizontal' | 'vertical'>('horizontal');
  const [activeTab, setActiveTab] = useState('split');
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = document.url;
    link.download = document.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSplitView = () => {
    setSplitView(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  };

  // Function to render highlighted text
  const renderHighlightedText = () => {
    if (!document.extractedText || !document.highlightedTerms?.length) {
      return <p className="whitespace-pre-line">{document.extractedText}</p>;
    }

    const text = document.extractedText;
    let lastIndex = 0;
    const result = [];

    // Sort highlightedTerms by start position
    const sortedTerms = [...document.highlightedTerms].sort((a, b) => 
      a.position.start - b.position.start
    );

    for (const term of sortedTerms) {
      const { start, end } = term.position;
      
      // Add text before the highlight
      if (start > lastIndex) {
        result.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, start)}
          </span>
        );
      }
      
      // Add highlighted text
      result.push(
        <span 
          key={`highlight-${start}`} 
          className="bg-finance-accent/20 text-finance-highlight px-0.5 rounded"
          title={`${term.term}: ${term.value}`}
        >
          {text.substring(start, end)}
        </span>
      );
      
      lastIndex = end;
    }
    
    // Add remaining text after last highlight
    if (lastIndex < text.length) {
      result.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }
    
    return <p className="whitespace-pre-line">{result}</p>;
  };

  const renderDocumentContent = () => {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold truncate flex-1">
            {document.name}
          </h2>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
              <ZoomOut size={18} />
            </Button>
            <Button 
              variant="ghost" 
              className="text-xs w-14" 
              onClick={handleResetZoom}
            >
              {Math.round(zoom * 100)}%
            </Button>
            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
              <ZoomIn size={18} />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleSplitView}>
              {splitView === 'horizontal' ? (
                <PanelLeftClose size={18} />
              ) : (
                <PanelTopClose size={18} />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownload}>
              <Download size={18} />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList>
            <TabsTrigger value="split">Split View</TabsTrigger>
            <TabsTrigger value="original">Original</TabsTrigger>
            <TabsTrigger value="extracted">Extracted Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="split" className="flex-1 h-full">
            <div 
              className={cn(
                "flex h-full gap-4 mt-2",
                splitView === 'horizontal' ? 'flex-col' : 'flex-row'
              )}
            >
              <div className="flex-1 overflow-auto bg-muted/20 rounded-md p-2">
                {document.url.includes('placeholder.svg') ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img 
                      src={document.url} 
                      alt="Document Preview Placeholder" 
                      className="max-w-full max-h-full object-contain"
                      style={{ transform: `scale(${zoom})` }}
                    />
                  </div>
                ) : (
                  <iframe 
                    src={document.url} 
                    title={document.name}
                    className="w-full h-full"
                    style={{ transform: `scale(${zoom})` }}
                  />
                )}
              </div>
              
              <div className="flex-1 overflow-auto bg-muted/10 rounded-md p-4">
                <h3 className="font-medium text-sm mb-2 text-muted-foreground">
                  Extracted Financial Terms
                </h3>
                <div className="space-y-3 mb-4">
                  {document.highlightedTerms?.map((term: any, index: number) => (
                    <div 
                      key={index}
                      className="bg-muted/20 rounded p-2 flex justify-between"
                    >
                      <span className="font-medium">{term.term}</span>
                      <span className="text-finance-highlight">{term.value}</span>
                    </div>
                  ))}
                  
                  {(!document.highlightedTerms || document.highlightedTerms.length === 0) && (
                    <div className="text-center py-4 text-muted-foreground">
                      No financial terms extracted
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="font-medium text-sm mb-2 text-muted-foreground">
                  Full Extracted Text
                </h3>
                <div className="bg-muted/10 rounded p-3 max-h-64 overflow-y-auto">
                  {renderHighlightedText()}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="original" className="h-full">
            <div className="bg-muted/20 rounded-md p-2 h-full mt-2">
              {document.url.includes('placeholder.svg') ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src={document.url} 
                    alt="Document Preview" 
                    className="max-w-full max-h-full object-contain"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>
              ) : (
                <iframe 
                  src={document.url} 
                  title={document.name}
                  className="w-full h-full"
                  style={{ transform: `scale(${zoom})` }}
                />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="extracted" className="h-full">
            <div className="bg-muted/10 rounded-md p-4 h-full mt-2 overflow-y-auto">
              {renderHighlightedText()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <Card className="h-[calc(100vh-240px)]">
      <CardContent className="p-6 h-full">
        {renderDocumentContent()}
      </CardContent>
    </Card>
  );
}
