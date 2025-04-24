
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for the validation trends over time
const trendData = [
  { date: "Jul 1", total: 35, validated: 25, issues: 10 },
  { date: "Jul 8", total: 42, validated: 32, issues: 10 },
  { date: "Jul 15", total: 38, validated: 30, issues: 8 },
  { date: "Jul 22", total: 45, validated: 34, issues: 11 },
  { date: "Jul 29", total: 50, validated: 40, issues: 10 },
  { date: "Aug 5", total: 55, validated: 42, issues: 13 },
  { date: "Aug 12", total: 60, validated: 48, issues: 12 },
];

export default function ValidationTrends() {
  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Validation Trends</CardTitle>
        <CardDescription>Weekly validation metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }} 
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0A84FF"
                activeDot={{ r: 8 }}
                strokeWidth={2}
                name="Total Documents"
              />
              <Line
                type="monotone"
                dataKey="validated"
                stroke="#4caf50"
                strokeWidth={2}
                name="Validated"
              />
              <Line
                type="monotone"
                dataKey="issues"
                stroke="#f44336"
                strokeWidth={2}
                name="Issues Found"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
