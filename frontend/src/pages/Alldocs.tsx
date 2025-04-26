
import DocumentViewer from "@/components/documents/DocumentViewer";
import { Button } from "@/components/ui/button";
import { useState } from "react";

  const mockDocuments = [
    {
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
    },
    {
      id: "2",
      name: "Investment Agreement.pdf",
      uploadDate: "2023-09-10T14:45:00Z",
      status: "processing",
      extractedText: "INVESTMENT AGREEMENT\nDate: September 5, 2023\n\nThis Investment Agreement (the \"Agreement\") sets forth the terms of investment...\n\nInvestment Amount: $5M\nShare Class: Series A Preferred\nValuation Cap: $25M\nDiscount Rate: 20%\n\nConversion: Automatic conversion upon qualified financing\nInformation Rights: Quarterly financial statements\nMost Favored Nation: Yes\n\nGoverning Law: Delaware",
      highlightedTerms: [
        { term: "Investment Amount", value: "$5M", position: { start: 150, end: 153 } },
        { term: "Share Class", value: "Series A Preferred", position: { start: 166, end: 183 } },
        { term: "Valuation Cap", value: "$25M", position: { start: 196, end: 200 } },
        { term: "Discount Rate", value: "20%", position: { start: 214, end: 217 } }
      ],
      expectedTerms: [
        { term: "Investment Amount", value: "$5M" },
        { term: "Share Class", value: "Series A Preferred" },
        { term: "Valuation Cap", value: "$25M" },
        { term: "Discount Rate", value: "20%" },
        { term: "Most Favored Nation", value: "Yes" },
        { term: "Pro-rata Rights", value: "Yes" } // Term that wasn't found but was expected
      ]
    },
    {
      id: "3",
      name: "Seed Round Term Sheet.docx",
      uploadDate: "2023-10-05T09:15:00Z",
      status: "validated",
      extractedText: "SEED ROUND TERM SHEET\n\nCompany: TechStart Inc.\nInvestors: Seed Capital Fund, Angel Consortium\n\nFinancing Amount: $1.5M\nPre-Money Valuation: $6M\nPost-Money Valuation: $7.5M\nPrice Per Share: $0.75\n\nOption Pool: 15% post-financing\nLiquidation Preference: 1x non-participating\nAnti-dilution: Broad-based weighted average\nDividend: 6% non-cumulative\n\nVoting Rights: As converted basis\nBoard Composition: 2 founders, 1 investor, 1 independent",
      highlightedTerms: [
        { term: "Financing Amount", value: "$1.5M", position: { start: 105, end: 110 } },
        { term: "Pre-Money Valuation", value: "$6M", position: { start: 130, end: 133 } },
        { term: "Post-Money Valuation", value: "$7.5M", position: { start: 157, end: 162 } },
        { term: "Price Per Share", value: "$0.75", position: { start: 180, end: 185 } },
        { term: "Option Pool", value: "15% post-financing", position: { start: 198, end: 216 } },
        { term: "Anti-dilution", value: "Broad-based weighted average", position: { start: 260, end: 288 } }
      ],
      expectedTerms: [
        { term: "Financing Amount", value: "$1.5M" },
        { term: "Pre-Money Valuation", value: "$6M" },
        { term: "Post-Money Valuation", value: "$7.5M" },
        { term: "Price Per Share", value: "$0.75" },
        { term: "Option Pool", value: "15% post-financing" },
        { term: "Anti-dilution", value: "Broad-based weighted average" },
        { term: "Dividend", value: "8% non-cumulative" } // Intentionally different to show comparison
      ]
    },
    {
      id: "4",
      name: "Convertible Note.pdf",
      uploadDate: "2023-11-20T16:20:00Z",
      status: "error",
      extractedText: "CONVERTIBLE NOTE\n\nIssuer: DataFlow Systems Inc.\nDate: November 15, 2023\n\nPrincipal Amount: $750,000\nInterest Rate: 5% simple interest\nMaturity Date: November 15, 2025\n\nConversion Discount: 25%\nValuation Cap: $8M\nQualified Financing Threshold: $2M\n\nPrepayment: Not permitted without investor consent\nSecurity: Unsecured obligation\nSubordination: Junior to all indebtedness for borrowed money",
      highlightedTerms: [
        { term: "Principal Amount", value: "$750,000", position: { start: 88, end: 96 } },
        { term: "Interest Rate", value: "5% simple interest", position: { start: 110, end: 127 } },
        { term: "Maturity Date", value: "November 15, 2025", position: { start: 142, end: 159 } },
        { term: "Conversion Discount", value: "25%", position: { start: 180, end: 183 } },
        { term: "Valuation Cap", value: "$8M", position: { start: 197, end: 200 } }
      ],
      expectedTerms: [
        { term: "Principal Amount", value: "$800,000" }, // Intentionally different to show comparison
        { term: "Interest Rate", value: "5% simple interest" },
        { term: "Maturity Date", value: "November 15, 2025" },
        { term: "Conversion Discount", value: "25%" },
        { term: "Valuation Cap", value: "$8M" },
        { term: "Qualified Financing Threshold", value: "$2M" }
      ]
    },
    {
      id: "5",
      name: "Series A Financing.pdf",
      uploadDate: "2024-01-15T11:00:00Z",
      status: "validated",
      extractedText: "SERIES A PREFERRED STOCK PURCHASE AGREEMENT\n\nCompany: Quantum Solutions Ltd.\nLead Investor: Growth Capital Partners\n\nAmount Raised: $7M\nPre-Money Valuation: $18M\nPost-Money Valuation: $25M\nPer Share Purchase Price: $2.50\n\nLiquidation Preference: 1x participating with cap at 2x\nDividends: 8% cumulative\nProtective Provisions: Standard Series A protective provisions\nRedemption Rights: At investor option after 5 years\n\nBoard Composition: 5 members (2 common, 2 Series A, 1 independent)",
      highlightedTerms: [
        { term: "Amount Raised", value: "$7M", position: { start: 121, end: 124 } },
        { term: "Pre-Money Valuation", value: "$18M", position: { start: 144, end: 148 } },
        { term: "Post-Money Valuation", value: "$25M", position: { start: 172, end: 176 } },
        { term: "Per Share Purchase Price", value: "$2.50", position: { start: 203, end: 208 } },
        { term: "Liquidation Preference", value: "1x participating with cap at 2x", position: { start: 230, end: 261 } },
        { term: "Dividends", value: "8% cumulative", position: { start: 273, end: 286 } },
        { term: "Board Composition", value: "5 members (2 common, 2 Series A, 1 independent)", position: { start: 381, end: 425 } }
      ],
      expectedTerms: [
        { term: "Amount Raised", value: "$7M" },
        { term: "Pre-Money Valuation", value: "$20M" }, // Intentionally different to show comparison
        { term: "Post-Money Valuation", value: "$25M" },
        { term: "Per Share Purchase Price", value: "$2.50" },
        { term: "Liquidation Preference", value: "1x participating with cap at 2x" },
        { term: "Dividends", value: "8% cumulative" },
        { term: "Board Composition", value: "5 members (2 common, 2 Series A, 1 independent)" }
      ]
    },
    {
      id: "6",
      name: "Bridge Financing Agreement.docx",
      uploadDate: "2024-02-28T13:40:00Z",
      status: "processing",
      extractedText: "BRIDGE FINANCING AGREEMENT\n\nCompany: InnoTech Ventures\nDate: February 25, 2024\n\nBridge Amount: $1.2M\nInterest Rate: 7% per annum\nMaturity: 12 months from closing\n\nAutomatic Conversion: Next equity financing of at least $3M\nConversion Discount: 20%\nValuation Cap: $12M\n\nMost Favored Nation: Yes\nWarrants: 10% coverage\nFee: 1% closing fee",
      highlightedTerms: [
        { term: "Bridge Amount", value: "$1.2M", position: { start: 94, end: 99 } },
        { term: "Interest Rate", value: "7% per annum", position: { start: 113, end: 126 } },
        { term: "Maturity", value: "12 months from closing", position: { start: 136, end: 158 } },
        { term: "Conversion Discount", value: "20%", position: { start: 210, end: 213 } },
        { term: "Valuation Cap", value: "$12M", position: { start: 228, end: 232 } },
        { term: "Warrants", value: "10% coverage", position: { start: 257, end: 269 } }
      ],
      expectedTerms: [
        { term: "Bridge Amount", value: "$1.2M" },
        { term: "Interest Rate", value: "7% per annum" },
        { term: "Maturity", value: "12 months from closing" },
        { term: "Conversion Discount", value: "20%" },
        { term: "Valuation Cap", value: "$12M" },
        { term: "Warrants", value: "10% coverage" },
        { term: "Fee", value: "2% closing fee" } // Intentionally different to show comparison
      ]
    },
    {
      id: "7",
      name: "SAFE Agreement.pdf",
      uploadDate: "2024-03-25T10:10:00Z",
      status: "pending",
      extractedText: "SIMPLE AGREEMENT FOR FUTURE EQUITY (SAFE)\n\nCompany: NextGen Software Inc.\nInvestor: Horizon Ventures LLC\nDate: March 20, 2024\n\nPurchase Amount: $500,000\nValuation Cap: $6M\nDiscount Rate: 15%\n\nPro Rata Rights: Yes\nTermination: 18 months if no equity financing\nGoverning Law: California",
      highlightedTerms: [
        { term: "Purchase Amount", value: "$500,000", position: { start: 136, end: 144 } },
        { term: "Valuation Cap", value: "$6M", position: { start: 158, end: 161 } },
        { term: "Discount Rate", value: "15%", position: { start: 176, end: 179 } },
        { term: "Pro Rata Rights", value: "Yes", position: { start: 196, end: 199 } },
        { term: "Termination", value: "18 months if no equity financing", position: { start: 210, end: 240 } }
      ],
      expectedTerms: [
        { term: "Purchase Amount", value: "$500,000" },
        { term: "Valuation Cap", value: "$6M" },
        { term: "Discount Rate", value: "15%" },
        { term: "Pro Rata Rights", value: "Yes" },
        { term: "Termination", value: "18 months if no equity financing" },
        { term: "Most Favored Nation", value: "Yes" } // Term that wasn't found but was expected
      ]
    }
  ];



function Alldocs() {
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
  
    const filteredDocuments = mockDocuments
      .filter(doc => (statusFilter ? doc.status === statusFilter : true))
      .filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
    return (
      <div>
        {!selectedDocument && (
          <div className="mt-6">
            <div className="mb-4 flex space-x-4 mx-2">
              <div>
                <label htmlFor="searchQuery" className="mr-2 font-semibold">Search by Name:</label>
                <input
                  id="searchQuery"
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="border rounded px-2 py-1 text-black"
                  placeholder="Enter document name"
                />
              </div>
              <div >
                <label htmlFor="statusFilter" className="mr-2 font-semibold">Filter by Status:</label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="border rounded px-2 py-1 text-black"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="validated">Validated</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
            <div className="flex font-semibold border-b py-2">
              <div className="w-1/3 px-3">Document Name</div>
              <div className="w-1/4 px-3">Upload Date</div>
              <div className="w-1/4 px-3">Status</div>
              <div className="w-1/4 px-3"></div>
            </div>

            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center border-b py-2"
              >
                <div className="w-1/3 px-3 text-lg font-medium">{doc.name}</div>
                <div className="w-1/4 px-3">{new Date(doc.uploadDate).toLocaleDateString()}</div>
                <div className="w-1/4 px-3 capitalize">{doc.status}</div>
                <div className="w-1/4 px-3 capitalize">
                  <Button onClick={() => setSelectedDocument(doc)}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
  
        {selectedDocument && <DocumentViewer document={selectedDocument} />}
      </div>
    );
  }
  
  export default Alldocs;
  
/*


*/