import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiShield, FiCheckCircle, FiAlertCircle, FiPenTool, FiRefreshCw, FiCheck } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SignatureCanvas from 'react-signature-canvas';

export default function VerificationPortal() {
  const [searchParams] = useSearchParams();
  const [traceId, setTraceId] = useState(searchParams.get('trace_id') || '');
  const isSignMode = searchParams.get('action') === 'sign';

  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [documentData, setDocumentData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Signature state
  const [signatureMode, setSignatureMode] = useState('type');
  const [typedSignature, setTypedSignature] = useState('');
  const [isSigEmpty, setIsSigEmpty] = useState(true);
  const sigCanvas = useRef(null);

  // Handle window resize for SignatureCanvas
  useEffect(() => {
    const handleResize = () => {
      if (sigCanvas.current) {
        // Save current drawn data
        const data = sigCanvas.current.toData();
        sigCanvas.current.clear();
        setTimeout(() => {
          if (sigCanvas.current) {
            if (data && data.length > 0) {
              sigCanvas.current.fromData(data);
              setIsSigEmpty(false);
            } else {
              setIsSigEmpty(true);
            }
          }
        }, 50);
      }
    };

    let resizeTimer;
    const debouncedHandleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        handleResize();
      }, 100);
    };

    window.addEventListener("resize", debouncedHandleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", debouncedHandleResize);
    }
  }, []);
  const [signatureImage, setSignatureImage] = useState(null);
  const [isSigning, setIsSigning] = useState(false);

  // Scroll lock mechanism to prevent scrolling while drawing signature
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (e.target.closest('.signature-canvas-wrapper')) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  useEffect(() => {
    if (traceId && isSignMode && status === 'idle') {
      handleVerify(new Event('submit'));
    }
  }, [traceId, isSignMode, status]);

  const handleVerify = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (!response.ok) {
        throw new Error('Document not found or invalid trace ID');
      }

      const data = await response.json();
      if (data.status === 'REVOKED') {
        setDocumentData(data);
        setStatus('revoked');
        return;
      }
      setDocumentData(data);
      setStatus('success');
    } catch (err) {
      console.error('Verification error:', err);
      setErrorMsg(err.message || 'Verification failed');
      setStatus('error');
    }
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
    setTypedSignature('');
    setIsSigEmpty(true);
    setSignatureImage(null);
  };

  const saveSignature = async () => {
    if (signatureMode === 'type') {
      if (typedSignature.trim()) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 400 * dpr;
        canvas.height = 100 * dpr;
        ctx.scale(dpr, dpr);
        ctx.font = 'italic 36px "Cedarville Cursive", serif';
        await document.fonts.load('italic 36px "Cedarville Cursive"');
        ctx.fillStyle = 'black';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedSignature, 10, 50);
        setSignatureImage(canvas.toDataURL("image/png"));
        setIsSigEmpty(false);
      }
      return;
    }
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      setSignatureImage(sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"));
      setIsSigEmpty(false);
    }
  };

  const submitSignature = async () => {
    if (isSigning) return;
    if (!signatureImage) return;
    setIsSigning(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/vault-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trace_id: traceId,
          signatureImage: signatureImage
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to execute document');
      }

      setStatus('executed');
    } catch (err) {
      console.error('Execution error:', err);
      setErrorMsg(err.message || 'Failed to execute document');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto mt-10">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl w-full text-zinc-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-axim-teal rounded-full opacity-10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8">
            <SafeIcon icon={FiShield} size={48} className="text-axim-teal mb-4" />
            <h1 className="text-3xl font-bold mb-2">
              {isSignMode ? 'Counterparty Execution Portal' : 'Public Verification Portal'}
            </h1>
            <p className="text-zinc-400 text-center">
              {isSignMode
                ? 'Review and sign the Non-Disclosure Agreement.'
                : 'Verify the authenticity of an AXiM-generated NDA. Enter the Secure Trace ID found in the footer of the document.'}
            </p>
          </div>

          {!isSignMode && (
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
          )}

          {(status === 'error' && errorMsg) && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6">
              <SafeIcon icon={FiAlertCircle} size={24} />
              <p>{errorMsg}</p>
            </div>
          )}


          {status === 'revoked' && documentData && (
            <div className="flex flex-col gap-6 animate-fade-in relative">
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="transform -rotate-12 border-4 border-red-500/50 text-red-500/50 font-black text-6xl md:text-8xl p-4 rounded-xl shadow-lg uppercase tracking-widest backdrop-blur-sm bg-black/20 mix-blend-overlay">
                  REVOKED
                </div>
              </div>
              <div className="bg-zinc-900 border border-red-500/30 p-6 rounded-xl opacity-80 filter grayscale">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <SafeIcon icon={FiAlertCircle} size={28} className="text-red-500" />
                  <h3 className="text-xl font-bold text-red-500">Revoked Document</h3>
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
                    <p className="font-mono text-sm break-all text-zinc-400">{documentData.hash || 'Unknown'}</p>
                  </div>
                </div>
              </div>
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

              {isSignMode && (
                <div className="bg-zinc-900 border border-white/20 p-8 rounded-2xl mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <SafeIcon icon={FiPenTool} size={20} /> Counterparty Signature
                    </h3>
                    <div className="flex bg-zinc-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setSignatureMode('draw')}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${signatureMode === 'draw' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                      >
                        Draw
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignatureMode('type')}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${signatureMode === 'type' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                      >
                        Type
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-400 mb-4">
                    Please sign below to execute this document.
                  </p>
                  {signatureMode === 'draw' ? (
                  <div
                    className="border border-zinc-400 bg-zinc-50 rounded-lg p-2 max-w-md w-full signature-canvas-wrapper"
                    style={{ touchAction: "none" }}
                  >
                    <SignatureCanvas
                      ref={sigCanvas}
                      penColor="black"
                      canvasProps={{
                        className: "w-full h-32 cursor-crosshair",
                        width: 500,
                        height: 200,
                        style: { width: '100%', height: '100%', touchAction: 'none' }
                      }}
                      onEnd={() => {
                        setIsSigEmpty(false);
                        saveSignature();
                      }}
                    />
                  </div>
                  ) : (
                    <div className="max-w-md w-full">
                      <input
                        type="text"
                        placeholder="Type your full name"
                        value={typedSignature}
                        onChange={(e) => {
                          setTypedSignature(e.target.value);
                          if (e.target.value.trim() === '') {
                            setIsSigEmpty(true);
                            setSignatureImage(null);
                          } else {
                            setIsSigEmpty(false);
                          }
                        }}
                        onBlur={saveSignature}
                        className="w-full p-4 bg-zinc-50 border border-zinc-400 rounded-lg text-black font-serif italic text-2xl outline-none focus:ring-2 focus:ring-axim-teal"
                        style={{ fontFamily: '"Cedarville Cursive", serif' }}
                      />
                    </div>
                  )}
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={clearSignature}
                      className="px-4 py-2 bg-zinc-800 text-zinc-300 border border-zinc-600 hover:bg-zinc-700 hover:text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2 shadow-sm"
                    >
                      <SafeIcon icon={FiRefreshCw} size={14} /> Clear Signature
                    </button>
                  </div>
                  <button
                    onClick={submitSignature}
                    disabled={isSigEmpty || isSigning}
                    className={`mt-6 w-full bg-axim-teal text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-axim-teal/90 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSigning ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
                    ) : (
                      <>
                        <SafeIcon icon={FiCheck} size={20} /> Submit Signature
                      </>
                    )}
                  </button>
                </div>
              )}

              {!isSignMode && (
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
              )}
            </div>
          )}

          {status === 'executed' && (
            <div className="bg-black/80 border border-axim-teal/50 p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(0,229,255,0.25)] animate-fade-in relative overflow-hidden mt-8">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-axim-teal rounded-full opacity-10 blur-3xl pointer-events-none"></div>
                <SafeIcon icon={FiCheckCircle} size={64} className="text-green-400 mb-4 relative z-10" />
                <h4 className="text-3xl font-bold text-white mb-2 relative z-10">Document Executed</h4>
                <p className="text-zinc-300 mb-6 max-w-md relative z-10">
                  Your signature has been successfully appended to the agreement. A copy of the fully executed document will be available shortly.
                </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
