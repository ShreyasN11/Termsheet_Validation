
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import DocumentUploader from "@/components/documents/DocumentUploader";
import DocumentList from "@/components/documents/DocumentList";
import DocumentViewer from "@/components/documents/DocumentViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Alldocs from "./Alldocs";
import { useUser } from "@clerk/clerk-react";

// Mock document for initial state
const mockSelectedDocument = {
  id: "1",
  name: "Sample Term Sheet.pdf",
  uploadDate: "2023-08-15T10:30:00Z",
  status: "validated",
  extractedText: "This Term Sheet outlines the principal terms and conditions of the proposed financing...\n\nValuation: $10M pre-money\nAmount: $2M\nPrice per share: $1.25\nInvestors: VC Fund A, Angel Group B\n\nLiquidation Preference: 1x non-participating\nBoard Seats: 1 investor representative\nVesting: 4 years with 1 year cliff\n\nPro-rata rights: Yes\nDrag-along: Yes\nRegistration rights: Yes",
  highlightedTerms: [
    { term: "Valuation", value: "$10M pre-money", position: { start: 108, end: 123 } },
    { term: "Amount", value: "$2M", position: { start: 131, end: 134 } },
    { term: "Price per share", value: "$1.25", position: { start: 150, end: 155 } },
    { term: "Liquidation Preference", value: "1x non-participating", position: { start: 199, end: 217 } },
    { term: "Vesting", value: "4 years with 1 year cliff", position: { start: 264, end: 287 } }
  ],
  expectedTerms: [
    { term: "Valuation", value: "$10M pre-money" },
    { term: "Amount", value: "$2.5M" }, // Intentionally different to show comparison
    { term: "Price per share", value: "$1.25" },
    { term: "Liquidation Preference", value: "1x non-participating" },
    { term: "Vesting", value: "4 years with 1 year cliff" },
    { term: "Board Seats", value: "2 investor representatives" } // Term that wasn't found but was expected
  ]
};

export default function Documents() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const { user } = useUser();
  const userName = user?.fullName || "User";
  const userEmail = user?.emailAddresses[0]?.emailAddress || "";
  
  const handleFileUpload = (files: File[]) => {
    const newDocs = files.map((file, index) => ({
      id: Date.now() + index.toString(),
      name: file.name,
      uploadDate: new Date().toISOString(),
      status: "processing",
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      extractedText: "Extracting text...", // Placeholder until AI processes the document
      highlightedTerms: []
    }));
    
    // Simulate AI processing of the document
    setTimeout(() => {
      const processedDocs = newDocs.map(doc => ({
        ...doc,
        status: "validated",
        extractedText: mockSelectedDocument.extractedText,
        highlightedTerms: mockSelectedDocument.highlightedTerms,
        expectedTerms: mockSelectedDocument.expectedTerms
      }));
      
      setDocuments(prev => [...processedDocs, ...prev]);
      
      // Select the first newly uploaded document
      if (processedDocs.length > 0) {
        setSelectedDocument(processedDocs[0]);
        setActiveTab("view");
      }
    }, 2000);
  };

  const handleSelectDocument = (doc: any) => {
    setSelectedDocument(doc);
    setActiveTab("view");
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Document Management</h1>
        <p className="text-muted-foreground">
          Upload, view, and analyze term sheet documents
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="view">View Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="dashboard-card">
  <CardHeader className="pb-2">
    <CardTitle className="text-lg font-semibold">Connect to Mail</CardTitle>
    <CardDescription>Connect to Gmail to Automate</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {userEmail !== "" ? (
        <Button
          variant="outline"
          disabled
          className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-700 cursor-default"
        >
          <Mail className="w-5 h-5" />
          Connected as {userEmail}
              </Button>
                ) : (
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 hover:bg-white hover:text-black"
              >
                <Mail className="w-5 h-5" />
                Connect to Gmail
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Connect to Outlook</CardTitle>
              <CardDescription>Connect to Outlook to Automate</CardDescription>
            </CardHeader>
            <CardContent>
            <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 hover:bg-white hover:text-black"
              >
                <Mail className="w-5 h-5" />
                Connect to Outlook
              </Button>
            </CardContent>
          </Card> 
          </div>
          
          <DocumentUploader onUpload={handleFileUpload} />
          
          {documents.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Uploaded Documents</h2>
              <DocumentList 
                documents={documents} 
                onSelectDocument={handleSelectDocument} 
                selectedDocumentId={selectedDocument?.id} 
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="view">
          <Alldocs />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
