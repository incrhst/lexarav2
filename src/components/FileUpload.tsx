import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

export interface FileUploadValue {
  id: string;
  file: File;
  type: 'image' | 'document';
  name: string;
  size: number;
  uploadProgress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  previewUrl?: string;
  errorMessage?: string;
}

interface Props {
  value: FileUploadValue[];
  onChange: (files: FileUploadValue[]) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
}

export default function FileUpload({ value, onChange, maxFiles = 1, accept }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles,
    accept,
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        name: file.name,
        size: file.size,
        uploadProgress: 0,
        status: 'uploading' as const,
      }));
      onChange(newFiles);
    },
  });

  return (
    <div className="mt-1">
      <div
        {...getRootProps()}
        className={`flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md ${
          isDragActive ? 'border-indigo-500 bg-indigo-50' : ''
        }`}
      >
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
              <span>Upload a file</span>
              <input {...getInputProps()} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            {accept?.['image/*']
              ? 'PNG, JPG, GIF up to 10MB'
              : 'Any file up to 10MB'}
          </p>
        </div>
      </div>

      {value.length > 0 && (
        <ul className="mt-4 divide-y divide-gray-200">
          {value.map((file) => (
            <li key={file.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">
                  {file.name}
                </span>
                {file.status === 'uploading' && (
                  <span className="ml-2 text-sm text-gray-500">
                    Uploading... {file.uploadProgress}%
                  </span>
                )}
                {file.status === 'error' && (
                  <span className="ml-2 text-sm text-red-500">
                    {file.errorMessage}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onChange(value.filter((f) => f.id !== file.id))}
                className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 