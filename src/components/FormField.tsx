import React from 'react';

interface Props {
  label: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
}

export default function FormField({
  label,
  error,
  children,
  optional,
}: Props) {
  return (
    <div>
      <div className="flex justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {optional && (
          <span className="text-sm text-gray-500">Optional</span>
        )}
      </div>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}