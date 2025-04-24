
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const apiStatus = [
  {
    name: "Document Processing API",
    status: "operational",
    uptime: 99.98,
    responseTime: 245, // ms
    lastChecked: "2 min ago",
  },
  {
    name: "Financial Terms Extraction",
    status: "operational",
    uptime: 99.95,
    responseTime: 320, // ms
    lastChecked: "3 min ago",
  },
  {
    name: "Compliance Validation",
    status: "operational",
    uptime: 100,
    responseTime: 180, // ms
    lastChecked: "1 min ago",
  },
  {
    name: "Notification Service",
    status: "degraded",
    uptime: 98.2,
    responseTime: 450, // ms
    lastChecked: "5 min ago",
  },
];

// Recent API calls
const apiCalls = [
  {
    endpoint: "/api/validate",
    status: "success",
    time: "12:32:45",
    duration: "0.24s",
  },
  {
    endpoint: "/api/extract/terms",
    status: "success",
    time: "12:30:12",
    duration: "0.31s",
  },
  {
    endpoint: "/api/compliance/check",
    status: "success",
    time: "12:28:53",
    duration: "0.18s",
  },
  {
    endpoint: "/api/notifications/send",
    status: "error",
    time: "12:25:37",
    duration: "1.2s",
  },
];

export default function APIStatus() {
  const getStatusBadge = (status: string) => {
    if (status === "operational") {
      return (
        <Badge variant="outline" className="bg-finance-success/10 text-finance-success border-finance-success/30">
          Operational
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-finance-warning/10 text-finance-warning border-finance-warning/30">
        Degraded
      </Badge>
    );
  };

  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">API Status</CardTitle>
        <CardDescription>System health and recent API calls</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {apiStatus.map((api, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">{api.name}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {api.uptime}% uptime
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {api.responseTime}ms
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-muted-foreground">
                    {api.lastChecked}
                  </span>
                  {getStatusBadge(api.status)}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Recent API Calls</h4>
            <div className="space-y-2">
              {apiCalls.map((call, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 text-sm">
                  <div className="flex items-center space-x-2">
                    {call.status === "success" ? (
                      <Check className="h-4 w-4 text-finance-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-finance-error" />
                    )}
                    <span>{call.endpoint}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-muted-foreground">{call.time}</span>
                    <span className="text-xs">{call.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
