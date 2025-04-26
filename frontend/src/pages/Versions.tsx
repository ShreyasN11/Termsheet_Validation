// import { useState } from "react";

import VersionViewer from "@/components/version/VersionViewer";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";


// Mock document for initial state

const mockDocuments = [
    {
      id: "1",
      name: "Sample Term Sheet.pdf",
      versions: [
        {
          version: 1,
          uploadDate: "2023-08-10T10:30:00Z",
          extractedText: "Initial version text...",
          highlightedTerms: [
            { term: "Valuation", value: "$8M pre-money", position: { start: 108, end: 123 } },
            { term: "Amount", value: "$1.5M", position: { start: 131, end: 134 } }
          ],
          expectedTerms: [
            { term: "Valuation", value: "$10M pre-money" },
            { term: "Amount", value: "$2M" }
          ]
        },
        {
          version: 2,
          uploadDate: "2023-08-15T10:30:00Z",
          extractedText: "Revised term sheet text...",
          highlightedTerms: [
            { term: "Valuation", value: "$10M pre-money", position: { start: 108, end: 123 } },
            { term: "Amount", value: "$2M", position: { start: 131, end: 134 } },
            { term: "Liquidation Preference", value: "1x non-participating", position: { start: 199, end: 217 } }
          ],
          expectedTerms: [
            { term: "Valuation", value: "$10M pre-money" },
            { term: "Amount", value: "$2M" },
            { term: "Liquidation Preference", value: "1x non-participating" }
          ]
        }
      ]
    },
    {
      id: "2",
      name: "Investment Term Sheet.pdf",
      versions: [
        {
          version: 1,
          uploadDate: "2023-09-01T12:00:00Z",
          extractedText: "First draft of investment term sheet...",
          highlightedTerms: [
            { term: "Equity", value: "20%", position: { start: 105, end: 109 } },
            { term: "Investment Amount", value: "$5M", position: { start: 115, end: 118 } }
          ],
          expectedTerms: [
            { term: "Equity", value: "25%" },
            { term: "Investment Amount", value: "$6M" }
          ]
        },
        {
          version: 2,
          uploadDate: "2023-09-10T12:00:00Z",
          extractedText: "Updated investment term sheet...",
          highlightedTerms: [
            { term: "Equity", value: "25%", position: { start: 105, end: 109 } },
            { term: "Investment Amount", value: "$6M", position: { start: 115, end: 118 } },
            { term: "Preferred Return", value: "8%", position: { start: 160, end: 174 } }
          ],
          expectedTerms: [
            { term: "Equity", value: "25%" },
            { term: "Investment Amount", value: "$6M" },
            { term: "Preferred Return", value: "8%" }
          ]
        }
      ]
    },
    {
      id: "3",
      name: "Shareholder Agreement.pdf",
      versions: [
        {
          version: 1,
          uploadDate: "2023-07-01T08:00:00Z",
          extractedText: "Original shareholder agreement document...",
          highlightedTerms: [
            { term: "Voting Rights", value: "Yes", position: { start: 110, end: 122 } },
            { term: "Dividend Rights", value: "5% per annum", position: { start: 130, end: 148 } }
          ],
          expectedTerms: [
            { term: "Voting Rights", value: "Yes" },
            { term: "Dividend Rights", value: "6% per annum" }
          ]
        },
        {
          version: 2,
          uploadDate: "2023-07-10T08:00:00Z",
          extractedText: "Updated shareholder agreement terms...",
          highlightedTerms: [
            { term: "Voting Rights", value: "Yes", position: { start: 110, end: 122 } },
            { term: "Dividend Rights", value: "6% per annum", position: { start: 130, end: 148 } },
            { term: "Transfer Restrictions", value: "Yes, after 5 years", position: { start: 180, end: 210 } }
          ],
          expectedTerms: [
            { term: "Voting Rights", value: "Yes" },
            { term: "Dividend Rights", value: "6% per annum" },
            { term: "Transfer Restrictions", value: "Yes, after 5 years" }
          ]
        }
      ]
    },
    {
      id: "4",
      name: "Convertible Note Term Sheet.pdf",
      versions: [
        {
          version: 1,
          uploadDate: "2023-10-01T14:00:00Z",
          extractedText: "Initial convertible note agreement...",
          highlightedTerms: [
            { term: "Interest Rate", value: "5%", position: { start: 105, end: 115 } },
            { term: "Maturity Date", value: "2025-10-01", position: { start: 120, end: 131 } }
          ],
          expectedTerms: [
            { term: "Interest Rate", value: "6%" },
            { term: "Maturity Date", value: "2025-10-01" }
          ]
        },
        {
          version: 2,
          uploadDate: "2023-10-05T14:00:00Z",
          extractedText: "Updated convertible note agreement...",
          highlightedTerms: [
            { term: "Interest Rate", value: "6%", position: { start: 105, end: 115 } },
            { term: "Maturity Date", value: "2025-10-01", position: { start: 120, end: 131 } },
            { term: "Conversion Discount", value: "20%", position: { start: 145, end: 164 } }
          ],
          expectedTerms: [
            { term: "Interest Rate", value: "6%" },
            { term: "Maturity Date", value: "2025-10-01" },
            { term: "Conversion Discount", value: "20%" }
          ]
        }
      ]
    }
  ];
  
  
  function Versions() {
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
  
    // Filter documents based on search query (case-insensitive)
    const filteredDocuments = mockDocuments.filter(doc =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    return (
      <MainLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Document Versions</h1>
          <p className="text-muted-foreground">
            Track changes across document versions
          </p>
        </div>
  
        <div className="grid gap-4">
          <div className="mb-4 flex space-x-4 mx-2">
            <div>
              <label htmlFor="searchQuery" className="mr-2">
                Search by Name:
              </label>
              <input
                id="searchQuery"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="border rounded px-2 py-1 text-black"
                placeholder="Enter document name"
              />
            </div>
          </div>
  
          {!selectedDocument && filteredDocuments.map(doc => (
            <Card
              key={doc.id}
              onClick={() => setSelectedDocument(doc)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <CardContent className="p-4">
                <h3 className="font-semibold">{doc.name}</h3>
                <div className="text-sm text-muted-foreground">
                  {doc.versions.length} versions · Last updated{" "}
                  {new Date(doc.versions.at(-1).uploadDate).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
  
          {/* Optionally show a message if no documents match the search */}
          {!selectedDocument && filteredDocuments.length === 0 && (
            <div className="text-center text-muted-foreground">
              No documents found.
            </div>
          )}
  
          {selectedDocument && (
            <div className="space-y-4">
              <Button variant="outline" onClick={() => setSelectedDocument(null)}>
                Back to Documents
              </Button>
              <VersionViewer document={selectedDocument} />
            </div>
          )}
        </div>
      </MainLayout>
    );
  }
  
  export default Versions;