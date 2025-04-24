
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, AlertCircle, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationFiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function ValidationFilters({
  selectedFilter,
  onFilterChange,
}: ValidationFiltersProps) {
  const filters = [
    {
      value: "all",
      label: "All",
      icon: <ListFilter className="h-4 w-4" />,
    },
    {
      value: "validated",
      label: "Validated",
      icon: <CheckCircle2 className="h-4 w-4 text-finance-success" />,
    },
    {
      value: "error",
      label: "Errors",
      icon: <AlertCircle className="h-4 w-4 text-finance-error" />,
    },
    {
      value: "warning",
      label: "Warnings",
      icon: <AlertTriangle className="h-4 w-4 text-finance-warning" />,
    },
  ];

  return (
    <div className="flex space-x-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={selectedFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            selectedFilter === filter.value &&
              filter.value === "validated" &&
              "bg-finance-success hover:bg-finance-success/90",
            selectedFilter === filter.value &&
              filter.value === "error" &&
              "bg-finance-error hover:bg-finance-error/90",
            selectedFilter === filter.value &&
              filter.value === "warning" &&
              "bg-finance-warning hover:bg-finance-warning/90"
          )}
        >
          {filter.icon}
          <span className="ml-1">{filter.label}</span>
        </Button>
      ))}
    </div>
  );
}
