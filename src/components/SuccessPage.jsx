import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifySession, deliverOrchestratedDocument } from '../api/paymentService';

import { FiCheckCircle, FiMail, FiSend, FiFileText } from 'react-icons/fi';

import SafeIcon from '../common/SafeIcon';
import { useToast } from '../context/ToastContext';
import useNDAForm from '../hooks/useNDAForm';
import { decrypt } from '../utils/crypto';

export default function SuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');
    const { addToast } = useToast();
    const { resetForm } = useNDAForm();

    const [status, setStatus] = useState('verifying');
    const [documentData, setDocumentData] = useState(null);
    const [documentBlobUrl, setDocumentBlobUrl] = useState(null);
    const [email, setEmail] = useState('');
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    // Use a ref to hold the formData so it's accessible outside the effect
    const savedFormDataRef = useRef(null);


    const handleDownloadDocx = useCallback(async () => {
        try {
            if (!documentData) {
                 addToast('No document data available for DOCX', 'error');
                 return;
            }

            const { Document, Packer, Paragraph, TextRun } = await import('docx');

            const paragraphs = [
                new Paragraph({ children: [new TextRun({ text: `${documentData.title}`, bold: true, size: 28 })] }),
                new Paragraph({ children: [new TextRun({ text: `Effective Date: ${documentData.effectiveDate}`, size: 24 })] }),
                new Paragraph({ text: '' }),
            ];

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: paragraphs
                }]
            });

            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'NDA.docx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            addToast('DOCX downloaded successfully', 'success');

        } catch (err) {
            console.error('DOCX Error:', err);
            addToast('Failed to generate DOCX', 'error');
        }
    }, [documentData, addToast]);

    const handleDownload = useCallback(() => {
        if (documentBlobUrl) {
            const a = document.createElement('a');
            a.href = documentBlobUrl;
            a.download = 'NDA.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            addToast('Document is not ready yet.', 'error');
        }
    }, [documentBlobUrl, addToast]);

    const handleStartOver = useCallback(() => {
        resetForm();
        localStorage.clear();
        localStorage.removeItem('axim_delivery_email');
        setEmail('');
        navigate('/');
    }, [navigate, resetForm]);

    const handleSendEmail = useCallback(async () => {
        if (!email || !email.includes('@')) {
            addToast('Please enter a valid email address.', 'error');
            return;
        }

        if (!savedFormDataRef.current) {
            addToast('Document data is missing. Please try downloading instead.', 'error');
            return;
        }

        try {
            setIsSendingEmail(true);
                                                const response = await deliverOrchestratedDocument({ templateId: 'nda_v1', email, formData: documentData, session_id: sessionId });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    addToast('Your secure session has expired. Please download your document directly using the button above.', 'error');
                    return;
                }
                throw new Error('Failed to send email');
            }

            addToast('Email sent successfully!', 'success');
            setEmail('');
        } catch (err) {
            console.error('Email error:', err);
            addToast('Failed to send email. Please try downloading instead.', 'error');
        } finally {
            setIsSendingEmail(false);
        }
    }, [email, addToast]);

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            return;
        }

        let isMounted = true;

        const verify = async () => {
            try {
                // In a real app, verifySession would securely confirm the payment on the backend
                await verifySession(sessionId);

                if (!isMounted) return;

                // Rehydrate form data from localStorage
                const savedData = localStorage.getItem('axim_nda_draft');
                let formData = null;
                if (savedData) {
                    try {
                        const decrypted = decrypt(savedData);
                        const parsed = JSON.parse(decrypted);
                        formData = parsed.formData ? parsed.formData : parsed;
                    } catch (err) {
                        console.error('Failed to parse form data from localStorage', err);
                    }
                }

                if (formData) {
                    savedFormDataRef.current = formData;
                    // Generate document using Edge API
                    setStatus('generating');

                    try {
                        // Replace local generation with Edge API call
                        const response = await fetch('/api/generate-nda', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ ...formData, sessionId })
                        });

                        if (!response.ok) throw new Error('Edge generation failed');

                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        setDocumentBlobUrl(url);
                        setDocumentData(formData);
                        setStatus('success');

                        // Background telemetry
                        fetch('/api/v1/telemetry/ingest', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                event: 'document_generated',
                                type: 'nda',
                                session_id: sessionId
                            })
                        }).catch(e => console.error('Telemetry error:', e));

                        // DataLayer sync
                        if (window.dataLayer) {
                            window.dataLayer.push({ event: 'purchase', document_type: 'nda' });
                        }
                    } catch (genErr) {
                        console.error('Generation failed:', genErr);
                        setStatus('error');
                    }
                } else {
                    setStatus('error');
                    console.error('No form data found to generate the document');
                }
            } catch (err) {
                if (!isMounted) return;
                setStatus('error');
                console.error('Session verification failed:', err);
            }
        };

        verify();

        return () => {
            isMounted = false;
        };
    }, [sessionId]);

    if (status === 'verifying') {
        return (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-axim-teal border-t-transparent mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold text-zinc-100 mb-2">Verifying Payment</h3>
                    <p className="text-zinc-400">Please wait while we secure your document...</p>
                </div>
            </div>
        );
    }

    if (status === 'generating') {
        return (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-axim-teal border-t-transparent mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold text-zinc-100 mb-2">Generating PDF</h3>
                    <p className="text-zinc-400">Please wait while your document is assembled at the Edge...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-400 text-3xl">!</span>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-100 mb-2">Verification Failed</h3>
                    <p className="text-zinc-400 mb-6">We could not verify your purchase or find your draft. Please try again or contact support.</p>
                    <button
                        onClick={handleStartOver}
                        className="bg-axim-teal text-black font-bold py-3 px-6 rounded-xl hover:bg-teal-400 transition"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center max-w-2xl mx-auto shadow-2xl animate-in zoom-in duration-300 no-print mt-12">
                <div className="w-20 h-20 bg-axim-teal/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-axim-teal/30">
                    <SafeIcon icon={FiCheckCircle} className="text-axim-teal drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-zinc-100 mb-4">Payment Successful!</h2>
                <p className="text-zinc-300 mb-8 text-lg">Thank you for your purchase. Your secure Non-Disclosure Agreement is ready.</p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <button
                        onClick={handleDownload}
                        className="bg-axim-teal text-black font-bold py-3 px-8 rounded-xl hover:bg-teal-400 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center justify-center"
                    >
                        Download PDF
                    </button>
                    <button
                        onClick={handleDownloadDocx}
                        className="bg-zinc-800 text-zinc-100 font-bold py-3 px-8 rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                    >
                        <SafeIcon icon={FiFileText} />
                        Download Editable (.docx)
                    </button>
                    <button
                        onClick={handleStartOver}
                        className="bg-transparent border border-white/20 text-zinc-200 font-bold py-3 px-8 rounded-xl hover:bg-white/10 transition-all"
                    >
                        Create New NDA
                    </button>
                </div>

                <div className="bg-black/30 border border-white/10 rounded-xl p-6 text-left max-w-md mx-auto">
                    <h3 className="text-lg font-bold text-zinc-100 mb-2 flex items-center gap-2">
                        <SafeIcon icon={FiMail} className="text-axim-teal" />
                        Email My Document
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4">
                        Send a copy of your generated NDA directly to your inbox.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 bg-black/50 border border-white/20 text-zinc-100 rounded-lg px-4 py-2 focus:outline-none focus:border-axim-teal focus:ring-1 focus:ring-axim-teal"
                        />
                        <button
                            onClick={handleSendEmail}
                            disabled={isSendingEmail || !email || !documentBlobUrl}
                            className={`bg-zinc-800 text-zinc-100 font-medium py-2 px-6 rounded-lg hover:bg-zinc-700 transition flex items-center justify-center gap-2 ${
                                (isSendingEmail || !email || !documentBlobUrl) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <SafeIcon icon={FiSend} size={14} />
                            {isSendingEmail ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}