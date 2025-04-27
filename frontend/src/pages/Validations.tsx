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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import { useParams } from "react-router-dom";

interface ValidationResult {
  term: string;
  extractedValue: string | number;
  expectedValue: string | number;
  confidence: number;
  status: "validated" | "error" | "warning";
}

interface BackendValidation {
  termsheet: Record<string, any>;
  reference_swap: Record<string, any>;
  tradeId: string;
}

export default function Validations() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [validations, setValidations] = useState<ValidationResult[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = user?.emailAddresses?.[0]?.emailAddress;
        if (!email) {
          setError("No email address found");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/get_term?email=${id}`
        );

        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const backendData: BackendValidation[] = await response.json();
        console.log("Backend Data:", backendData);
        const transformed = Array.isArray(backendData)
          ? backendData.flatMap((validation) => {
              // Defensive: skip if termsheet or reference_swap is missing
              if (
                !validation ||
                !validation.termsheet ||
                !validation.reference_swap
              )
                return [];
              return Object.entries(validation.termsheet)
                .filter(([key]) => !["_id", "traderId"].includes(key))
                .map(([term, extractedValue]) => {
                  const expectedValue =
                    validation.reference_swap[term] ?? "N/A";
                  const isMatch = extractedValue === expectedValue;
                  return {
                    term: term.replace(/_/g, " ").toUpperCase(),
                    extractedValue,
                    expectedValue,
                    confidence: isMatch
                      ? 100
                      : calculateConfidence(extractedValue, expectedValue),
                    status: isMatch ? "validated" : "error",
                  };
                });
            })
          : [];

        setValidations(transformed);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatTermName = (term: string) =>
    term.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const calculateConfidence = (extracted: any, expected: any): number => {
    if (typeof extracted === "number" && typeof expected === "number") {
      const max = Math.max(Math.abs(extracted), Math.abs(expected)) || 1;
      const diff = Math.abs(extracted - expected);
      return Math.round((1 - diff / max) * 100);
    }
    return extracted === expected ? 100 : 0;
  };

  const getValidationStatus = (confidence: number) =>
    confidence === 100 ? "validated" : confidence >= 80 ? "warning" : "error";

  const filteredValidations = useMemo(() => {
    let filtered = validations;

    if (selectedFilter !== "all") {
      filtered = filtered.filter((v) => v.status === selectedFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter((v) =>
        v.term.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [validations, selectedFilter, searchTerm]);

  const formatValue = (value: any) => {
    if (typeof value === "number") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    }
    return value.toString();
  };

  if (error)
    return (
      <MainLayout>
        <div className="text-red-500 p-4">{error}</div>
      </MainLayout>
    );
  if (loading)
    return (
      <MainLayout>
        <div className="p-4">Loading...</div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Term Sheet Validation</h1>
        <p className="text-muted-foreground">
          AI-powered financial term validation
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <ValidationFilters {...{ selectedFilter, setSelectedFilter }} />
          <div className="flex gap-2">
            <SearchInput
              placeholder="Search terms..."
              onSearch={setSearchTerm}
            />
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <ValidationSummary validations={filteredValidations} />

        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              Comparison of extracted vs expected values
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Financial Term</TableHead>
                  <TableHead>Extracted Value</TableHead>
                  <TableHead>Risk System Value</TableHead>
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
                    <TableCell className="font-mono">
                      {formatValue(validation.extractedValue)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatValue(validation.expectedValue)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Progress
                          value={validation.confidence}
                          className="h-2 w-24"
                        />
                        <span className="text-xs">
                          {validation.confidence}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "capitalize",
                          validation.status === "validated" && "text-green-600",
                          validation.status === "warning" && "text-yellow-600",
                          validation.status === "error" && "text-red-600"
                        )}
                      >
                        {validation.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Details
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
