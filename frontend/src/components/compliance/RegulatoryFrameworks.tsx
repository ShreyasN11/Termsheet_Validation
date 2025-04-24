import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RegulatoryFramework {
  name: string;
  description: string;
  compliance: number;
  status: "compliant" | "partial" | "non-compliant";
}

export default function RegulatoryFrameworks() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("us");

  const frameworksData: { [key: string]: RegulatoryFramework[] } = {
    us: [
      {
        name: "SEC Rule 17a-4",
        description: "Retention of communications and transaction data.",
        compliance: 95,
        status: "compliant",
      },
      {
        name: "Dodd-Frank Act",
        description: "Regulations on financial stability and consumer protection.",
        compliance: 80,
        status: "partial",
      },
      {
        name: "Sarbanes-Oxley Act (SOX)",
        description: "Corporate governance and financial disclosure requirements.",
        compliance: 60,
        status: "non-compliant",
      },
    ],
    eu: [
      {
        name: "MiFID II",
        description: "Harmonized regulation for investment services.",
        compliance: 70,
        status: "partial",
      },
      {
        name: "GDPR",
        description: "Data protection and privacy regulations.",
        compliance: 90,
        status: "compliant",
      },
      {
        name: "EMIR",
        description: "Regulation on OTC derivatives, central counterparties and trade repositories.",
        compliance: 50,
        status: "non-compliant",
      },
    ],
    uk: [
      {
        name: "Financial Services Act 2012",
        description: "Regulatory framework for financial services in the UK.",
        compliance: 85,
        status: "partial",
      },
      {
        name: "Senior Managers Regime (SMR)",
        description: "Accountability for senior staff in financial firms.",
        compliance: 75,
        status: "partial",
      },
      {
        name: "UK GDPR",
        description: "UK’s data protection law after Brexit.",
        compliance: 92,
        status: "compliant",
      },
    ],
    sg: [
      {
        name: "Securities and Futures Act (SFA)",
        description: "Regulation of securities, futures, and derivatives markets.",
        compliance: 65,
        status: "non-compliant",
      },
      {
        name: "Personal Data Protection Act (PDPA)",
        description: "Singapore’s data protection law.",
        compliance: 88,
        status: "partial",
      },
      {
        name: "MAS Notices",
        description: "Monetary Authority of Singapore guidelines.",
        compliance: 78,
        status: "partial",
      },
    ],
  };

  const frameworks = frameworksData[selectedJurisdiction] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Regulatory Frameworks</span>
          <Select 
            value={selectedJurisdiction} 
            onValueChange={setSelectedJurisdiction}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select jurisdiction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="eu">European Union</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="sg">Singapore</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
        <CardDescription>
          Key regulatory requirements for term sheets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-4">
          {frameworks.map((framework, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span 
                    className={cn(
                      "w-2 h-2 rounded-full",
                      framework.status === "compliant" && "bg-finance-success",
                      framework.status === "partial" && "bg-finance-warning",
                      framework.status === "non-compliant" && "bg-finance-error"
                    )}
                  />
                  <h4 className="text-sm font-medium">
                    {framework.name}
                  </h4>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    framework.status === "compliant" && "border-finance-success text-finance-success",
                    framework.status === "partial" && "border-finance-warning text-finance-warning",
                    framework.status === "non-compliant" && "border-finance-error text-finance-error"
                  )}
                >
                  {framework.status}
                </Badge>
              </div>
              <Progress 
                value={framework.compliance} 
                className="h-1.5"
              />
              <p className="text-xs text-muted-foreground">
                {framework.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
