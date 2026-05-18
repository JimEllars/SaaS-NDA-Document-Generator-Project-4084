import React, { useState, useCallback, useEffect, useRef } from 'react';
import { hashFormData } from './utils/crypto';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import NDAGeneratorForm from './components/NDAGeneratorForm';
import MyRecentNDAs from './components/MyRecentNDAs';
import SuccessPage from './components/SuccessPage';
import AdminDashboard from './components/AdminDashboard';
import VerificationPortal from './components/VerificationPortal';
import ConfirmModal from './components/ConfirmModal';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider, useToast } from './context/ToastContext';
import ToastContainer from './components/Toast';
import useNDAForm from './hooks/useNDAForm';
import { processPayment } from './api/paymentService';
import SafeIcon from './common/SafeIcon';
import { FiLifeBuoy, FiShield, FiPenTool, FiCpu, FiChevronDown, FiChevronUp } from 'react-icons/fi';


function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left focus:outline-none"
      >
        <span className="font-bold text-zinc-200">{question}</span>
        <SafeIcon icon={isOpen ? FiChevronUp : FiChevronDown} className="text-axim-teal" />
      </button>
      {isOpen && <p className="mt-2 text-zinc-400 text-sm">{answer}</p>}
    </div>
  );
}

function LandingLayout({ children, userSession }) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto">
      {/* Left side: Value Proposition & FAQ */}
      <div className="w-full lg:w-1/2 flex flex-col gap-8">
        <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
          <h1 className="text-4xl font-bold text-white mb-4">
            Zero-Trust <span className="text-axim-teal">NDA Generator</span>
          </h1>
          <p className="text-xl text-zinc-300 mb-6">
            Generate a legally binding, dual-party NDA in 3 minutes for $4.00.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-axim-teal/20 p-3 rounded-xl border border-axim-teal/30 text-axim-teal">
                <SafeIcon icon={FiShield} size={24} />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100">Vault Storage</h3>
                <p className="text-sm text-zinc-400">Cryptographically secure, tamper-proof document storage and verification.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-axim-teal/20 p-3 rounded-xl border border-axim-teal/30 text-axim-teal">
                <SafeIcon icon={FiPenTool} size={24} />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100">E-Signatures</h3>
                <p className="text-sm text-zinc-400">Seamless dual-party digital execution flow integrated directly into the portal.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-axim-teal/20 p-3 rounded-xl border border-axim-teal/30 text-axim-teal">
                <SafeIcon icon={FiCpu} size={24} />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100">AI Clause Advisor</h3>
                <p className="text-sm text-zinc-400">Intelligent selection of strictness, jurisdiction, and industry-specific clauses.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">Frequently Asked Questions</h2>
          <FAQItem
            question="Is this legally binding?"
            answer="Yes. Our NDAs are drafted using standard legal clauses and the digital signatures comply with the ESIGN Act and UETA."
          />
          <FAQItem
            question="How does the counterparty sign?"
            answer="Once generated, the receiving party will be emailed a secure link to the AXiM Verification Portal where they can execute the document."
          />
          <FAQItem
            question="Can I revoke an agreement?"
            answer="Yes. If the counterparty has not yet signed the agreement, you can revoke it directly from your dashboard."
          />
        </div>
      </div>

      {/* Right side: Form Widget */}
      <div className="w-full lg:w-1/2">
        {children}
      </div>
    </div>
  );
}

function AppContent() {
    const { formData, setFormData, currentStep, setCurrentStep, resetForm, isResumed } = useNDAForm();
  const { addToast } = useToast();
  const toastRef = useRef(false);

  useEffect(() => {
      if (isResumed && !toastRef.current) {
          addToast('Welcome back! Your draft has been restored.', 'info');
          toastRef.current = true;
      }
  }, [isResumed, addToast]);

  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [userSession, setUserSession] = useState(null);

  // Dynamic SEO based on industry
  useEffect(() => {
      const industry = formData.industry !== 'general' ? formData.industry : 'Custom';
      const capitalizedIndustry = industry.charAt(0).toUpperCase() + industry.slice(1);
      const title = `${capitalizedIndustry} NDA Generator | AXiM Systems`;
      const description = `Generate legally binding, zero-trust ${capitalizedIndustry} Non-Disclosure Agreements instantly.`;

      document.title = title;

      const setMetaTag = (selector, attribute, value) => {
          let tag = document.querySelector(selector);
          if (tag) {
              tag.setAttribute(attribute, value);
          }
      };

      setMetaTag('meta[name="description"]', 'content', description);
      setMetaTag('meta[property="og:title"]', 'content', title);
      setMetaTag('meta[property="og:description"]', 'content', description);
      setMetaTag('meta[name="twitter:title"]', 'content', title);
      setMetaTag('meta[name="twitter:description"]', 'content', description);
  }, [formData.industry]);


  useEffect(() => {
      const checkPassport = async () => {
          try {
              const response = await fetch('/api/v1/auth/session', {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json'
                  }
              });

              if (response.ok) {
                  const data = await response.json();
                  setUserSession(data);
              } else {
                  setUserSession(null);
              }
          } catch (err) {
              setUserSession(null);
              console.error('Failed to fetch passport session:', err);
          }
      };
      checkPassport();
  }, []);


  const handleStartOverRequest = useCallback(() => {
    setShowStartOverConfirm(true);
  }, []);

  const handleStartOverConfirm = useCallback(() => {
    resetForm();
    setShowStartOverConfirm(false);
  }, [resetForm]);

  const handleCancelStartOver = useCallback(() => {
    setShowStartOverConfirm(false);
  }, []);


  const handlePartnerCheckout = useCallback(() => {
    addToast('Processing partner credit...', 'info');
    setTimeout(() => {
      window.location.href = '/success?session_id=AXM-PARTNER';
    }, 1000);
  }, [addToast]);

  const handlePurchase = useCallback(async () => {
    try {
      setIsProcessingPayment(true);
      addToast('Redirecting to Stripe Checkout...', 'info');
      const formHash = await hashFormData(formData);
      const response = await processPayment('nda_document', formHash, formData.email);

      if (response && response.url) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'Begin_Checkout' });
        window.location.href = response.url;
      } else {
        throw new Error('Failed to get checkout URL');
      }
    } catch (err) {
      console.error('Payment error:', err);
      addToast('Failed to initiate payment.', 'error');
      setIsProcessingPayment(false);
    }
  }, [addToast]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Ambient teal blur effect behind the form */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-axim-teal rounded-full opacity-10 blur-[120px] pointer-events-none"></div>


      {userSession && userSession.health_index < 40 && (
          <div className="bg-purple-900/50 border border-purple-500/30 text-purple-200 text-sm py-3 px-4 flex items-center justify-center gap-3 w-full shadow-[0_4px_20px_rgba(147,51,234,0.15)] relative z-20 backdrop-blur-md">
              <SafeIcon icon={FiLifeBuoy} className="text-purple-400" />
              Need expert help? Our technical team is available to assist with your document configuration.
          </div>
      )}

      {userSession && <MyRecentNDAs />}

      <Header
        isPaid={false}
        onClear={handleStartOverRequest}
        onStartOver={handleStartOverRequest}
      />

      <div className="w-full no-print relative z-10 flex-1">
        <Routes>
          <Route path="/" element={
            <LandingLayout userSession={userSession}>
              <NDAGeneratorForm
                formData={formData}
                setFormData={setFormData}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                onPurchase={handlePurchase}
                isEditing={false}
                onUpdate={() => {}}
                userSession={userSession}
                onPartnerCheckout={handlePartnerCheckout}
              />
            </LandingLayout>
          } />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/verify" element={<VerificationPortal />} />
        </Routes>
      </div>

      {isProcessingPayment && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 no-print">
            <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Preparing Checkout</h3>
              <p className="text-slate-600">Please wait securely redirecting to Stripe...</p>
            </div>
          </div>
      )}

      <ConfirmModal
        isOpen={showStartOverConfirm}
        title="Start Over?"
        message="This will clear your current progress and reset the form. This action cannot be undone."
        confirmText="Yes, Start Over"
        isDestructive={true}
        onConfirm={handleStartOverConfirm}
        onCancel={handleCancelStartOver}
      />
    </div>
  );
}

function App() {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <AppContent />
                <ToastContainer />
            </ToastProvider>
        </ErrorBoundary>
    );
}

export default App;
