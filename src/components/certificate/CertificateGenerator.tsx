import React, { useState } from 'react';
import { Download, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { TemplateService } from '../../services/templateService';

interface CertificateGeneratorProps {
  applicationId: string;
  registrationNumber: string;
  applicantName: string;
  markDetails: {
    title: string;
    type: string;
    classes: Array<{ number: number; description: string }>;
  };
  registrationDate: string;
  renewalDate: string;
}

const certificateSchema = z.object({
  certificateNumber: z.string(),
  registrationNumber: z.string(),
  applicantName: z.string(),
  markDetails: z.object({
    title: z.string(),
    type: z.string(),
    classes: z.array(z.object({
      number: z.number(),
      description: z.string(),
    })),
  }),
  registrationDate: z.string(),
  renewalDate: z.string(),
  digitalSignature: z.string(),
  qrCode: z.string(),
  issuedDate: z.string(),
});

type Certificate = z.infer<typeof certificateSchema>;

export default function CertificateGenerator({
  applicationId,
  registrationNumber,
  applicantName,
  markDetails,
  registrationDate,
  renewalDate,
}: CertificateGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateCertificateNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `CERT-${year}-${random}`;
  };

  const generateQRCode = () => {
    // In a real implementation, this would generate a QR code with certificate details
    return `https://verify.ip.gov/cert/${registrationNumber}`;
  };

  const generateDigitalSignature = () => {
    // In a real implementation, this would use a proper digital signature algorithm
    return `DIGSIG-${Date.now()}-${registrationNumber}`;
  };

  const handleGenerateCertificate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Create certificate data
      const certificateData: Certificate = {
        certificateNumber: generateCertificateNumber(),
        registrationNumber,
        applicantName,
        markDetails,
        registrationDate,
        renewalDate,
        digitalSignature: generateDigitalSignature(),
        qrCode: generateQRCode(),
        issuedDate: new Date().toISOString(),
      };

      // Validate certificate data
      certificateSchema.parse(certificateData);

      // In a real implementation, you would:
      // 1. Call an API to generate the PDF
      // 2. Store the certificate in the database
      // 3. Generate and store the digital signature
      // 4. Create and store the QR code

      setCertificate(certificateData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate certificate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!certificate) return;

    try {
      await TemplateService.downloadCertificate(
        'trademark_certificate.docx',
        certificate,
        `certificate-${certificate.certificateNumber}.docx`
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to download certificate');
    }
  };

  const handleEmailCertificate = () => {
    // In a real implementation, this would email the certificate to the applicant
    console.log('Emailing certificate to:', applicantName);
  };

  return (
    <div className="space-y-6">
      {/* Certificate Generation Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Certificate Generation
          </h3>
          
          {!certificate ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleGenerateCertificate}
                disabled={isGenerating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin mr-2">⌛</span>
                    Generating...
                  </>
                ) : (
                  'Generate Certificate'
                )}
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700">
                  Certificate generated successfully
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Certificate Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {certificate.certificateNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Issue Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(certificate.issuedDate).toLocaleDateString()}
                  </dd>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleDownloadCertificate}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </button>
                <button
                  type="button"
                  onClick={handleEmailCertificate}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Email Certificate
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error generating certificate
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
    </div>
  );
} 