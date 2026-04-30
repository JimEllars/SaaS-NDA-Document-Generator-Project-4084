import React, { useState, useEffect } from 'react';
import { FiFileText, FiDownload } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const MyRecentNDAs = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/v1/user/document-history', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setDocuments(data.documents || []);
        } else {
          setError('Failed to load history');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <div className="text-zinc-500 animate-pulse text-sm">Loading Vault History...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-sm">Vault Error: {error}</div>;
  }

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-12 mb-8 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2 mb-4">
        <SafeIcon icon={FiFileText} className="text-axim-teal" /> My Recent NDAs
      </h3>
      <div className="space-y-3">
        {documents.map((doc, index) => (
          <div key={index} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5 hover:border-axim-teal/30 transition-all">
            <div>
              <p className="font-bold text-zinc-200">{doc.title || 'Non-Disclosure Agreement'}</p>
              <p className="text-xs text-zinc-500 font-mono mt-1">Trace ID: {doc.trace_id}</p>
              <p className="text-xs text-zinc-500 mt-1">{new Date(doc.created_at).toLocaleString()}</p>
            </div>
            <button
              onClick={() => {
                // Since this is a placeholder/mock of actual retrieval:
                alert('Downloading from Vault: ' + doc.trace_id);
              }}
              className="p-2 bg-zinc-800 text-axim-teal rounded-lg hover:bg-zinc-700 hover:text-teal-300 transition-colors"
              title="Download from Vault"
            >
              <SafeIcon icon={FiDownload} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRecentNDAs;
