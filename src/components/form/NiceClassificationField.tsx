import React, { useState, useEffect } from 'react';
import { Plus, Minus, AlertCircle } from 'lucide-react';
import { niceClassifications, validateClassification } from '../../utils/validation';
import FormField from './FormField';

interface NiceClassificationFieldProps {
  value: Array<{
    classNumber: number;
    specification: string;
    goods: string[];
    services: string[];
  }>;
  onChange: (value: any) => void;
  jurisdiction: string;
  error?: string;
}

export default function NiceClassificationField({
  value,
  onChange,
  jurisdiction,
  error,
}: NiceClassificationFieldProps) {
  const [localErrors, setLocalErrors] = useState<Record<number, string>>({});

  // Validate classifications when jurisdiction changes
  useEffect(() => {
    const validateAll = async () => {
      const errors: Record<number, string> = {};
      for (const classification of value) {
        const result = await validateClassification(classification, jurisdiction as any);
        if (!result.valid && result.error) {
          errors[classification.classNumber] = result.error;
        }
      }
      setLocalErrors(errors);
    };

    validateAll();
  }, [value, jurisdiction]);

  const addClass = () => {
    onChange([
      ...value,
      {
        classNumber: 1,
        specification: '',
        goods: [],
        services: [],
      },
    ]);
  };

  const removeClass = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateClassification = (index: number, field: string, newValue: any) => {
    const newClassifications = [...value];
    newClassifications[index] = {
      ...newClassifications[index],
      [field]: newValue,
    };
    onChange(newClassifications);
  };

  const addItem = (index: number, type: 'goods' | 'services', item: string) => {
    if (!item.trim()) return;
    
    const newClassifications = [...value];
    newClassifications[index] = {
      ...newClassifications[index],
      [type]: [...newClassifications[index][type], item.trim()],
    };
    onChange(newClassifications);
  };

  const removeItem = (index: number, type: 'goods' | 'services', itemIndex: number) => {
    const newClassifications = [...value];
    newClassifications[index] = {
      ...newClassifications[index],
      [type]: newClassifications[index][type].filter((_, i) => i !== itemIndex),
    };
    onChange(newClassifications);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Nice Classifications</h3>
        <button
          type="button"
          onClick={addClass}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {value.map((classification, index) => (
          <div
            key={index}
            className="bg-white shadow sm:rounded-lg p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <h4 className="text-lg font-medium text-gray-900">
                Class {classification.classNumber}
              </h4>
              <button
                type="button"
                onClick={() => removeClass(index)}
                className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>

            <FormField
              label="Class Number"
              name={`classification-${index}-number`}
              type="select"
              value={classification.classNumber.toString()}
              onChange={(e) =>
                updateClassification(index, 'classNumber', parseInt(e.target.value))
              }
              options={Object.entries(niceClassifications).map(([num, data]) => ({
                value: num,
                label: `${num} - ${data.description}`,
              }))}
              error={localErrors[classification.classNumber]}
            />

            <FormField
              label="Specification"
              name={`classification-${index}-specification`}
              type="textarea"
              value={classification.specification}
              onChange={(e) =>
                updateClassification(index, 'specification', e.target.value)
              }
              placeholder="Enter the specification for this class..."
            />

            {/* Goods */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Goods
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Add a good..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem(index, 'goods', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {classification.goods.map((good, goodIndex) => (
                  <span
                    key={goodIndex}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {good}
                    <button
                      type="button"
                      onClick={() => removeItem(index, 'goods', goodIndex)}
                      className="ml-1.5 inline-flex items-center p-0.5 rounded-full text-indigo-600 hover:bg-indigo-200 focus:outline-none"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Services
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Add a service..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem(index, 'services', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {classification.services.map((service, serviceIndex) => (
                  <span
                    key={serviceIndex}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => removeItem(index, 'services', serviceIndex)}
                      className="ml-1.5 inline-flex items-center p-0.5 rounded-full text-green-600 hover:bg-green-200 focus:outline-none"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Examples from Nice Classification */}
            <div className="mt-4 bg-gray-50 rounded-md p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Examples from Nice Classification
              </h5>
              <div className="text-sm text-gray-600">
                {niceClassifications[classification.classNumber as keyof typeof niceClassifications]?.examples.map((example, i) => (
                  <span key={i} className="inline-block mr-2 mb-1 px-2 py-1 bg-gray-100 rounded">
                    {example}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 