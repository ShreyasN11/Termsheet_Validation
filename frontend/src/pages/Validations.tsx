
import MainLayout from "@/components/layout/MainLayout";
import ValidationFilters from "@/components/validations/ValidationFilters";
import ValidationSummary from "@/components/validations/ValidationSummary";
import SearchInput from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// Mock data for validation details
const mockValidations = [
  {
    term: "Valuation",
    extractedValue: "$10M",
    expectedValue: "$10M",
    confidence: 95,
    status: "validated",
  },
  {
    term: "Amount",
    extractedValue: "$2M",
    expectedValue: "$2M",
    confidence: 98,
    status: "validated",
  },
  {
    term: "Price per share",
    extractedValue: "$1.25",
    expectedValue: "$1.25",
    confidence: 99,
    status: "validated",
  },
  {
    term: "Liquidation Preference",
    extractedValue: "1x",
    expectedValue: "1x",
    confidence: 85,
    status: "validated",
  },
  {
    term: "Vesting",
    extractedValue: "4 years",
    expectedValue: "4 years",
    confidence: 92,
    status: "validated",
  },
  {
    term: "Valuation",
    extractedValue: "$9M",
    expectedValue: "$10M",
    confidence: 60,
    status: "error",
  },
  {
    term: "Amount",
    extractedValue: "$1.8M",
    expectedValue: "$2M",
    confidence: 70,
    status: "warning",
  },
  {
    term: "Price per share",
    extractedValue: "$1.20",
    expectedValue: "$1.25",
    confidence: 75,
    status: "warning",
  },
  {
    term: "Liquidation Preference",
    extractedValue: "1.2x",
    expectedValue: "1x",
    confidence: 50,
    status: "error",
  },
  {
    term: "Vesting",
    extractedValue: "3 years",
    expectedValue: "4 years",
    confidence: 40,
    status: "error",
  },
  {
    term: "Amount",
    extractedValue: "$2M",
    expectedValue: "$2M",
    confidence: 98,
    status: "validated",
  },
  {
    term: "Price per share",
    extractedValue: "$1.25",
    expectedValue: "$1.25",
    confidence: 99,
    status: "validated",
  },
  {
    term: "Liquidation Preference",
    extractedValue: "1x",
    expectedValue: "1x",
    confidence: 85,
    status: "validated",
  },
  {
    term: "Vesting",
    extractedValue: "4 years",
    expectedValue: "4 years",
    confidence: 92,
    status: "validated",
  },
  {
    term: "Pro-rata rights",
    extractedValue: "Yes",
    expectedValue: "Yes",
    confidence: 92,
    status: "validated",
  },
];

export default function Validations() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredValidations = useMemo(() => {
    let filtered = mockValidations;

    if (selectedFilter !== "all") {
      filtered = filtered.filter(
        (validation) => validation.status === selectedFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((validation) =>
        validation.term.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [mockValidations, selectedFilter, searchTerm]);

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Validations</h1>
        <p className="text-muted-foreground">
          Automated validation of term sheet financial details
        </p>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <ValidationFilters
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />

          <div className="flex items-center gap-2">
            <SearchInput
              placeholder="Search terms..."
              onSearch={setSearchTerm}
            />
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <ValidationSummary validations={filteredValidations} />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Validation Details</CardTitle>
            <CardDescription>
              AI-extracted financial terms with validation status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Term</TableHead>
                  <TableHead>Extracted Value</TableHead>
                  <TableHead>Expected Value</TableHead>
                  <TableHead className="text-center">Confidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredValidations.map((validation, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {validation.term}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "font-mono",
                        validation.status === "error" && "text-finance-error"
                      )}
                    >
                      {validation.extractedValue}
                    </TableCell>
                    <TableCell className="font-mono">
                      {validation.expectedValue || "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Progress
                          value={validation.confidence}
                          className="h-2 w-24"
                        />
                        <span className="ml-2 text-xs">
                          {validation.confidence}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "capitalize",
                          validation.status === "validated" &&
                            "text-finance-success",
                          validation.status === "error" && "text-finance-error",
                          validation.status === "warning" &&
                            "text-finance-warning"
                        )}
                      >
                        {validation.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Actions can be implemented here, e.g., edit, view details */}
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
