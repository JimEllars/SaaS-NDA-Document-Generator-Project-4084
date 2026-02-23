import React, { useState, useMemo } from 'react';
import './App.css';
import Header from './components/Header';
import NDAGeneratorForm from './components/NDAGeneratorForm';
import PaymentModal from './components/PaymentModal';
import DocumentPreview from './components/DocumentPreview';
import ConfirmModal from './components/ConfirmModal';
import ErrorBoundary from './components/ErrorBoundary';
import PreviewModal from './components/PreviewModal';
import { generateDocument } from './utils/documentGenerator';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/Toast';
import useNDAForm from './hooks/useNDAForm';

function AppContent() {
  const { formData, setFormData, resetForm } = useNDAForm();

  const [showCheckout, setShowCheckout] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);

  const handleDownload = () => {
    window.print();
  };

  const handleStartOverRequest = () => {
      setShowStartOverConfirm(true);
  };

  const handleStartOverConfirm = () => {
      resetForm();
      setIsEditing(false);
      setShowStartOverConfirm(false);
  };

  const handlePaymentComplete = () => {
      setShowCheckout(false);
      setFormData(prev => ({ ...prev, isPaid: true }));
  }

  const handleUpdate = () => {
    setIsEditing(false);
  };

  // Memoize document generation to prevent unnecessary re-calculation
  // It is only needed when isPaid is true and isEditing is false
  const documentData = useMemo(() => {
    if (formData.isPaid && !isEditing) {
      return generateDocument(formData);
    }
    return null;
  }, [formData, isEditing]);

  // Generate preview data regardless of payment status
  const previewData = useMemo(() => {
    if (showPreview) {
       // Force isPaid to true for preview generation purposes
       return generateDocument({ ...formData, isPaid: true });
    }
    return null;
  }, [formData, showPreview]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center p-4 md:p-8 font-sans text-slate-900">
      <Header
        isPaid={formData.isPaid}
        onClear={handleStartOverRequest}
        onStartOver={handleStartOverRequest}
      />

      <div className="max-w-3xl w-full no-print">
        {!formData.isPaid || isEditing ? (
          <NDAGeneratorForm
            formData={formData}
            setFormData={setFormData}
            onPurchase={() => setShowCheckout(true)}
            onPreview={() => setShowPreview(true)}
            isEditing={isEditing}
            onUpdate={handleUpdate}
          />
        ) : (
          <DocumentPreview
            formData={formData}
            documentData={documentData}
            onDownload={handleDownload}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </div>

      {showCheckout && (
        <PaymentModal
          onClose={() => setShowCheckout(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        formData={formData}
        documentData={previewData}
        onPurchase={() => setShowCheckout(true)}
      />

      <ConfirmModal
        isOpen={showStartOverConfirm}
        title="Start Over?"
        message="This will clear your current progress and reset the form. This action cannot be undone."
        confirmText="Yes, Start Over"
        isDestructive={true}
        onConfirm={handleStartOverConfirm}
        onCancel={() => setShowStartOverConfirm(false)}
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
