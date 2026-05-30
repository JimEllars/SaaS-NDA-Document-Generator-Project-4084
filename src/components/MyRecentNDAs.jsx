import React, { useState, useEffect } from 'react';
import { FiFileText, FiDownload, FiXCircle } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const MyRecentNDAs = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);


  const handleRevoke = async (trace_id) => {
    if (processingId) return;
    setProcessingId(trace_id);
    try {
      const response = await fetch('/api/vault-revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trace_id })
      });
      if (!response.ok) throw new Error('Revocation failed');

      // Update local state
      setDocuments(prevDocs =>
        prevDocs.map(doc =>
          doc.trace_id === trace_id ? { ...doc, status: 'REVOKED' } : doc
        )
      );
      alert('Document revoked successfully');
    } catch (err) {
      alert('Error revoking document: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownload = async (trace_id) => {
    if (processingId) return;
    setProcessingId(trace_id);
    try {
      const response = await fetch(`/api/v1/vault-download?trace_id=${trace_id}`, {
        method: 'GET'
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NDA_${trace_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error downloading document: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

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
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${doc.status === 'REVOKED' ? 'bg-red-900/30 text-red-400 border border-red-500/30' : doc.status === 'PENDING' ? 'bg-amber-900/30 text-amber-400 border border-amber-500/30' : doc.status === 'EXECUTED' ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
                {doc.status || 'ACTIVE'}
              </span>
              {(doc.status === 'PENDING' || doc.status === 'ACTIVE' || !doc.status) && (
                <button
                  onClick={() => handleRevoke(doc.trace_id)}
                  disabled={processingId === doc.trace_id}
                  className={`p-2 rounded-lg transition-colors flex items-center justify-center ${processingId === doc.trace_id ? 'bg-zinc-800/50 text-red-400/50 cursor-not-allowed' : 'bg-zinc-800 text-red-400 hover:bg-zinc-700 hover:text-red-300'}`}
                  title="Revoke Document"
                >
                  {processingId === doc.trace_id ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" /> : <SafeIcon icon={FiXCircle} />}
                </button>
              )}
              <button
                onClick={() => handleDownload(doc.trace_id)}
                disabled={processingId === doc.trace_id}
                className={`p-2 rounded-lg transition-colors flex items-center justify-center ${processingId === doc.trace_id ? 'bg-zinc-800/50 text-axim-teal/50 cursor-not-allowed' : 'bg-zinc-800 text-axim-teal hover:bg-zinc-700 hover:text-teal-300'}`}
                title="Download from Vault"
              >
                {processingId === doc.trace_id ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-axim-teal border-t-transparent" /> : <SafeIcon icon={FiDownload} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRecentNDAs;
