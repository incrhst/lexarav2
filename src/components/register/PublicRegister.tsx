import React, { useState } from 'react';
import { Search, QrCode, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { z } from 'zod';

interface SearchResult {
  id: string;
  registrationNumber: string;
  certificateNumber: string;
  markTitle: string;
  applicantName: string;
  registrationDate: string;
  status: 'active' | 'expired' | 'revoked';
  classes: Array<{ number: number; description: string }>;
}

const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['registration', 'certificate', 'mark', 'applicant']),
});

export default function PublicRegister() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'registration' | 'certificate' | 'mark' | 'applicant'>('registration');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const handleSearch = async () => {
    setIsSearching(true);
    setError(null);
    setVerificationResult(null);

    try {
      // Validate search input
      searchSchema.parse({ query: searchQuery, type: searchType });

      // In a real implementation, this would call an API to search the database
      // Mock results for demonstration
      const mockResults: SearchResult[] = [
        {
          id: '1',
          registrationNumber: 'REG-2024-00001',
          certificateNumber: 'CERT-2024-00001',
          markTitle: 'Example Mark',
          applicantName: 'Example Company Ltd',
          registrationDate: '2024-01-01',
          status: 'active',
          classes: [
            { number: 9, description: 'Computer software' },
            { number: 42, description: 'Software as a service' },
          ],
        },
      ];

      setResults(mockResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerifyCertificate = async (certificateNumber: string) => {
    setVerificationResult(null);
    setError(null);

    try {
      // In a real implementation, this would verify the certificate's digital signature
      // and check its validity against the database
      const isValid = true; // Mock result

      setVerificationResult({
        isValid,
        message: isValid
          ? 'Certificate is valid and authentic'
          : 'Certificate verification failed',
      });
    } catch (err) {
      setError('Certificate verification failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Public Register Search
          </h3>
          
          <div className="mt-4 flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search term..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as typeof searchType)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="registration">Registration Number</option>
                <option value="certificate">Certificate Number</option>
                <option value="mark">Mark Title</option>
                <option value="applicant">Applicant Name</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSearching ? (
                <>
                  <span className="animate-spin mr-2">⌛</span>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Search Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Search Results
            </h3>
            
            <div className="mt-4 space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {result.markTitle}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {result.applicantName}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        result.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : result.status === 'expired'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Registration Number
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {result.registrationNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Certificate Number
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {result.certificateNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Registration Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(result.registrationDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Classes
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {result.classes.map((c) => c.number).join(', ')}
                      </dd>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => handleVerifyCertificate(result.certificateNumber)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Verify Certificate
                    </button>
                    <a
                      href={`/register/${result.registrationNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </a>
                  </div>

                  {verificationResult && (
                    <div
                      className={`mt-4 rounded-md ${
                        verificationResult.isValid
                          ? 'bg-green-50'
                          : 'bg-red-50'
                      } p-4`}
                    >
                      <div className="flex">
                        {verificationResult.isValid ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        )}
                        <div className="ml-3">
                          <h3
                            className={`text-sm font-medium ${
                              verificationResult.isValid
                                ? 'text-green-800'
                                : 'text-red-800'
                            }`}
                          >
                            Certificate Verification
                          </h3>
                          <div
                            className={`mt-2 text-sm ${
                              verificationResult.isValid
                                ? 'text-green-700'
                                : 'text-red-700'
                            }`}
                          >
                            {verificationResult.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 