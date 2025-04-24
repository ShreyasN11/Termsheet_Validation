
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, AlertCircle, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Mock data for compliance timeline
const timelineEvents = [
  {
    id: "1",
    date: "Jul 15, 2023",
    title: "Initial Compliance Review Completed",
    description: "85% compliance score achieved",
    status: "complete",
    user: "Alex Johnson",
    time: "14:32",
  },
  {
    id: "2",
    date: "Jul 15, 2023",
    title: "High Risk Issues Identified",
    description: "2 critical compliance issues require immediate attention",
    status: "issue",
    user: "Alex Johnson",
    time: "14:35",
  },
  {
    id: "3",
    date: "Jul 16, 2023",
    title: "Compliance Issue #1 Addressed",
    description: "Updated liquidation preference terms to meet regulatory requirements",
    status: "resolved",
    user: "Sarah Williams",
    time: "10:15",
  },
  {
    id: "4",
    date: "Jul 17, 2023",
    title: "Compliance Issue #2 In Progress",
    description: "Working on disclosure schedule completion",
    status: "in-progress",
    user: "Michael Chen",
    time: "11:42",
  },
  {
    id: "5",
    date: "Jul 18, 2023",
    title: "Scheduled Final Review",
    description: "Final compliance review scheduled with legal team",
    status: "scheduled",
    user: "System",
    time: "09:00",
    scheduledDate: "Jul 25, 2023",
  },
];

export default function ComplianceTimeline() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-5 w-5 text-finance-success" />;
      case "issue":
        return <AlertCircle className="h-5 w-5 text-finance-error" />;
      case "resolved":
        return <CheckCircle2 className="h-5 w-5 text-finance-success" />;
      case "in-progress":
        return <AlertTriangle className="h-5 w-5 text-finance-warning" />;
      case "scheduled":
        return <Clock className="h-5 w-5 text-finance-info" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return <Badge variant="outline" className="bg-finance-success/10 text-finance-success border-finance-success/30">Completed</Badge>;
      case "issue":
        return <Badge variant="outline" className="bg-finance-error/10 text-finance-error border-finance-error/30">Issue Detected</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-finance-success/10 text-finance-success border-finance-success/30">Resolved</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-finance-warning/10 text-finance-warning border-finance-warning/30">In Progress</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="bg-finance-info/10 text-finance-info border-finance-info/30">Scheduled</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Audit Timeline</CardTitle>
        <CardDescription>
          History of compliance checks and issue resolution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute top-0 bottom-0 left-[28px] w-px bg-border" />

          <div className="space-y-8">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="relative pl-14">
                {/* Circle with icon */}
                <div 
                  className={cn(
                    "absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-full border",
                    event.status === "complete" || event.status === "resolved" 
                      ? "bg-finance-success/10 border-finance-success/30" 
                      : event.status === "issue" 
                      ? "bg-finance-error/10 border-finance-error/30"
                      : event.status === "in-progress"
                      ? "bg-finance-warning/10 border-finance-warning/30"
                      : "bg-finance-info/10 border-finance-info/30"
                  )}
                >
                  {getStatusIcon(event.status)}
                </div>

                <div className="pb-8">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <time className="text-sm text-muted-foreground">
                        {event.date}, {event.time}
                      </time>
                      {getStatusBadge(event.status)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {event.user}
                    </span>
                  </div>
                  <h3 className="font-semibold tracking-tight">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.description}
                  </p>
                  
                  {event.status === "scheduled" && (
                    <div className="mt-3 flex items-center">
                      <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className="text-sm text-muted-foreground">
                        Scheduled for {event.scheduledDate}
                      </span>
                    </div>
                  )}
                  
                  {(event.status === "issue" || event.status === "in-progress") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
