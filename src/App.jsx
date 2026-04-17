import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import NDAGeneratorForm from './components/NDAGeneratorForm';
import SuccessPage from './components/SuccessPage';
import ConfirmModal from './components/ConfirmModal';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider, useToast } from './context/ToastContext';
import ToastContainer from './components/Toast';
import useNDAForm from './hooks/useNDAForm';
import { processPayment } from './api/paymentService';

function AppContent() {
  const { formData, setFormData, resetForm } = useNDAForm();
  const { addToast } = useToast();

  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
              onPurchase={handlePurchase}
              isEditing={false}
              onUpdate={() => {}}
            />
          } />
          <Route path="/success" element={<SuccessPage />} />
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
