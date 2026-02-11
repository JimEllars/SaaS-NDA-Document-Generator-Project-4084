import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import NDAGeneratorForm from './components/NDAGeneratorForm';
import PaymentModal from './components/PaymentModal';
import DocumentPreview from './components/DocumentPreview';
import ConfirmModal from './components/ConfirmModal';
import ErrorBoundary from './components/ErrorBoundary';
import { generateDocument } from './utils/documentGenerator';
import useDebounce from './hooks/useDebounce';

function AppContent() {
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('ndaFormData');
      return saved ? JSON.parse(saved) : {
        disclosing: '',
        receiving: '',
        industry: 'general',
        strictness: 'standard',
        type: 'unilateral',
        jurisdiction: 'Delaware',
        term: '3',
        isPaid: false,
        includeReturn: true,
        effectiveDate: new Date().toISOString().split('T')[0]
      };
    } catch (e) {
      console.warn("Failed to load from localStorage", e);
      return {
        disclosing: '',
        receiving: '',
        industry: 'general',
        strictness: 'standard',
        type: 'unilateral',
        jurisdiction: 'Delaware',
        term: '3',
        isPaid: false,
        includeReturn: true,
        effectiveDate: new Date().toISOString().split('T')[0]
      };
    }
  });

  const debouncedFormData = useDebounce(formData, 500);

  useEffect(() => {
    try {
      localStorage.setItem('ndaFormData', JSON.stringify(debouncedFormData));
    } catch (e) {
      console.warn("Failed to save to localStorage", e);
    }
  }, [debouncedFormData]);

  const [showCheckout, setShowCheckout] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);

  const clearForm = () => {
    setFormData({
      disclosing: '',
      receiving: '',
      industry: 'general',
      strictness: 'standard',
      type: 'unilateral',
      jurisdiction: 'Delaware',
      term: '3',
      isPaid: false,
      includeReturn: true,
      effectiveDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleDownload = () => {
    window.print();
  };

  const handleStartOverRequest = () => {
      setShowStartOverConfirm(true);
  };

  const handleStartOverConfirm = () => {
      clearForm();
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
  const documentData = useMemo(() => generateDocument(formData), [formData]);

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
            <AppContent />
        </ErrorBoundary>
    );
}

export default App;
