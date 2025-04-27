import DocumentViewer from "@/components/documents/DocumentViewer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { RefreshCw } from "lucide-react";

// Fallback mock documents to display when the API fails
const mockDocuments = [
  {
    id: "doc-1",
    name: "GlobalFinanceInc-term.pdf",
    uploadDate: new Date().toISOString(),
    status: "validated",
    highlightedTerms: [
      {
        term: "Effective Date",
        value: "2025-05-01",
        position: { start: 100, end: 120 },
      },
      {
        term: "Maturity Tenor",
        value: "5Y",
        position: { start: 130, end: 150 },
      },
      {
        term: "Notional Amount",
        value: "$10,000,000",
        position: { start: 160, end: 180 },
      },
      {
        term: "Fixed Rate",
        value: "3.25%",
        position: { start: 190, end: 210 },
      },
      {
        term: "Floating Rate Index",
        value: "SOFR",
        position: { start: 220, end: 240 },
      },
    ],
    expectedTerms: [
      { term: "Effective Date", value: "2025-05-01" },
      { term: "Maturity Tenor", value: "5Y" },
      { term: "Notional Amount", value: "$10,000,000" },
      { term: "Fixed Rate", value: "3.25%" },
      { term: "Floating Rate Index", value: "SOFR" },
      { term: "Payment Frequency", value: "Quarterly" },
      { term: "Day Count Convention", value: "30/360" },
    ],
  },
  {
    id: "doc-2",
    name: "CorporateBond-termsheet.pdf",
    uploadDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    status: "validated",
    highlightedTerms: [
      {
        term: "Issue Date",
        value: "2025-06-15",
        position: { start: 100, end: 120 },
      },
      { term: "Maturity", value: "10Y", position: { start: 130, end: 150 } },
      {
        term: "Principal Amount",
        value: "$25,000,000",
        position: { start: 160, end: 180 },
      },
      {
        term: "Coupon Rate",
        value: "4.5%",
        position: { start: 190, end: 210 },
      },
    ],
    expectedTerms: [
      { term: "Issue Date", value: "2025-06-15" },
      { term: "Maturity", value: "10Y" },
      { term: "Principal Amount", value: "$25,000,000" },
      { term: "Coupon Rate", value: "4.5%" },
      { term: "Payment Frequency", value: "Semi-Annual" },
    ],
  },
];

function Alldocs() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress || "TDR3344";
  const [useFallbackData, setUseFallbackData] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log(`Fetching documents for email: ${userEmail}`);

      const response = await fetch(
        `http://127.0.0.1:5000/get_term?email=${userEmail}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Documents received:", data.length);

      if (!data || data.length === 0) {
        console.log("No documents returned from API, using fallback data");
        setUseFallbackData(true);
        setDocuments(mockDocuments);
        return;
      }

      // Transform API data to match the expected structure
      const transformedData = data.map((item, index) => {
        // Extract termsheet data
        const termsheet = item.termsheet;

        // Create formatted document object
        return {
          id: item.tradeId || `doc-${index}`,
          name: termsheet.Filename || "Unknown.pdf",
          uploadDate: termsheet.UploadDate
            ? new Date(termsheet.UploadDate).toISOString()
            : new Date().toISOString(),
          status: termsheet.Status?.toLowerCase() || "pending",
          highlightedTerms: [
            {
              term: "Effective Date",
              value: termsheet.StartEffectiveDate,
              position: { start: 100, end: 120 },
            },
            {
              term: "Maturity Tenor",
              value: termsheet.MaturityTenor,
              position: { start: 130, end: 150 },
            },
            {
              term: "Notional Amount",
              value: termsheet.NotionalAmount,
              position: { start: 160, end: 180 },
            },
            {
              term: "Fixed Rate",
              value: termsheet.FixedRate,
              position: { start: 190, end: 210 },
            },
            {
              term: "Floating Rate Index",
              value: termsheet.FloatingRateIndex,
              position: { start: 220, end: 240 },
            },
          ],
          expectedTerms: [
            { term: "Effective Date", value: termsheet.StartEffectiveDate },
            { term: "Maturity Tenor", value: termsheet.MaturityTenor },
            { term: "Notional Amount", value: termsheet.NotionalAmount },
            { term: "Fixed Rate", value: termsheet.FixedRate },
            { term: "Floating Rate Index", value: termsheet.FloatingRateIndex },
            { term: "Payment Frequency", value: termsheet.PaymentFrequency },
            {
              term: "Day Count Convention",
              value: termsheet.DayCountConvention,
            },
          ],
        };
      });

      setDocuments(transformedData);
      setUseFallbackData(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
      console.log("Using fallback document data");
      setDocuments(mockDocuments);
      setUseFallbackData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up refresh interval - refresh data every 30 seconds
    const intervalId = setInterval(fetchData, 30000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [userEmail]);

  const handleRefresh = () => {
    fetchData();
  };

  const filteredDocuments = documents
    .filter((doc) => (statusFilter ? doc.status === statusFilter : true))
    .filter((doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (loading && documents.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading documents...
      </div>
    );
  }

  return (
    <div>
      {/* {useFallbackData && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 mb-4 rounded">
          Using sample document data. Connect to the backend to see actual
          documents.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 mb-4 rounded">
          Error loading documents from server: {error}
        </div>
      )} */}

      {!selectedDocument && (
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap gap-4 mx-2">
            <div>
              <label htmlFor="searchQuery" className="mr-2 font-semibold">
                Search by Name:
              </label>
              <input
                id="searchQuery"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border rounded px-2 py-1 text-black"
                placeholder="Enter document name"
              />
            </div>
            <div>
              <label htmlFor="statusFilter" className="mr-2 font-semibold">
                Filter by Status:
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded px-2 py-1 text-black"
              >
                <option value="">All</option>
                <option value="processing">Processing</option>
                <option value="validated">Validated</option>
                <option value="error">Error</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="flex font-semibold border-b py-2">
            <div className="w-1/3 px-3">Document Name</div>
            <div className="w-1/4 px-3">Upload Date</div>
            <div className="w-1/4 px-3">Status</div>
            <div className="w-1/4 px-3"></div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="py-4 text-center">
              No documents found matching your criteria
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center border-b py-2">
                <div className="w-1/3 px-3 text-lg font-medium">{doc.name}</div>
                <div className="w-1/4 px-3">
                  {new Date(doc.uploadDate).toLocaleDateString()}
                </div>
                <div className="w-1/4 px-3 capitalize">{doc.status}</div>
                <div className="w-1/4 px-3 capitalize">
                  <Button onClick={() => setSelectedDocument(doc)}>View</Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedDocument && (
        <div>
          <div className="mb-4">
            <Button onClick={() => setSelectedDocument(null)} variant="outline">
              Back to Documents
            </Button>
          </div>
          <DocumentViewer document={{ version: 1 }} />
          <DocumentViewer document={{ version: 2 }} />
        </div>
      )}
    </div>
  );
}

export default Alldocs;
