import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  document: any;
}

function diffTerms(prevTerms: any[], currTerms: any[]) {
  const prevMap = new Map(prevTerms.map(t => [t.term, t.value]));
  const currMap = new Map(currTerms.map(t => [t.term, t.value]));
  const diffs = [];

  // Find added/changed terms
  currTerms.forEach(curr => {
    if (!prevMap.has(curr.term)) {
      diffs.push({ ...curr, type: "added" });
    } else if (prevMap.get(curr.term) !== curr.value) {
      diffs.push({ ...curr, prev: prevMap.get(curr.term), type: "changed" });
    }
  });

  // Find removed terms
  prevTerms.forEach(prev => {
    if (!currMap.has(prev.term)) {
      diffs.push({ ...prev, type: "removed" });
    }
  });

  return diffs;
}

export default function DocumentViewer({ document }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [splitView, setSplitView] = useState<'horizontal' | 'vertical'>('horizontal');
  const [activeTab, setActiveTab] = useState('document');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeVersion, setActiveVersion] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentVersion = document.versions[activeVersion];
  const previousVersion = activeVersion > 0 ? document.versions[activeVersion - 1] : null;
  const termDiffs = previousVersion ? diffTerms(previousVersion.highlightedTerms, currentVersion.highlightedTerms) : [];

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 2));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.5));
  const handleResetZoom = () => setZoom(1);

  const renderVersionTabs = () => (
    <Tabs value={String(activeVersion)} onValueChange={v => setActiveVersion(Number(v))}>
      <TabsList className="mb-4">
        {document.versions.map((v: any, idx: number) => (
          <TabsTrigger key={idx} value={String(idx)}>
            Version {idx + 1}
            <span className="ml-2 text-xs text-muted-foreground">
              {new Date(v.uploadDate).toLocaleDateString()}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );

  const renderDiffView = () => {
    if (!previousVersion) return <div className="text-muted-foreground">Initial version</div>;
    
    return (
      <div className="space-y-3">
        {termDiffs.map((diff, idx) => (
          <div key={idx} className="p-2 rounded-md bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="font-medium">{diff.term}</span>
              <span className={`text-sm ${
                diff.type === 'added' ? 'text-green-600' :
                diff.type === 'removed' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {diff.type.toUpperCase()}
              </span>
            </div>
            {diff.type === 'changed' && (
              <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                <div className="text-red-600 line-through">{diff.prev}</div>
                <div className="text-green-600">{diff.curr}</div>
              </div>
            )}
            {diff.type === 'added' && <div className="text-green-600 mt-1">{diff.value}</div>}
            {diff.type === 'removed' && <div className="text-red-600 mt-1 line-through">{diff.value}</div>}
          </div>
        ))}
      </div>
    );
  };

  const renderDocumentContent = () => (
    <div className="flex flex-col h-full overflow-x-scroll">
      {renderVersionTabs()}
    </div>
  );

  return (
    <Card className={cn("transition-all duration-300", isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : "h-[calc(100vh-120px)]")} ref={containerRef}>
      <CardContent className={cn("p-6 h-full", isFullscreen ? "max-w-full" : "")}>
        {renderDocumentContent()}
      </CardContent>
    </Card>
  );
}
