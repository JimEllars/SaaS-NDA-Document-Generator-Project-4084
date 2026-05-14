import React, { useState } from 'react';
import { FiSearch, FiShield, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

export default function VerificationPortal() {
  const [traceId, setTraceId] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [documentData, setDocumentData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!traceId.trim()) return;

    setStatus('loading');
    setErrorMsg('');
    setDocumentData(null);

    try {
      const response = await fetch(`/api/verify-document?trace_id=${encodeURIComponent(traceId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Document not found or invalid trace ID');
      }

      const data = await response.json();
      setDocumentData(data);
      setStatus('success');
    } catch (err) {
      console.error('Verification error:', err);
      setErrorMsg(err.message || 'Verification failed');
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto mt-10">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl w-full text-zinc-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-axim-teal rounded-full opacity-10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8">
            <SafeIcon icon={FiShield} size={48} className="text-axim-teal mb-4" />
            <h1 className="text-3xl font-bold mb-2">Public Verification Portal</h1>
            <p className="text-zinc-400 text-center">
              Verify the authenticity of an AXiM-generated NDA. Enter the Secure Trace ID found in the footer of the document.
            </p>
          </div>

          <form onSubmit={handleVerify} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={traceId}
                onChange={(e) => setTraceId(e.target.value)}
                placeholder="Enter Secure Trace ID..."
                className="flex-1 p-4 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-axim-teal focus:border-axim-teal outline-none text-zinc-100 placeholder-zinc-500 font-mono"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-axim-teal text-black font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 hover:bg-axim-teal/90 transition disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
                ) : (
                  <>
                    <SafeIcon icon={FiSearch} size={20} /> Verify
                  </>
                )}
              </button>
            </div>
          </form>

          {status === 'error' && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3">
              <SafeIcon icon={FiAlertCircle} size={24} />
              <p>{errorMsg}</p>
            </div>
          )}

          {status === 'success' && documentData && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="bg-zinc-900 border border-axim-teal/30 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <SafeIcon icon={FiCheckCircle} size={28} className="text-axim-teal" />
                  <h3 className="text-xl font-bold text-axim-teal">Verified Document</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Disclosing Party</p>
                    <p className="font-bold">{documentData.metadata?.disclosing || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Receiving Party</p>
                    <p className="font-bold">{documentData.metadata?.receiving || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Effective Date</p>
                    <p className="font-bold">{documentData.metadata?.effectiveDate || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Document Hash</p>
                    <p className="font-mono text-sm break-all text-zinc-300">{documentData.hash || 'Unknown'}</p>
                  </div>
                </div>
              </div>

              {/* Social Preview Card */}
              <div className="bg-black/80 border border-white/20 p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(0,229,255,0.15)] relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-axim-teal rounded-full opacity-10 blur-3xl pointer-events-none"></div>
                <SafeIcon icon={FiShield} size={48} className="text-axim-teal mb-4 relative z-10" />
                <h4 className="text-2xl font-bold text-white mb-2 relative z-10">AXiM Verified Agreement</h4>
                <p className="text-zinc-400 mb-6 max-w-md relative z-10">
                  This Non-Disclosure Agreement between <strong>{documentData.metadata?.disclosing || 'Unknown'}</strong> and <strong>{documentData.metadata?.receiving || 'Unknown'}</strong> has been cryptographically verified by AXiM Systems.
                </p>
                <div className="flex items-center gap-2 text-green-400 font-bold bg-green-400/10 px-4 py-2 rounded-full border border-green-400/20 relative z-10">
                  <SafeIcon icon={FiCheckCircle} size={18} /> Verified Active
                </div>
                <p className="text-xs text-zinc-600 mt-6 relative z-10">
                  Date: {documentData.metadata?.effectiveDate || 'Unknown'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
