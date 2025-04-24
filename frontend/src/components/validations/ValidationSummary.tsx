
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, AlertCircle, Percent } from "lucide-react";

interface ValidationSummaryProps {
  validations: any[];
}

export default function ValidationSummary({ validations }: ValidationSummaryProps) {
  // Calculate validation statistics
  const totalTerms = validations.length;
  const validatedTerms = validations.filter(v => v.status === "validated").length;
  const errorTerms = validations.filter(v => v.status === "error").length;
  const warningTerms = validations.filter(v => v.status === "warning").length;
  
  // Calculate average confidence score
  const averageConfidence = Math.round(
    validations.reduce((sum, v) => sum + v.confidence, 0) / totalTerms
  );

  const summaryItems = [
    {
      title: "Validation Rate",
      value: `${Math.round((validatedTerms / totalTerms) * 100)}%`,
      icon: <CheckCircle2 className="h-5 w-5 text-finance-success" />,
      description: `${validatedTerms} of ${totalTerms} terms validated`,
    },
    {
      title: "Error Rate",
      value: `${Math.round((errorTerms / totalTerms) * 100)}%`,
      icon: <AlertCircle className="h-5 w-5 text-finance-error" />,
      description: `${errorTerms} terms with errors`,
    },
    {
      title: "Warning Rate",
      value: `${Math.round((warningTerms / totalTerms) * 100)}%`,
      icon: <AlertTriangle className="h-5 w-5 text-finance-warning" />,
      description: `${warningTerms} terms with warnings`,
    },
    {
      title: "Confidence Score",
      value: `${averageConfidence}%`,
      icon: <Percent className="h-5 w-5 text-finance-info" />,
      description: "Average confidence level",
    },
  ];

  return (
    <>
      {summaryItems.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-card p-3 border border-border">
                {item.icon}
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </div>
                <div className="text-3xl font-bold">{item.value}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
