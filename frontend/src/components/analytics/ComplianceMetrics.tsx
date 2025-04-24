import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ComplianceMetrics() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Compliance Metrics</CardTitle>
        <CardDescription>Regulatory compliance overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4>SEC Guidelines</h4>
              <span className="text-finance-success font-medium">87%</span>
            </div>
            <Progress value={87} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4>Financial Disclosure Rules</h4>
              <span className="text-finance-warning font-medium">64%</span>
            </div>
            <Progress value={64} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4>Risk Assessment Standards</h4>
              <span className="text-finance-highlight font-medium">92%</span>
            </div>
            <Progress value={92} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4>Anti-Fraud Provisions</h4>
              <span className="text-finance-error font-medium">51%</span>
            </div>
            <Progress value={51} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
