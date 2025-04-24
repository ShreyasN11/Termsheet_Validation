
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

// Mock data
const documentTrendsData = [
  { month: "Jan", processed: 65, validated: 42, failed: 23 },
  { month: "Feb", processed: 78, validated: 50, failed: 28 },
  { month: "Mar", processed: 90, validated: 67, failed: 23 },
  { month: "Apr", processed: 81, validated: 62, failed: 19 },
  { month: "May", processed: 95, validated: 80, failed: 15 },
  { month: "Jun", processed: 110, validated: 90, failed: 20 },
  { month: "Jul", processed: 126, validated: 87, failed: 39 }
];

interface DocumentTrendsProps {
  fullHeight?: boolean;
}

export default function DocumentTrends({ fullHeight = false }: DocumentTrendsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Document Processing Trends</CardTitle>
        <CardDescription>
          Monthly document volume and processing status
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(fullHeight ? "h-80" : "h-64")}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={documentTrendsData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="processed"
              name="Processed"
              stroke="#2196f3"
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="validated"
              name="Validated"
              stroke="#4caf50"
            />
            <Line
              type="monotone"
              dataKey="failed"
              name="Failed"
              stroke="#f44336"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
