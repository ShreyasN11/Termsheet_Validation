
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import ProcessingStatus from "@/components/dashboard/ProcessingStatus";
import FinancialTermsChart from "@/components/dashboard/FinancialTermsChart";
import ValidationTrends from "@/components/dashboard/ValidationTrends";
import ComplianceStatus from "@/components/dashboard/ComplianceStatus";
import APIStatus from "@/components/dashboard/APIStatus";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import { FileText, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

export default function Index() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">SheetSense Dashboard</h1>
        <p className="text-muted-foreground">
          AI-powered analytics and validation dashboard for term sheet processing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Documents"
          value="126"
          description="Last 30 days"
          icon={<FileText size={18} />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Validation Rate"
          value="87%"
          description="Documents validated successfully"
          icon={<CheckCircle2 size={18} />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Issues Detected"
          value="24"
          description="Requiring attention"
          icon={<AlertTriangle size={18} />}
          trend={{ value: 3, isPositive: false }}
        />
        <StatCard
          title="Average Processing Time"
          value="42s"
          description="Per document"
          icon={<TrendingUp size={18} />}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ProcessingStatus />
        </div>
        <div>
          <RecentAlerts />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <FinancialTermsChart />
        <ValidationTrends />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ComplianceStatus />
        <APIStatus />
      </div>
    </MainLayout>
  );
}
