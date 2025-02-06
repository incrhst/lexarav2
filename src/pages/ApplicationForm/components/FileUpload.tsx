import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileAttachment } from '../types';
import { XCircle, FileText, Image } from 'lucide-react';

interface Props {
  value: FileAttachment[];
  onChange: (files: FileAttachment[]) => void;
  maxSize?: number;
  accept?: Record<string, string[]>;
  maxFiles?: number;
}

export default function FileUpload({
  value = [],
  onChange,
  maxSize = 10485760, // 10MB
  accept = {
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.svg'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  maxFiles = 10,
}: Props) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file): FileAttachment => ({
      id: Math.random().toString(36).substring(7),
      file,
      type: file.type.startsWith('image/') ? 'image' : 'document',
      name: file.name,
      size: file.size,
      uploadProgress: 0,
      status: 'uploading',
    }));

    onChange([...value, ...newFiles]);
  }, [value, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept,
    maxFiles: maxFiles - value.length,
  });

  const removeFile = (id: string) => {
    onChange(value.filter(file => file.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag and drop files here, or click to select files'}
          </p>
          <p className="text-xs text-gray-500">
            Supported files: Images (JPG, PNG, GIF, SVG), Documents (PDF, DOC, DOCX)
            <br />
            Maximum file size: 10MB
          </p>
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((file) => (
            <div
              key={file.id}
              className="relative flex items-center p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0 mr-4">
                {file.type === 'image' ? (
                  <Image className="w-8 h-8 text-gray-400" />
                ) : (
                  <FileText className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {file.status === 'uploading' && (
                  <div className="w-full h-1 bg-gray-200 rounded-full mt-2">
                    <div
                      className="h-1 bg-primary rounded-full"
                      style={{ width: `${file.uploadProgress}%` }}
                    />
                  </div>
                )}
                {file.status === 'error' && (
                  <p className="text-xs text-red-500 mt-1">
                    {file.errorMessage || 'Upload failed'}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 