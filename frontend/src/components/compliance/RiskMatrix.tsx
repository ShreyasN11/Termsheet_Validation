
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Mock data for risk matrix
const riskItems = [
  {
    id: "1",
    term: "Liquidation Preference",
    value: "1.5x non-participating",
    riskLevel: "high",
    impact: "high",
    likelihood: "medium",
    description: "Liquidation preference exceeds standard market terms and may violate SEC Rule 10b-5",
    mitigation: "Revise to 1x non-participating to align with market standards"
  },
  {
    id: "2",
    term: "Option Pool",
    value: "10% post-money",
    riskLevel: "medium",
    impact: "medium",
    likelihood: "medium",
    description: "Option pool size is below industry standard and may cause future dilution issues",
    mitigation: "Consider increasing to 15% to align with market standards"
  },
  {
    id: "3",
    term: "Valuation",
    value: "$10M pre-money",
    riskLevel: "low",
    impact: "medium",
    likelihood: "low",
    description: "Valuation is within market range for company stage and metrics",
    mitigation: "None required"
  },
  {
    id: "4",
    term: "Protective Provisions",
    value: "Enhanced investor rights",
    riskLevel: "medium",
    impact: "high",
    likelihood: "low",
    description: "Enhanced protective provisions may limit operational flexibility",
    mitigation: "Review provisions against market standards"
  },
  {
    id: "5",
    term: "Disclosure Schedule",
    value: "Incomplete",
    riskLevel: "high",
    impact: "high",
    likelihood: "high",
    description: "Missing critical information in disclosure schedule violates Securities Act Section 12",
    mitigation: "Complete disclosure schedule with all required information"
  },
];

export default function RiskMatrix() {
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return <Badge className="bg-finance-success text-white">Low</Badge>;
      case "medium":
        return <Badge className="bg-finance-warning text-white">Medium</Badge>;
      case "high":
        return <Badge className="bg-finance-error text-white">High</Badge>;
      default:
        return null;
    }
  };

  const getImpactLikelihoodBadge = (level: string) => {
    switch (level) {
      case "low":
        return <span className="text-finance-success font-medium">Low</span>;
      case "medium":
        return <span className="text-finance-warning font-medium">Medium</span>;
      case "high":
        return <span className="text-finance-error font-medium">High</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Matrix</CardTitle>
          <CardDescription>
            Evaluation of financial terms risks and mitigations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Financial Term</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead className="hidden md:table-cell">Impact</TableHead>
                <TableHead className="hidden md:table-cell">Likelihood</TableHead>
                <TableHead className="hidden lg:table-cell">Mitigation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskItems.map((item) => (
                <TableRow 
                  key={item.id}
                  className={cn(
                    item.riskLevel === "high" ? "bg-finance-error/5 hover:bg-finance-error/10" : 
                    item.riskLevel === "medium" ? "bg-finance-warning/5 hover:bg-finance-warning/10" : 
                    "bg-finance-success/5 hover:bg-finance-success/10"
                  )}
                >
                  <TableCell className="font-medium">{item.term}</TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell>{getRiskBadge(item.riskLevel)}</TableCell>
                  <TableCell className="hidden md:table-cell">{getImpactLikelihoodBadge(item.impact)}</TableCell>
                  <TableCell className="hidden md:table-cell">{getImpactLikelihoodBadge(item.likelihood)}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm">
                      {item.riskLevel === "low" ? "None required" : item.mitigation}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Risk Details</CardTitle>
          <CardDescription>
            Detailed explanation of identified risks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskItems
              .filter((item) => item.riskLevel !== "low")
              .map((item) => (
                <div 
                  key={item.id}
                  className={cn(
                    "p-4 rounded-md border",
                    item.riskLevel === "high" ? "bg-finance-error/5 border-finance-error/30" : 
                    "bg-finance-warning/5 border-finance-warning/30"
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="font-semibold">
                      {item.term}: {item.value}
                    </div>
                    {getRiskBadge(item.riskLevel)}
                  </div>
                  
                  <p className="text-sm mb-3">{item.description}</p>
                  
                  <div>
                    <span className="text-sm font-medium">Recommended Mitigation:</span>
                    <p className="text-sm mt-1">{item.mitigation}</p>
                  </div>
                </div>
              ))}
              
            {riskItems.filter((item) => item.riskLevel !== "low").length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No significant risks identified
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
