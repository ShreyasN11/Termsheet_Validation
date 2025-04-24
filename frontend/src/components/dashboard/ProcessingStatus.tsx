
import { FileCheck, FileX, FileWarning, File } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const processingData = {
  total: 126,
  validated: 87,
  flagged: 24,
  failed: 15,
  inProgress: 78,
  percentComplete: 69,
};

const statusItems = [
  {
    status: "Validated",
    count: processingData.validated,
    icon: <FileCheck className="h-4 w-4 text-finance-success" />,
    color: "bg-finance-success/20",
    borderColor: "border-finance-success/30"
  },
  {
    status: "Flagged",
    count: processingData.flagged,
    icon: <FileWarning className="h-4 w-4 text-finance-warning" />,
    color: "bg-finance-warning/20",
    borderColor: "border-finance-warning/30"
  },
  {
    status: "Failed",
    count: processingData.failed,
    icon: <FileX className="h-4 w-4 text-finance-error" />,
    color: "bg-finance-error/20", 
    borderColor: "border-finance-error/30"
  },
];

const recentDocuments = [
  { id: 1, name: "Acme Corp - Series A", status: "validated", date: "2023-08-15" },
  { id: 2, name: "TechStart Inc - Seed Round", status: "flagged", date: "2023-08-14" },
  { id: 3, name: "Global Finance - Term Sheet", status: "failed", date: "2023-08-13" },
  { id: 4, name: "Innovate LLC - Investment", status: "validated", date: "2023-08-12" },
];

export default function ProcessingStatus() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "validated":
        return <FileCheck className="h-4 w-4 text-finance-success" />;
      case "flagged":
        return <FileWarning className="h-4 w-4 text-finance-warning" />;
      case "failed":
        return <FileX className="h-4 w-4 text-finance-error" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "validated":
        return "text-finance-success";
      case "flagged":
        return "text-finance-warning";
      case "failed":
        return "text-finance-error";
      default:
        return "";
    }
  };

  return (
    <div className="dashboard-card">
      <div className="flex flex-col space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Document Processing</h2>
            <span className="text-sm text-muted-foreground">
              {processingData.inProgress} in progress
            </span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Overall completion</span>
              <span className="text-sm font-medium">{processingData.percentComplete}%</span>
            </div>
            <Progress value={processingData.percentComplete} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {statusItems.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg ${item.color} ${item.borderColor} border`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <span className="font-bold">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Tabs defaultValue="recent">
            <TabsList className="mb-4 bg-muted/50">
              <TabsTrigger value="recent">Recent Documents</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
            </TabsList>
            <TabsContent value="recent">
              <div className="space-y-2">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-md transition-colors cursor-pointer">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(doc.status)}
                      <span>{doc.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs ${getStatusClass(doc.status)}`}>
                        {doc.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {doc.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="flagged">
              <div className="space-y-2">
                {recentDocuments.filter(doc => doc.status === "flagged").map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-md transition-colors cursor-pointer">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(doc.status)}
                      <span>{doc.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs ${getStatusClass(doc.status)}`}>
                        {doc.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {doc.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
