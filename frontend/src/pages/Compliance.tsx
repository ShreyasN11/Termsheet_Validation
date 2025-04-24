import MainLayout from "@/components/layout/MainLayout";
import ComplianceChecklist from "@/components/compliance/ComplianceChecklist";
import ComplianceTimeline from "@/components/compliance/ComplianceTimeline";
import RiskMatrix from "@/components/compliance/RiskMatrix";
import RegulatoryFrameworks from "@/components/compliance/RegulatoryFrameworks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Compliance() {
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Compliance Monitoring</h1>
        <p className="text-muted-foreground">
          Ensure term sheets meet regulatory requirements
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main checklist and document viewer */}
          <ComplianceChecklist />
          
          {/* Compliance timeline */}
          <ComplianceTimeline />
        </div>
        
        <div className="space-y-6">
          {/* Risk matrix */}
          <RiskMatrix />
          
          {/* Regulatory frameworks */}
          <RegulatoryFrameworks />
          
          {/* Overall compliance score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Financial Disclosures</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Legal Requirements</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Risk Disclosures</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
