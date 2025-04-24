
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data for compliance checklist
const complianceItems = [
  {
    section: "Disclosure Requirements",
    items: [
      {
        id: "1.1",
        requirement: "Financial Terms Clearly Defined",
        status: "compliant",
        details: "All financial terms are clearly defined in section 2.1",
        riskLevel: "low",
      },
      {
        id: "1.2",
        requirement: "Valuation Method Disclosure",
        status: "compliant",
        details: "Valuation method is properly disclosed",
        riskLevel: "low",
      },
      {
        id: "1.3",
        requirement: "Complete Cap Table",
        status: "warning",
        details: "Cap table missing post-money calculations",
        riskLevel: "medium",
      },
    ],
  },
  {
    section: "Investor Rights",
    items: [
      {
        id: "2.1",
        requirement: "Pro-rata Rights",
        status: "compliant",
        details: "Pro-rata rights properly defined in section 3.2",
        riskLevel: "low",
      },
      {
        id: "2.2",
        requirement: "Liquidation Preference",
        status: "violation",
        details: "Liquidation preference terms violate current regulations",
        riskLevel: "high",
        regulation: "SEC Rule 10b-5",
      },
      {
        id: "2.3",
        requirement: "Board Representation",
        status: "compliant",
        details: "Board representation terms comply with regulations",
        riskLevel: "low",
      },
    ],
  },
  {
    section: "Terms and Conditions",
    items: [
      {
        id: "3.1",
        requirement: "Vesting Schedule",
        status: "compliant",
        details: "Vesting schedule properly defined",
        riskLevel: "low",
      },
      {
        id: "3.2",
        requirement: "Non-Dilution Provisions",
        status: "warning",
        details: "Non-dilution provisions may need review",
        riskLevel: "medium",
      },
      {
        id: "3.3",
        requirement: "Drag-Along Rights",
        status: "compliant",
        details: "Drag-along rights comply with regulations",
        riskLevel: "low",
      },
    ],
  },
  {
    section: "Representations and Warranties",
    items: [
      {
        id: "4.1",
        requirement: "Company Representations",
        status: "compliant",
        details: "Company representations are complete",
        riskLevel: "low",
      },
      {
        id: "4.2",
        requirement: "Investor Representations",
        status: "compliant",
        details: "Investor representations are properly disclosed",
        riskLevel: "low",
      },
      {
        id: "4.3",
        requirement: "Disclosure Schedule",
        status: "violation",
        details: "Incomplete disclosure schedule",
        riskLevel: "high",
        regulation: "Securities Act Section 12",
      },
    ],
  },
];

export default function ComplianceChecklist() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Disclosure Requirements": true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle2 className="h-5 w-5 text-finance-success" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-finance-warning" />;
      case "violation":
        return <AlertCircle className="h-5 w-5 text-finance-error" />;
      default:
        return null;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return <Badge variant="outline" className="bg-finance-success/10 text-finance-success border-finance-success/30">Low Risk</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-finance-warning/10 text-finance-warning border-finance-warning/30">Medium Risk</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-finance-error/10 text-finance-error border-finance-error/30">High Risk</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {complianceItems.map((section) => (
        <Card key={section.section}>
          <div 
            className={cn(
              "p-4 cursor-pointer flex items-center justify-between", 
              expandedSections[section.section] ? "border-b" : ""
            )}
            onClick={() => toggleSection(section.section)}
          >
            <h3 className="text-lg font-semibold flex items-center">
              {section.section}
              <span className="ml-2 text-sm text-muted-foreground">
                ({section.items.filter(item => item.status === "compliant").length}/{section.items.length})
              </span>
            </h3>
            {expandedSections[section.section] ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </div>

          {expandedSections[section.section] && (
            <CardContent className="pt-4">
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-4 rounded-md",
                      item.status === "compliant" ? "bg-finance-success/5 border border-finance-success/20" :
                      item.status === "warning" ? "bg-finance-warning/5 border border-finance-warning/20" :
                      "bg-finance-error/5 border border-finance-error/20"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <span className="mt-0.5">{getStatusIcon(item.status)}</span>
                        <div>
                          <div className="font-medium">{item.requirement}</div>
                          <div className="text-sm text-muted-foreground mt-1">{item.details}</div>
                          {item.regulation && (
                            <div className="text-sm text-finance-error mt-1">
                              Violates: {item.regulation}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>{getRiskBadge(item.riskLevel)}</div>
                    </div>
                    
                    {item.status !== "compliant" && (
                      <div className="mt-4 flex justify-end">
                        <Button size="sm">Review & Resolve</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
