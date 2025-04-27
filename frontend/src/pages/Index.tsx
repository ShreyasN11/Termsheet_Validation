import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import ProcessingStatus from "@/components/dashboard/ProcessingStatus";
import FinancialTermsChart from "@/components/dashboard/FinancialTermsChart";
import ValidationTrends from "@/components/dashboard/ValidationTrends";
import ComplianceStatus from "@/components/dashboard/ComplianceStatus";
import APIStatus from "@/components/dashboard/APIStatus";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useEffect } from "react";

export default function Index() {
  const { user } = useUser();
  const userName = user?.fullName || "User";
  const userEmail =
    user?.emailAddresses[0]?.emailAddress || "dakshjain624@gmail.com";
  const [totaldocs, setTotalDocs] = useState(0);
  const [validationRate, setValidationRate] = useState(0);
  const [issues, setIssues] = useState(0);
  useEffect(() => {
    console.log(userEmail);
    const fetchData = async () => {
      const resp = await fetch(
        `http://localhost:5000/trader_stats?email=${userEmail}`,
        {
          method: "GET",
        }
      );
      if (resp.ok) {
        const data = await resp.json();
        setTotalDocs(data.total_documents);
        setValidationRate(data.validation_rate);
        setIssues(data.total_unvalidated_fields);
      }
    };
    fetchData();
  }, []); // Empty dependency array to run only once on mount
  // console.log("User Name:", userName);
  // console.log("User Email:", userEmail);
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          SheetSense Dashboard
        </h1>
        <p className="text-muted-foreground">
          AI-powered analytics and validation dashboard for term sheet
          processing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Documents"
          value={totaldocs}
          description="Last 30 days"
          icon={<FileText size={18} />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Validation Rate"
          value={validationRate}
          description="Documents validated successfully"
          icon={<CheckCircle2 size={18} />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Issues Detected"
          value={issues}
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
        <div className="lg:col-span-3">
          <ProcessingStatus />
        </div>
        {/* <div>
          <RecentAlerts />
        </div> */}
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <FinancialTermsChart />
        <ValidationTrends />
      </div> */}

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ComplianceStatus />
        <APIStatus />
      </div> */}
    </MainLayout>
  );
}
