import { useState, useCallback, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import NDAGeneratorForm from './components/NDAGeneratorForm';
import SuccessPage from './components/SuccessPage';
import AdminDashboard from './components/AdminDashboard';
import ConfirmModal from './components/ConfirmModal';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider, useToast } from './context/ToastContext';
import ToastContainer from './components/Toast';
import useNDAForm from './hooks/useNDAForm';
import { processPayment } from './api/paymentService';
import SafeIcon from './common/SafeIcon';
import { FiLifeBuoy } from 'react-icons/fi';


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
  const [userSession, setUserSession] = useState({ health_index: 100, is_partner: true });

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
              }
          } catch (err) {
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
      const response = await processPayment('nda_document');

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


      {userSession.health_index < 40 && (
          <div className="bg-purple-900/50 border border-purple-500/30 text-purple-200 text-sm py-3 px-4 flex items-center justify-center gap-3 w-full shadow-[0_4px_20px_rgba(147,51,234,0.15)] relative z-20 backdrop-blur-md">
              <SafeIcon icon={FiLifeBuoy} className="text-purple-400" />
              Need expert help? Our technical team is available to assist with your document configuration.
          </div>
      )}

      <Header
        isPaid={false}
        onClear={handleStartOverRequest}
        onStartOver={handleStartOverRequest}
      />

      <div className="max-w-3xl w-full no-print relative z-10">
        <Routes>
          <Route path="/" element={
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
          } />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
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
