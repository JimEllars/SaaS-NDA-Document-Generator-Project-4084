import { useState, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import NDAGeneratorForm from './components/NDAGeneratorForm';
import PaymentModal from './components/PaymentModal';
import DocumentPreview from './components/DocumentPreview';
import ConfirmModal from './components/ConfirmModal';
import ErrorBoundary from './components/ErrorBoundary';
import { verifyPaymentAndGetDocument, updateDocument } from './api/paymentService';
import { ToastProvider, useToast } from './context/ToastContext';
import ToastContainer from './components/Toast';
import useNDAForm from './hooks/useNDAForm';
import { FiCheckCircle } from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';

function AppContent() {
  const { formData, setFormData, resetForm } = useNDAForm();
  const { addToast } = useToast();

  const [showCheckout, setShowCheckout] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);

  // State for document retrieved from the backend
  const [purchasedDocument, setPurchasedDocument] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleDownload = useCallback(() => {
    window.print();
  }, []);

  const handleStartOverRequest = useCallback(() => {
    setShowStartOverConfirm(true);
  }, []);

  const handleStartOverConfirm = useCallback(() => {
    resetForm();
    setIsEditing(false);
    setPurchasedDocument(null);
    setShowStartOverConfirm(false);
  }, [resetForm]);

  const handleCancelStartOver = useCallback(() => {
    setShowStartOverConfirm(false);
  }, []);

  const handleCloseCheckout = useCallback(() => {
    setShowCheckout(false);
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handlePaymentComplete = useCallback(async (paymentMethodId) => {
    // This function will be refactored in Phase 2 to handle the React Router
    // success page redirect rather than local state setting.
    // For now, it stays as a stub.
    setShowCheckout(false);
  }, []);

  const handleUpdate = useCallback(async () => {
    setIsEditing(false);

    // Check if they've already purchased a document. If so, they are editing it.
    if (purchasedDocument) {
      setIsProcessingPayment(true);
      try {
        // Send the updated formData to our "backend" API to regenerate the document
        // In a real app, the backend would verify they have already paid for this session/document
        const response = await updateDocument(formData);
        if (response.success) {
          setPurchasedDocument(response.document);
          addToast('Document updated successfully!', 'success');
        }
      } catch (err) {
        console.error("Update error:", err);
        addToast("Failed to update the document.", "error");
      } finally {
        setIsProcessingPayment(false);
      }
    }
  }, [formData, purchasedDocument, addToast]);

  const handlePurchase = useCallback(() => {
    // In Phase 2, this will redirect to the Stripe Checkout Session
    // via our Cloudflare Worker proxy.
    addToast('Redirecting to Stripe Checkout...', 'info');
    console.log('Preparing to redirect to Stripe Checkout...');
    // We don't show checkout anymore as this is being replaced by a redirect
  }, [addToast]);

  // PREVENT_PREVIEW: Do not implement document preview to prevent theft.

  const isPaid = !!purchasedDocument;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Ambient teal blur effect behind the form */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-axim-teal rounded-full opacity-10 blur-[120px] pointer-events-none"></div>

      <Header
        isPaid={isPaid}
        onClear={handleStartOverRequest}
        onStartOver={handleStartOverRequest}
      />

      <div className="max-w-3xl w-full no-print relative z-10">
        {!isPaid || isEditing ? (
          <NDAGeneratorForm
            formData={formData}
            setFormData={setFormData}
            onPurchase={handlePurchase}
            isEditing={isEditing}
            onUpdate={handleUpdate}
          />
        ) : (
          <DocumentPreview
            formData={formData}
            documentData={purchasedDocument}
            onDownload={handleDownload}
            onEdit={handleEdit}
          />
        )}
      </div>

      {showCheckout && (
        <PaymentModal
          onClose={handleCloseCheckout}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {isProcessingPayment && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 no-print">
            <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Verifying Payment</h3>
              <p className="text-slate-600">Please wait securely generating your document...</p>
            </div>
          </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 no-print">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300 p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SafeIcon icon={FiCheckCircle} className="text-green-600" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
                <p className="text-slate-600 mb-6">Thank you for your purchase. Your document is now ready.</p>
                <div className="animate-pulse text-sm text-slate-500">Redirecting to document...</div>
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
