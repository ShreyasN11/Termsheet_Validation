import { useState, useEffect } from "react";
import { FileCheck, FileX, FileWarning, File } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

interface TermSheet {
  _id: string;
  counterparty: string;
  tradeId: string;
  effective_date: string;
  // Add other fields as needed
}

interface DocumentStatus {
  id: string;
  name: string;
  status: "validated" | "flagged" | "failed";
  date: string;
}

export default function ProcessingStatus({ user }: any) {
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = "daksh199jain@gmail.com";
        if (!email) {
          setError("No email address found");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/get_termsheets?email=${email}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: TermSheet[] = await response.json();

        // Transform backend data to frontend format
        const mappedData = data.map((ts) => ({
          id: ts._id,
          name: `${ts.counterparty} - ${ts.tradeId}`,
          status: getDocumentStatus(ts), // Add your status logic here
          date: ts.effective_date,
        }));

        setDocuments(mappedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.emailAddresses]);

  // Add your actual status determination logic here
  const getDocumentStatus = (ts: TermSheet): DocumentStatus["status"] => {
    // Example placeholder logic - replace with your actual validation rules
    if (ts.tradeId.includes("FAIL")) return "failed";
    if (ts.tradeId.includes("FLAG")) return "flagged";
    return "validated";
  };

  // Calculate statistics
  const total = documents.length;
  const validated = documents.filter((d) => d.status === "validated").length;
  const flagged = documents.filter((d) => d.status === "flagged").length;
  const failed = documents.filter((d) => d.status === "failed").length;
  const percentComplete = total > 0 ? Math.round((validated / total) * 100) : 0;

  const statusItems = [
    {
      status: "Validated",
      count: validated,
      icon: FileCheck,
      color: "success",
    },
    { status: "Flagged", count: flagged, icon: FileWarning, color: "warning" },
    { status: "Failed", count: failed, icon: FileX, color: "error" },
  ];

  if (error)
    return (
      <div className="dashboard-card text-finance-error">Error: {error}</div>
    );
  if (loading)
    return <div className="dashboard-card">Loading documents...</div>;

  return (
    <div className="dashboard-card">
      <div className="flex flex-col space-y-6">
        {/* Status Summary Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Document Processing</h2>
            <span className="text-sm text-muted-foreground">
              {documents.length} documents processed
            </span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Overall completion
              </span>
              <span className="text-sm font-medium">{percentComplete}%</span>
            </div>
            <Progress value={percentComplete} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {statusItems.map((item) => (
              <div
                key={item.status}
                className={`p-3 rounded-lg border bg-finance-${item.color}/20 border-finance-${item.color}/30`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <item.icon
                      className={`h-4 w-4 text-finance-${item.color}`}
                    />
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <span className="font-bold">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <div>
          <Tabs defaultValue="recent">
            <TabsList className="mb-4 bg-muted/50">
              <TabsTrigger value="recent">Recent Documents</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
            </TabsList>

            <TabsContent value="recent">
              <DocumentList documents={documents} />
            </TabsContent>

            <TabsContent value="flagged">
              <DocumentList
                documents={documents.filter((d) => d.status === "flagged")}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function DocumentList({ documents }: { documents: DocumentStatus[] }) {
  const navigate = useNavigate();
  if (documents.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No documents found
      </div>
    );
  }
  const onButtonClick = (doc: DocumentStatus) => {
    // Handle button click logic here, e.g., navigate to document details page
    console.log(`Viewing document: ${doc.name}`);
    navigate(`/validation/${doc.id}`); // Adjust the route as needed
  };

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-md transition-colors"
        >
          <div className="flex items-center space-x-2">
            <StatusIcon status={doc.status} />
            <span className="font-medium">{doc.name}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`text-xs ${statusColor(doc.status)}`}>
              {doc.status}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(doc.date).toLocaleDateString()}
            </span>
          </div>
          <button
            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
            onClick={() => onButtonClick(doc)}
          >
            View
          </button>
        </div>
      ))}
    </div>
  );
}

function StatusIcon({ status }: { status: DocumentStatus["status"] }) {
  const Icon = {
    validated: FileCheck,
    flagged: FileWarning,
    failed: FileX,
  }[status];

  return <Icon className={`h-4 w-4 ${statusColor(status)}`} />;
}

function statusColor(status: DocumentStatus["status"]) {
  return {
    validated: "text-finance-success",
    flagged: "text-finance-warning",
    failed: "text-finance-error",
  }[status];
}
