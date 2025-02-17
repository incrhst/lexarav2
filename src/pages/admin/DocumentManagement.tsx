import React, { useState, useEffect } from 'react';

interface DocumentItem {
  id: number;
  name: string;
  version: number;
  status: string;
  url?: string;
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    const newDoc: DocumentItem = {
      id: Date.now(),
      name: selectedFile.name,
      version: 1,
      status: 'uploaded',
      url: selectedFile.type.startsWith('image/') ? URL.createObjectURL(selectedFile) : undefined
    };
    // Check if a document with same name exists
    const existing = documents.find(doc => doc.name === newDoc.name);
    if (existing) {
      // increment version
      existing.version += 1;
      existing.status = 'updated';
      setDocuments([...documents]);
    } else {
      setDocuments([...documents, newDoc]);
    }
    setSelectedFile(null);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold mb-4">Document Management</h2>

      {/* Search Bar */}
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search documents..."
          className="input mb-4"
        />
      </div>

      {/* Upload Section */}
      <div className="border p-4 rounded">
        <h3 className="text-xl font-semibold mb-2">Upload Document</h3>
        <input type="file" onChange={handleFileChange} className="mb-2" />
        <button onClick={handleUpload} className="btn-primary">
          Upload
        </button>
      </div>

      {/* Document List */}
      <div className="border p-4 rounded">
        <h3 className="text-xl font-semibold mb-2">Documents</h3>
        {filteredDocuments.length === 0 ? (
          <p className="text-gray-600">No documents found.</p>
        ) : (
          <ul className="space-y-4">
            {filteredDocuments.map(doc => (
              <li key={doc.id} className="p-4 border rounded flex items-center space-x-4">
                {doc.url ? (
                  <img src={doc.url} alt={doc.name} className="h-12 w-12 object-cover rounded" />
                ) : (
                  <div className="h-12 w-12 flex items-center justify-center bg-gray-200 rounded">
                    <span className="text-gray-600">File</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold">{doc.name}</p>
                  <p className="text-sm text-gray-500">Version: {doc.version}</p>
                  <p className="text-sm text-gray-500">Status: {doc.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 