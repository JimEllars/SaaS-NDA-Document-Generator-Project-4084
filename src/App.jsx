import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import '@questlabs/react-sdk/dist/style.css';
import Header from './components/Header';
import NDAGeneratorForm from './components/NDAGeneratorForm';
import PaymentModal from './components/PaymentModal';
import DocumentPreview from './components/DocumentPreview';
import { CLAUSES } from './data/ndaData';

function App() {
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

  useEffect(() => {
    localStorage.setItem('ndaFormData', JSON.stringify(formData));
  }, [formData]);

  const [showCheckout, setShowCheckout] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleStartOver = () => {
    if (confirm("Are you sure? This will clear your current document.")) {
      clearForm();
      setIsEditing(false);
    }
  };

  const handlePaymentComplete = () => {
      setShowCheckout(false);
      setFormData(prev => ({ ...prev, isPaid: true }));
  }

  const handleUpdate = () => {
    setIsEditing(false);
  };

  // Memoize document generation to prevent unnecessary re-calculation
  const documentData = useMemo(() => {
    if (!formData.isPaid) return null;

    const industry = CLAUSES[formData.industry];
    const isRobust = formData.strictness === 'robust';
    
    return {
      title: `${formData.type === 'mutual' ? 'Mutual' : ''} Non-Disclosure Agreement`,
      intro: CLAUSES.general.intro(formData.disclosing, formData.receiving, formData.type),
      sections: [
        {
          title: "Article 1: Definition of Confidential Information",
          content: [
            CLAUSES.general.definition,
            ...(isRobust ? [CLAUSES.robust.clauses[1].text] : [])
          ]
        },
        ...(formData.industry !== 'general' ? [{
          title: `Article 2: ${industry.label} Specific Provisions`,
          content: industry.clauses.map(clause => ({ title: clause.title, text: clause.text }))
        }] : []),
        {
          title: "Article 3: Permitted Use and Exclusions",
          content: [
            CLAUSES.general.exclusions,
            CLAUSES.general.term(formData.term),
            ...(formData.includeReturn ? [CLAUSES.general.return] : [])
          ]
        },
        ...(isRobust ? [{
          title: "Article 4: Enforcement and Remedies",
          content: CLAUSES.robust.clauses.map(clause => ({ title: clause.title, text: clause.text }))
        }] : []),
        {
          title: "Article 5: Governing Law and Jurisdiction",
          content: [
            `This Agreement shall be governed by and construed in accordance with the laws of the State of ${formData.jurisdiction}, without regard to conflict of law principles. Any disputes arising under this Agreement shall be subject to the exclusive jurisdiction of the courts of ${formData.jurisdiction}.`
          ]
        }
      ]
    };
  }, [formData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center p-4 md:p-8 font-sans text-slate-900">
      <Header
        isPaid={formData.isPaid}
        onClear={clearForm}
        onStartOver={handleStartOver}
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
    </div>
  );
}

export default App;
