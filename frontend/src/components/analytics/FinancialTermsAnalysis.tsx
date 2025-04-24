
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Mock data for the financial terms analysis
const financialTermsData = [
  { name: "Valuation", value: 35 },
  { name: "Equity", value: 25 },
  { name: "Liquidation", value: 15 },
  { name: "Vesting", value: 10 },
  { name: "Convertible Note", value: 8 },
  { name: "Other", value: 7 },
];

const COLORS = ["#0A84FF", "#64FFDA", "#FF9800", "#E91E63", "#673AB7", "#607D8B"];

export default function FinancialTermsAnalysis() {
  // Calculate total
  const total = financialTermsData.reduce((acc, item) => acc + item.value, 0);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Financial Terms Distribution</CardTitle>
        <CardDescription>
          Analysis of extracted financial terms across documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialTermsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {financialTermsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} (${Math.round((Number(value) / total) * 100)}%)`, 'Count']}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }} 
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Term Frequency Analysis
            </h3>
            <div className="space-y-4">
              {financialTermsData.map((term, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{term.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {term.value} ({Math.round((term.value / total) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${(term.value / total) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
