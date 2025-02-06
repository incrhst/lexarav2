import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Search, Info } from 'lucide-react';
import FormField from '../../../../components/FormField';
import { ApplicationFormData, TrademarkDetails } from '../../types';
import { findMatchingClasses, getRelatedClasses, niceClassDescriptions } from './goodsServicesData';

interface Props {
  form: UseFormReturn<ApplicationFormData>;
  onSubmit: () => void;
  onCancel: () => void;
  onBack: () => void;
  isLoading: boolean;
  isLastStep: boolean;
}

interface Suggestion {
  class: number;
  description: string;
  confidence: 'high' | 'medium' | 'low';
}

export default function GoodsServicesWizard({
  form,
  onSubmit,
  onCancel,
  onBack,
  isLoading,
  isLastStep,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const { register, formState: { errors }, setValue, watch } = form;
  const details = watch('details') as TrademarkDetails;
  const selectedClasses = details?.goodsServicesClass || [];

  // Update suggestions when search term changes
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    // Find direct matches
    const matches = findMatchingClasses(searchTerm);
    const directSuggestions = matches.map(match => ({
      class: match.class,
      description: match.description,
      confidence: 'high' as const
    }));

    // Find related classes for each match
    const relatedClasses = matches.flatMap(match => 
      getRelatedClasses(match.class).map(relatedClass => ({
        class: relatedClass,
        description: niceClassDescriptions[relatedClass]?.description || '',
        confidence: 'medium' as const
      }))
    );

    // Combine and deduplicate suggestions
    const allSuggestions = [...directSuggestions, ...relatedClasses]
      .reduce((unique, item) => {
        const exists = unique.find(u => u.class === item.class);
        if (!exists) unique.push(item);
        return unique;
      }, [] as Suggestion[]);

    setSuggestions(allSuggestions);
  }, [searchTerm]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, classNum: number) => {
    const currentValues = (form.getValues('details') as TrademarkDetails)?.goodsServicesClass || [];
    if (e.target.checked) {
      setValue('details.goodsServicesClass', [...currentValues, classNum]);
    } else {
      setValue('details.goodsServicesClass', currentValues.filter(v => v !== classNum));
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Goods & Services Classification
        </h2>
        <p className="text-sm text-gray-500">
          Enter your goods or services to get classification suggestions, or browse all classes below.
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type your goods or services (e.g., 'lipstick' or 'software development')..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Suggested Classifications
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.class} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(suggestion.class)}
                        onChange={(e) => handleCheckboxChange(e, suggestion.class)}
                        className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <div className="ml-3">
                        <span className="font-medium">Class {suggestion.class}</span>
                        <span className="mx-2">•</span>
                        <span>{suggestion.description}</span>
                        {suggestion.confidence === 'high' && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Recommended
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <FormField
        label="Nice Classification"
        error={(errors.details as any)?.goodsServicesClass?.message}
      >
        <div className="mt-4 space-y-4">
          {Object.entries(niceClassDescriptions).map(([classNum, info]) => (
            <div key={classNum} className="relative flex items-start py-4 border-b border-gray-200">
              <div className="min-w-0 flex-1 text-sm">
                <label className="font-medium text-gray-700 select-none">
                  Class {classNum} - {info.title}
                </label>
                <p className="text-gray-500">{info.description}</p>
                {info.examples && (
                  <p className="mt-1 text-sm text-gray-500">
                    Examples: {info.examples.join(', ')}
                  </p>
                )}
              </div>
              <div className="ml-3 flex items-center h-5">
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(Number(classNum))}
                  onChange={(e) => handleCheckboxChange(e, Number(classNum))}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
            </div>
          ))}
        </div>
      </FormField>

      {selectedClasses.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Selected Classes ({selectedClasses.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedClasses.map((classNum) => (
              <span
                key={classNum}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                Class {classNum}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? 'Saving...' : isLastStep ? 'Submit Application' : 'Next'}
          </button>
        </div>
      </div>
    </form>
  );
} 