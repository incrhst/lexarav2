import React from 'react';
import { ExclamationCircle, CheckCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  value?: string | number | readonly string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  error?: string;
  isValid?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  options?: Array<{ value: string; label: string }>;
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
  hint?: string;
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  isValid,
  required,
  placeholder,
  className,
  options,
  multiple,
  accept,
  disabled,
  hint,
}: FormFieldProps) {
  const baseInputClasses = 
    'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm';
  const errorInputClasses = 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500';
  const validInputClasses = 'border-green-300 text-gray-900 focus:border-green-500 focus:ring-green-500';
  const disabledInputClasses = 'bg-gray-50 text-gray-500 cursor-not-allowed';

  const getInputClasses = () => {
    let classes = baseInputClasses;
    if (error) classes = twMerge(classes, errorInputClasses);
    if (isValid) classes = twMerge(classes, validInputClasses);
    if (disabled) classes = twMerge(classes, disabledInputClasses);
    return twMerge(classes, className);
  };

  const renderInput = () => {
    const commonProps = {
      id: name,
      name,
      onChange,
      onBlur,
      disabled,
      'aria-invalid': error ? 'true' : 'false',
      'aria-describedby': error ? `${name}-error` : hint ? `${name}-hint` : undefined,
    };

    switch (type) {
      case 'select':
        return (
          <select
            {...commonProps}
            value={value}
            multiple={multiple}
            className={getInputClasses()}
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            value={value}
            placeholder={placeholder}
            className={getInputClasses()}
            rows={4}
          />
        );

      case 'file':
        return (
          <input
            {...commonProps}
            type="file"
            accept={accept}
            multiple={multiple}
            className={twMerge(
              'file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100',
              getInputClasses()
            )}
          />
        );

      default:
        return (
          <input
            {...commonProps}
            type={type}
            value={value}
            placeholder={placeholder}
            required={required}
            className={getInputClasses()}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {renderInput()}
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
        
        {isValid && !error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
          </div>
        )}
      </div>

      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500" id={`${name}-hint`}>
          {hint}
        </p>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
} 