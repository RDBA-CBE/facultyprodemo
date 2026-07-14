"use client";

import React, { useState } from "react";
import { Upload, FileText, X, Eye } from "lucide-react";

interface FileUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  className?: string;
  error?: string;
}

export default function FileUpload({ value, onChange, className, error }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF and DOC/DOCX files are allowed');
        return;
      }

      // Validate file size (12MB)
      if (file.size > 12 * 1024 * 1024) {
        alert('File size must be less than 12MB');
        return;
      }

      // Create preview URL for PDF
      if (file.type === 'application/pdf') {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setPreviewUrl(null);
    }
    
    onChange(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const removeFile = () => {
    handleFileChange(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const openPreview = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <FileText className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className={`w-full ${className}`}>
      {!value ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors bg-white ${
            dragActive 
              ? 'border-amber-400 bg-amber-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleInputChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">
              Browse File <span className="text-gray-500">or drop here</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Only PDF and DOC/DOCX files allowed. Max file size 12 MB.
            </p>
          </label>
        </div>
      ) : (
        <div className={`border-2 ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg p-4 bg-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(value.type)}
              <div>
                <p className={`text-sm font-medium truncate max-w-[200px] ${error ? 'text-red-900' : 'text-gray-900'}`}>
                  {value.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(value.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {value.type === 'application/pdf' && previewUrl && (
                <button
                  onClick={openPreview}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={removeFile}
                className="p-1 text-gray-500 hover:text-red-500"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}