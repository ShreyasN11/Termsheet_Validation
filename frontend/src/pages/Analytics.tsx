
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, FileDown, Filter } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import PerformanceOverview from "@/components/analytics/PerformanceOverview";
import DocumentTrends from "@/components/analytics/DocumentTrends";
import FinancialTermsAnalysis from "@/components/analytics/FinancialTermsAnalysis";
import ErrorDistribution from "@/components/analytics/ErrorDistribution";
import ComplianceMetrics from "@/components/analytics/ComplianceMetrics";

export default function Analytics() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights and metrics for document processing and validation
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>

          <Button>
            <FileDown className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PerformanceOverview />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentTrends />
            <ErrorDistribution />
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Processing Trends</CardTitle>
              <CardDescription>
                Volume of documents processed over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <DocumentTrends fullHeight />
            </CardContent>
          </Card>

          <FinancialTermsAnalysis />
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation Performance</CardTitle>
              <CardDescription>
                Success rates and error analysis by document type
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ErrorDistribution fullHeight />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <ComplianceMetrics />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
