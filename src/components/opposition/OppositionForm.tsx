import React, { useState } from 'react';
import { Upload, Plus, Minus, Calendar } from 'lucide-react';
import { oppositionRecordSchema } from '../../utils/validation';
import type { z } from 'zod';

type OppositionRecord = z.infer<typeof oppositionRecordSchema>;

interface OppositionFormProps {
  applicationId: string;
  opposerId: string;
  onSubmit: (opposition: OppositionRecord) => void;
}

interface Evidence {
  id: string;
  type: string;
  filename: string;
  uploadDate: string;
  status: 'pending' | 'verified' | 'rejected';
}

interface Ground {
  id: string;
  category: string;
  description: string;
  evidence: Evidence[];
}

export default function OppositionForm({
  applicationId,
  opposerId,
  onSubmit,
}: OppositionFormProps) {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [currentGround, setCurrentGround] = useState({
    category: '',
    description: '',
  });

  const handleAddGround = () => {
    if (!currentGround.category || !currentGround.description) return;

    setGrounds((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        category: currentGround.category,
        description: currentGround.description,
        evidence: [],
      },
    ]);

    setCurrentGround({ category: '', description: '' });
  };

  const handleRemoveGround = (groundId: string) => {
    setGrounds((prev) => prev.filter((ground) => ground.id !== groundId));
  };

  const handleFileUpload = (groundId: string, files: FileList) => {
    const newEvidence: Evidence[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      type: file.type,
      filename: file.name,
      uploadDate: new Date().toISOString(),
      status: 'pending',
    }));

    setGrounds((prev) =>
      prev.map((ground) =>
        ground.id === groundId
          ? { ...ground, evidence: [...ground.evidence, ...newEvidence] }
          : ground
      )
    );
  };

  const handleRemoveEvidence = (groundId: string, evidenceId: string) => {
    setGrounds((prev) =>
      prev.map((ground) =>
        ground.id === groundId
          ? {
              ...ground,
              evidence: ground.evidence.filter((e) => e.id !== evidenceId),
            }
          : ground
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (grounds.length === 0) {
      alert('Please add at least one ground for opposition');
      return;
    }

    const opposition: OppositionRecord = {
      id: crypto.randomUUID(),
      applicationId,
      opposerId,
      status: 'draft',
      grounds,
      timeline: [
        {
          id: crypto.randomUUID(),
          event: 'Opposition initiated',
          date: new Date().toISOString(),
        },
      ],
      decisions: [],
      hearings: [],
    };

    onSubmit(opposition);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Add Ground Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Add Ground for Opposition
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={currentGround.category}
                onChange={(e) =>
                  setCurrentGround((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              >
                <option value="">Select a category</option>
                <option value="prior_rights">Prior Rights</option>
                <option value="distinctiveness">Lack of Distinctiveness</option>
                <option value="bad_faith">Bad Faith</option>
                <option value="deceptive">Deceptive</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={currentGround.description}
                onChange={(e) =>
                  setCurrentGround((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <button
                type="button"
                onClick={handleAddGround}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Ground
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grounds List */}
      <div className="space-y-4">
        {grounds.map((ground) => (
          <div
            key={ground.id}
            className="bg-white shadow sm:rounded-lg overflow-hidden"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {ground.category}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {ground.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveGround(ground.id)}
                  className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              {/* Evidence Section */}
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700">Evidence</h5>
                <div className="mt-2 space-y-2">
                  {ground.evidence.map((evidence) => (
                    <div
                      key={evidence.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <Upload className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">
                            {evidence.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(evidence.uploadDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            evidence.status === 'verified'
                              ? 'bg-green-100 text-green-800'
                              : evidence.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {evidence.status}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveEvidence(ground.id, evidence.id)
                          }
                          className="p-1 text-gray-400 hover:text-gray-500"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="mt-2">
                    <label className="block">
                      <span className="sr-only">Choose files</span>
                      <input
                        type="file"
                        multiple
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        onChange={(e) =>
                          e.target.files &&
                          handleFileUpload(ground.id, e.target.files)
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit Opposition
        </button>
      </div>
    </form>
  );
} 