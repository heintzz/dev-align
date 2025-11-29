import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

import {
  Upload,
  Image as ImageIcon,
  FileText,
  Video,
  Loader2,
} from "lucide-react";
// import { cn } from "@/lib/utils";

export default function UploadFile({
  label = "Upload File",
  accept = "*/*",
  iconType = "file", // "image" | "video" | "file"
  onFileSelect = () => {},
  disabled = false,
  maxSizeMB = 5,
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
    onFileSelect(selectedFile);

    // Show preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange({ target: { files: [droppedFile] } });
    }
  };

  const handleClick = () => {
    if (!disabled) fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      // Simulate upload process
      await new Promise((r) => setTimeout(r, 1500));
      alert("File uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    if (loading)
      return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
    switch (iconType) {
      case "image":
        return <ImageIcon className="h-6 w-6 text-blue-500" />;
      case "video":
        return <Video className="h-6 w-6 text-purple-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <Card
      className={`w-full h-48 border-dashed border-2 rounded-2xl  transition hover:border-primary cursor-pointer`}
      onClick={handleClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <CardContent className="flex flex-col h-full items-center justify-center gap-3 text-center">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-lg border"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            {getIcon()}
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        )}

        <input
          type="file"
          accept={accept}
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {file && (
          <div className="flex flex-col items-center gap-2 mt-2">
            <p className="text-sm font-medium">{file.name}</p>
            {/* <Button
              onClick={handleUpload}
              size="sm"
              disabled={loading || disabled}
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4" />
              {loading ? "Uploading..." : "Upload"}
            </Button> */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
