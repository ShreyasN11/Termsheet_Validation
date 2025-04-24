
import { FileText, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DocumentListProps {
  documents: any[];
  onSelectDocument: (document: any) => void;
  selectedDocumentId?: string;
}

export default function DocumentList({ 
  documents, 
  onSelectDocument, 
  selectedDocumentId 
}: DocumentListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "validated":
        return <CheckCircle className="h-4 w-4 text-finance-success" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-finance-error" />;
      case "processing":
        return <Clock className="h-4 w-4 text-finance-info" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "validated":
        return "text-finance-success";
      case "error":
        return "text-finance-error";
      case "processing":
        return "text-finance-info";
      default:
        return "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">File Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden sm:table-cell">Uploaded</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow 
              key={doc.id}
              className={cn(
                selectedDocumentId === doc.id ? "bg-muted/50" : "cursor-pointer hover:bg-muted/30",
              )}
              onClick={() => onSelectDocument(doc)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <FileText size={16} className="text-primary" />
                  <span className="truncate">{doc.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(doc.status)}
                  <span className={cn("text-xs", getStatusClass(doc.status))}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </div>
              </TableCell>
              <TableCell>{formatFileSize(doc.size)}</TableCell>
              <TableCell className="hidden md:table-cell">
                {doc.type.split("/")[1]?.toUpperCase() || doc.type}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">
                {formatDistanceToNow(new Date(doc.uploadDate), { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}

          {documents.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No documents uploaded yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
