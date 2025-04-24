
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, File, FileWarning, AlertCircle } from "lucide-react";

const alerts = [
  {
    id: 1,
    title: "Critical compliance issue detected",
    document: "Acme Corp - Series A",
    severity: "critical",
    timestamp: "10:23 AM",
    message: "Missing required regulatory disclosures in section 4.2.",
  },
  {
    id: 2,
    title: "Unusual term detected",
    document: "TechStart Inc - Seed Round",
    severity: "warning",
    timestamp: "Yesterday",
    message: "Non-standard liquidation preference terms identified.",
  },
  {
    id: 3,
    title: "Potential conflict detected",
    document: "Global Finance - Term Sheet",
    severity: "warning",
    timestamp: "Yesterday",
    message: "Conflicting statements between sections 2.1 and 3.4.",
  },
  {
    id: 4,
    title: "Failed validation",
    document: "Innovate LLC - Investment",
    severity: "critical",
    timestamp: "Aug 12",
    message: "Document format not recognized. Manual review required.",
  },
];

export default function RecentAlerts() {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-finance-error" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-finance-warning" />;
      default:
        return <FileWarning className="h-5 w-5" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <Badge variant="outline" className="bg-finance-error/10 text-finance-error border-finance-error/30">
            Critical
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="outline" className="bg-finance-warning/10 text-finance-warning border-finance-warning/30">
            Warning
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Info
          </Badge>
        );
    }
  };

  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Recent Alerts</CardTitle>
        <CardDescription>Critical and warning notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${
                alert.severity === "critical"
                  ? "bg-finance-error/10 border-finance-error/30"
                  : "bg-finance-warning/10 border-finance-warning/30"
              } hover:bg-opacity-20 transition-colors cursor-pointer`}
            >
              <div className="flex items-start space-x-3">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{alert.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {alert.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <File className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {alert.document}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{alert.message}</p>
                  <div className="mt-2">
                    {getSeverityBadge(alert.severity)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
