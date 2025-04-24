
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts";

// Mock data
const performanceData = [
  {
    name: "Documents",
    total: 126,
    validated: 87,
    errors: 24,
    pending: 15,
  },
  {
    name: "Financial Terms",
    total: 845,
    validated: 742,
    errors: 78,
    pending: 25,
  },
  {
    name: "Compliance",
    total: 65,
    validated: 52,
    errors: 10,
    pending: 3,
  },
  {
    name: "Alerts",
    total: 42,
    validated: 0,
    errors: 30,
    pending: 12,
  },
];

const colors = {
  validated: "#4caf50",
  errors: "#f44336",
  pending: "#ff9800",
};

export default function PerformanceOverview() {
  // Calculate validation percentage
  const totalValidated = performanceData.reduce((acc, item) => acc + item.validated, 0);
  const totalItems = performanceData.reduce((acc, item) => acc + item.total, 0);
  const validationPercentage = Math.round((totalValidated / totalItems) * 100);

  // Calculate error percentage
  const totalErrors = performanceData.reduce((acc, item) => acc + item.errors, 0);
  const errorPercentage = Math.round((totalErrors / totalItems) * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>
          Summary of document processing and validation metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted/20 p-4 rounded-lg">
            <div className="text-muted-foreground text-sm">Total Documents</div>
            <div className="text-3xl font-bold mt-1">126</div>
            <div className="text-xs text-muted-foreground mt-1">+12% from last month</div>
          </div>
          <div className="bg-muted/20 p-4 rounded-lg">
            <div className="text-muted-foreground text-sm">Validation Rate</div>
            <div className="text-3xl font-bold mt-1 text-finance-success">{validationPercentage}%</div>
            <div className="text-xs text-muted-foreground mt-1">+5% from last month</div>
          </div>
          <div className="bg-muted/20 p-4 rounded-lg">
            <div className="text-muted-foreground text-sm">Error Rate</div>
            <div className="text-3xl font-bold mt-1 text-finance-error">{errorPercentage}%</div>
            <div className="text-xs text-muted-foreground mt-1">-2% from last month</div>
          </div>
          <div className="bg-muted/20 p-4 rounded-lg">
            <div className="text-muted-foreground text-sm">Processing Time</div>
            <div className="text-3xl font-bold mt-1">42s</div>
            <div className="text-xs text-muted-foreground mt-1">-8s from last month</div>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Bar dataKey="validated" name="Validated" stackId="a">
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors.validated} />
                ))}
              </Bar>
              <Bar dataKey="errors" name="Errors" stackId="a">
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors.errors} />
                ))}
              </Bar>
              <Bar dataKey="pending" name="Pending" stackId="a">
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors.pending} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
