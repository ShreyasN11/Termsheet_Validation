
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

// Mock data
const errorDistributionData = [
  { 
    type: "Missing Data", 
    count: 36,
    percentage: 36,
    details: "Essential financial values not found" 
  },
  { 
    type: "Format Error", 
    count: 28,
    percentage: 28,
    details: "Incorrect format in financial notation" 
  },
  { 
    type: "Inconsistency", 
    count: 15,
    percentage: 15,
    details: "Values don't match across document" 
  },
  { 
    type: "Compliance", 
    count: 12,
    percentage: 12,
    details: "Terms violate regulatory requirements" 
  },
  { 
    type: "Calculation", 
    count: 9,
    percentage: 9,
    details: "Numeric calculation errors" 
  },
];

interface ErrorDistributionProps {
  fullHeight?: boolean;
}

// Use error-related colors from our finance theme
const barColors = ["#f44336", "#ff5722", "#ff9800", "#ffc107", "#ffeb3b"];

export default function ErrorDistribution({ fullHeight = false }: ErrorDistributionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Error Distribution</CardTitle>
        <CardDescription>
          Types of errors encountered during document processing
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(fullHeight ? "h-80" : "h-64")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={errorDistributionData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" />
            <YAxis dataKey="type" type="category" width={100} />
            <Tooltip
              formatter={(value, name, props) => [`${value} issues`, props.payload.type]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ display: "none" }}
            />
            <Legend />
            <Bar dataKey="count" name="Number of Issues">
              {errorDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
