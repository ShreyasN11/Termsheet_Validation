
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface DocumentUploaderProps {
  onUpload: (files: File[]) => void;
}

export default function DocumentUploader({ onUpload }: DocumentUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<
    Array<{ file: File; progress: number }>
  >([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const filesWithProgress = acceptedFiles.map((file) => ({
        file,
        progress: 0,
      }));

      setUploadingFiles(filesWithProgress);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadingFiles((prevFiles) => {
          const allComplete = prevFiles.every((f) => f.progress >= 100);
          
          if (allComplete) {
            clearInterval(interval);
            onUpload(acceptedFiles);
            toast.success(
              `${acceptedFiles.length} document${
                acceptedFiles.length > 1 ? "s" : ""
              } uploaded successfully!`
            );
            return [];
          }

          return prevFiles.map((fileData) => ({
            ...fileData,
            progress: Math.min(fileData.progress + 10, 100),
          }));
        });
      }, 200);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
  });

  const cancelUpload = (index: number) => {
    setUploadingFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-primary/20 p-4">
            <Upload size={32} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-lg">
              {isDragActive ? "Drop the files here" : "Drag & drop files here"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            Supports PDF, Word Documents (.doc, .docx), and Images (.jpg, .png)
          </div>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Uploading</h3>
          {uploadingFiles.map((fileData, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3 max-w-[70%]">
                    <FileText size={20} className="text-primary shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {fileData.file.name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground mr-2">
                      {fileData.progress}%
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => cancelUpload(index)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
                <Progress value={fileData.progress} className="h-1 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
