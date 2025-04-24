
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";

interface ComplianceItemProps {
  category: string;
  status: "compliant" | "warning" | "critical";
  details: string;
}

const complianceData: ComplianceItemProps[] = [
  {
    category: "Regulatory Standards",
    status: "compliant",
    details: "All documents comply with current regulatory standards.",
  },
  {
    category: "Financial Disclosures",
    status: "compliant",
    details: "Required financial disclosures properly documented.",
  },
  {
    category: "Interest Rate Terms",
    status: "warning",
    details: "Interest rate terms flagged for review in 3 documents.",
  },
  {
    category: "Security Provisions",
    status: "critical",
    details: "Missing critical security provisions in 2 documents.",
  },
];

const ComplianceItem = ({ category, status, details }: ComplianceItemProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case "compliant":
        return <CheckCircle2 className="h-5 w-5 text-finance-success" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-finance-warning" />;
      case "critical":
        return <AlertCircle className="h-5 w-5 text-finance-error" />;
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case "compliant":
        return "bg-finance-success/10 border-finance-success/30";
      case "warning":
        return "bg-finance-warning/10 border-finance-warning/30";
      case "critical":
        return "bg-finance-error/10 border-finance-error/30";
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getStatusClass()}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <h4 className="font-medium">{category}</h4>
          <p className="text-sm text-muted-foreground">{details}</p>
        </div>
      </div>
    </div>
  );
};

export default function ComplianceStatus() {
  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Compliance Status</CardTitle>
        <CardDescription>Current compliance metrics across all documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {complianceData.map((item, idx) => (
            <ComplianceItem
              key={idx}
              category={item.category}
              status={item.status}
              details={item.details}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
