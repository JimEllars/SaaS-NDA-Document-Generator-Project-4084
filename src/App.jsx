import React, { useState, useRef, useMemo } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import './App.css';
import '@questlabs/react-sdk/dist/style.css';

const { FiFileText, FiShield, FiDownload, FiLock, FiBriefcase, FiCreditCard, FiCheckCircle, FiTrash2, FiGlobe, FiX, FiCheck, FiArrowLeft, FiPrinter } = FiIcons;

// --- LEGAL CLAUSE LIBRARY ---
const CLAUSES = {
  general: {
    intro: (disclosing, receiving, type) => {
      const isMutual = type === 'mutual';
      return `This ${isMutual ? 'Mutual' : 'Unilateral'} Non-Disclosure Agreement (the "Agreement") is entered into as of ${new Date().toLocaleDateString()} (the "Effective Date") by and between ${disclosing || "[Disclosing Party]"} ${isMutual ? '' : '("Disclosing Party")'} and ${receiving || "[Receiving Party]"} ${isMutual ? '' : '("Receiving Party")'}${isMutual ? ', collectively referred to as the "Parties" and individually as a "Party"' : ''}.`;
    },
    definition: "Confidential Information shall include all information, whether oral, written, or electronic, relating to the business of the Disclosing Party, including but not limited to financial data, customer lists, trade secrets, strategic plans, technical specifications, and proprietary methodologies.",
    exclusions: "Confidential Information does not include information that is (a) publicly known through no breach of this Agreement, (b) already in Receiving Party's lawful possession prior to disclosure, (c) independently developed without use of the Disclosing Party's Confidential Information, or (d) received from a third party without breach of any confidentiality obligation.",
    term: (years) => `The obligations of confidentiality shall survive for a period of ${years || 3} years from the date of disclosure of the respective Confidential Information, or until such information becomes publicly available through no fault of the Receiving Party.`,
    return: "Upon termination of discussions or upon written request, the Receiving Party shall promptly return or destroy all documents, materials, and other tangible manifestations of Confidential Information and all copies thereof."
  },
  tech: {
    label: "Technology & Software",
    clauses: [
      {
        title: "Intellectual Property & Source Code Protection",
        text: "Confidential Information specifically includes algorithms, source code, data structures, architectural designs, technical specifications, development methodologies, and any software or technology solutions. The Receiving Party shall not reverse engineer, decompile, disassemble, or attempt to derive the source code of any software or technology provided."
      },
      {
        title: "Non-Solicitation of Technical Personnel",
        text: "For a period of 12 months following the termination of this Agreement, the Receiving Party shall not, directly or indirectly, solicit for employment any technical staff, engineers, developers, or key personnel of the Disclosing Party who had access to or knowledge of the Confidential Information."
      },
      {
        title: "Data Security Requirements",
        text: "The Receiving Party agrees to implement and maintain reasonable security measures to protect any technical data or software code disclosed, including but not limited to access controls, encryption where applicable, and secure storage protocols consistent with industry standards."
      }
    ]
  },
  creative: {
    label: "Creative & Design",
    clauses: [
      {
        title: "Creative Work Protection",
        text: "Any creative concepts, visual assets, design drafts, artistic works, branding materials, or creative methodologies shared remain the exclusive property of the Disclosing Party. No license, transfer, or assignment of intellectual property rights or moral rights is implied by this disclosure."
      },
      {
        title: "Portfolio and Publication Restrictions",
        text: "The Receiving Party is strictly prohibited from displaying, publishing, or showcasing any project materials, creative works, or concepts in any public portfolio, social media, case studies, marketing materials, or professional presentations without express prior written consent from the Disclosing Party."
      },
      {
        title: "Attribution and Credit",
        text: "In the event that the Disclosing Party grants permission for limited use or display of creative materials, proper attribution and credit must be given to the Disclosing Party as the original creator and owner of such materials."
      }
    ]
  },
  realestate: {
    label: "Real Estate & Development",
    clauses: [
      {
        title: "Non-Circumvention Clause",
        text: "The Receiving Party agrees not to circumvent the Disclosing Party by directly contacting property owners, developers, lenders, investors, or other parties associated with the disclosed real estate opportunities, projects, or transactions to pursue any business relationship or transaction independently."
      },
      {
        title: "Property Information Protection",
        text: "Confidential Information includes property valuations, financial analyses, development plans, zoning information, environmental reports, tenant information, and any proprietary investment strategies or market analyses related to real estate assets."
      },
      {
        title: "Geographic Restrictions",
        text: "The Receiving Party acknowledges that the geographic location and specific details of properties discussed are highly sensitive and agrees not to pursue similar opportunities within a 5-mile radius of any disclosed property for a period of 6 months without the Disclosing Party's written consent."
      }
    ]
  },
  healthcare: {
    label: "Healthcare & Life Sciences",
    clauses: [
      {
        title: "HIPAA and Medical Data Protection",
        text: "The Receiving Party acknowledges that any healthcare-related information may be subject to HIPAA regulations and agrees to maintain the highest standards of privacy and security for any medical data, patient information, or healthcare processes disclosed."
      },
      {
        title: "Regulatory Compliance",
        text: "All parties acknowledge that healthcare information may be subject to FDA, state medical board, and other regulatory requirements. The Receiving Party agrees to comply with all applicable healthcare regulations and standards."
      }
    ]
  },
  financial: {
    label: "Financial Services",
    clauses: [
      {
        title: "Financial Data Protection",
        text: "Confidential Information includes financial models, investment strategies, client portfolios, trading algorithms, risk assessments, and any proprietary financial methodologies. The Receiving Party agrees to treat such information with the highest level of confidentiality consistent with financial industry standards."
      },
      {
        title: "Regulatory Compliance",
        text: "The Receiving Party acknowledges that financial information may be subject to SEC, FINRA, and other financial regulatory requirements and agrees to comply with all applicable financial services regulations."
      }
    ]
  },
  robust: {
    clauses: [
      {
        title: "Liquidated Damages and Remedies",
        text: "The Parties agree that any breach of this Agreement would cause irreparable harm for which monetary damages would be inadequate. In the event of a proven breach, the Receiving Party agrees to pay liquidated damages of $25,000 as a reasonable estimate of the harm caused, plus any actual damages exceeding this amount, attorney fees, and costs of enforcement."
      },
      {
        title: "Broad Interpretation of Confidential Information",
        text: "Confidential Information shall be interpreted in the broadest possible sense allowed by law, covering all communications, observations, and information gained through any interaction with the Disclosing Party, regardless of whether such information was explicitly marked 'Confidential' at the time of disclosure."
      },
      {
        title: "Injunctive Relief",
        text: "The Receiving Party acknowledges that any breach or threatened breach of this Agreement may cause immediate and irreparable injury to the Disclosing Party, and that monetary damages may be inadequate to compensate for such breach. Therefore, the Disclosing Party shall be entitled to seek injunctive relief and other equitable remedies without the necessity of proving actual damages."
      },
      {
        title: "Third Party Restrictions",
        text: "The Receiving Party agrees not to disclose any Confidential Information to third parties, including employees, consultants, advisors, or agents, without the prior written consent of the Disclosing Party. Any permitted disclosures must be made only to individuals who have signed confidentiality agreements with terms no less restrictive than those contained herein."
      }
    ]
  }
};

const JURISDICTIONS = [
  "Delaware", "California", "New York", "Texas", "Florida", "Illinois", 
  "Washington", "Nevada", "Colorado", "Georgia", "North Carolina", 
  "Virginia", "Massachusetts", "Pennsylvania", "Other"
];

const INDUSTRY_OPTIONS = [
  { value: 'general', label: 'General Business' },
  { value: 'tech', label: 'Technology & Software' },
  { value: 'creative', label: 'Creative & Design' },
  { value: 'realestate', label: 'Real Estate' },
  { value: 'healthcare', label: 'Healthcare & Life Sciences' },
  { value: 'financial', label: 'Financial Services' }
];

function App() {
  const [formData, setFormData] = useState(() => ({
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
  }));

  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    email: ''
  });

  const documentRef = useRef();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

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

  const validatePaymentForm = () => {
    return paymentData.cardNumber.length >= 16 && 
           paymentData.expiryDate.length >= 5 && 
           paymentData.cvc.length >= 3 && 
           paymentData.email.includes('@');
  };

  const simulatePayment = async () => {
    if (!validatePaymentForm()) {
      alert('Please fill in all payment details correctly.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setShowCheckout(false);
    setFormData(prev => ({ ...prev, isPaid: true }));
    
    // Simulate sending receipt email
    console.log('Payment successful! Receipt sent to:', paymentData.email);
  };

  const handleDownload = () => {
    // Trigger print dialog for PDF generation
    window.print();
  };

  const handleStartOver = () => {
    if (confirm("Are you sure? This will clear your current document.")) {
      clearForm();
    }
  };

  // Memoize document generation to prevent unnecessary re-calculation
  const document = useMemo(() => {
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
      {/* Header */}
      <div className="max-w-3xl w-full flex justify-between items-center mb-8 no-print">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
            <SafeIcon icon={FiShield} className="text-blue-600" size={32} />
            AXiM NDA Generator
          </h1>
          <p className="text-slate-600 font-medium mt-1">Professional Legal Document Builder</p>
        </div>
        {!formData.isPaid && (
          <button 
            onClick={clearForm}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-red-500 transition px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <SafeIcon icon={FiTrash2} size={16} /> Reset
          </button>
        )}
        {formData.isPaid && (
          <button
            onClick={handleStartOver}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition px-3 py-2 rounded-lg hover:bg-blue-50"
          >
             Start Over
          </button>
        )}
      </div>

      <div className="max-w-3xl w-full no-print">
        
        {!formData.isPaid ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Instructions */}
            <div className="bg-white/50 border border-blue-100 rounded-xl p-4 text-sm text-slate-600">
              <p className="flex gap-2">
                <SafeIcon icon={FiBriefcase} className="text-blue-500 mt-0.5" size={16} />
                Please fill out the details below to generate your custom Non-Disclosure Agreement. Once completed, you can purchase and download the legally binding document in PDF format.
              </p>
            </div>

            {/* Configuration Panel */}
            <section className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <SafeIcon icon={FiFileText} size={20} className="text-blue-600" />
                Agreement Details
              </h2>
              
              <div className="space-y-5">
                {/* Agreement Type Toggle */}
                <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                  <button
                    onClick={() => setFormData(p => ({...p, type: 'unilateral'}))}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${
                      formData.type === 'unilateral'
                        ? 'bg-white shadow-sm text-blue-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Unilateral NDA
                  </button>
                  <button
                    onClick={() => setFormData(p => ({...p, type: 'mutual'}))}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${
                      formData.type === 'mutual'
                        ? 'bg-white shadow-sm text-blue-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Mutual NDA
                  </button>
                </div>

                {/* Party Information */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-600 mb-2 block">
                      Disclosing Party {formData.type === 'mutual' ? '(Party 1)' : ''}
                    </label>
                    <input
                      name="disclosing"
                      value={formData.disclosing}
                      onChange={handleInputChange}
                      placeholder="Company or Individual Name"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 mb-2 block">
                      Receiving Party {formData.type === 'mutual' ? '(Party 2)' : ''}
                    </label>
                    <input
                      name="receiving"
                      value={formData.receiving}
                      onChange={handleInputChange}
                      placeholder="Counterparty Name"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                </div>

                {/* Industry and Jurisdiction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-600 mb-2 block">Industry Sector</label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      {INDUSTRY_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 mb-2 block">Governing Law</label>
                    <select
                      name="jurisdiction"
                      value={formData.jurisdiction}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      {JURISDICTIONS.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Protection Level and Term */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-600 mb-2 block">Protection Level</label>
                    <select
                      name="strictness"
                      value={formData.strictness}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="standard">Standard Protection</option>
                      <option value="robust">Enhanced (with Penalties)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 mb-2 block">Confidentiality Term</label>
                    <select
                      name="term"
                      value={formData.term}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="1">1 Year</option>
                      <option value="2">2 Years</option>
                      <option value="3">3 Years</option>
                      <option value="5">5 Years</option>
                      <option value="10">10 Years</option>
                    </select>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                  <input
                    type="checkbox"
                    name="includeReturn"
                    checked={formData.includeReturn}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-slate-700">
                    Include document return clause
                  </label>
                </div>
              </div>
            </section>

            {/* Download/Purchase Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">Generate Professional PDF</h3>
                  <span className="bg-blue-500 text-xs font-bold px-3 py-1 rounded-full">$12.99</span>
                </div>
                <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                  Get a watermark-free, legally formatted document ready for digital signatures and immediate use.
                </p>

                <ul className="text-blue-100 text-sm mb-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <SafeIcon icon={FiCheck} size={16} />
                    Professional formatting
                  </li>
                  <li className="flex items-center gap-2">
                    <SafeIcon icon={FiCheck} size={16} />
                    Industry-specific clauses
                  </li>
                  <li className="flex items-center gap-2">
                    <SafeIcon icon={FiCheck} size={16} />
                    Instant download
                  </li>
                </ul>

                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-white text-blue-800 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition transform active:scale-95 shadow-lg"
                >
                  <SafeIcon icon={FiLock} size={20} />
                  Purchase & Generate Document
                </button>
              </div>
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-700 rounded-full opacity-40 blur-3xl"></div>
            </section>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
             {/* Success Message */}
             <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center shadow-sm">
                <div className="mx-auto bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <SafeIcon icon={FiCheckCircle} className="text-green-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-green-900 mb-2">Payment Successful!</h2>
                <p className="text-green-800">Your document is ready. You can now download or print your NDA.</p>

                <button
                  onClick={handleDownload}
                  className="mt-6 w-full max-w-sm mx-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg"
                >
                  <SafeIcon icon={FiPrinter} size={20} />
                  Print / Download PDF
                </button>
             </div>

             {/* Document Display (Read Only View) */}
             <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <SafeIcon icon={FiFileText} size={16} />
                    Document Preview
                  </span>
                  <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded">
                    PAID - FINAL VERSION
                  </span>
                </div>
                
                <div className="overflow-y-auto max-h-[800px]" id="document-render" ref={documentRef}>
                  <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-8 text-sm leading-relaxed text-slate-800 font-serif relative">

                    {/* Title */}
                    <div className="text-center border-b border-slate-200 pb-8">
                      <h1 className="text-3xl font-bold uppercase tracking-wide mb-4">
                        {document.title}
                      </h1>
                      <p className="text-slate-600 text-base">
                        Effective Date: {new Date(formData.effectiveDate).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Introduction */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                        RECITALS
                      </h2>
                      <p className="text-justify leading-relaxed">
                        {document.intro}
                      </p>
                      <p className="text-justify leading-relaxed">
                        NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein,
                        and for other good and valuable consideration, the receipt and sufficiency of which are
                        hereby acknowledged, the parties agree as follows:
                      </p>
                    </div>

                    {/* Document Sections */}
                    {document.sections.map((section, index) => (
                      <section key={index} className="space-y-4">
                        <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 uppercase tracking-wide">
                          {section.title}
                        </h3>
                        <div className="space-y-4">
                          {section.content.map((item, itemIndex) => (
                            <div key={itemIndex} className="space-y-2">
                              {typeof item === 'string' ? (
                                <p className="text-justify leading-relaxed">{item}</p>
                              ) : (
                                <div>
                                  <h4 className="font-semibold text-slate-800 mb-2">
                                    {itemIndex + 1}. {item.title}
                                  </h4>
                                  <p className="text-justify leading-relaxed pl-4 border-l-2 border-blue-100">
                                    {item.text}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}

                    {/* Signature Section */}
                    <div className="mt-16 pt-8 border-t-2 border-slate-200">
                      <h3 className="text-base font-bold text-slate-900 mb-8 uppercase tracking-wide">
                        EXECUTION
                      </h3>
                      <p className="text-justify leading-relaxed mb-12">
                        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="space-y-8">
                          <div className="border-b border-slate-800 pb-2">
                            <div className="h-8"></div>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 mb-1">
                              {formData.type === 'mutual' ? 'PARTY 1:' : 'DISCLOSING PARTY:'}
                            </p>
                            <p className="text-slate-700 font-medium">
                              {formData.disclosing || '[Party Name]'}
                            </p>
                            <div className="mt-4 space-y-1">
                              <p className="text-xs text-slate-500">Print Name: _________________________</p>
                              <p className="text-xs text-slate-500">Title: _______________________________</p>
                              <p className="text-xs text-slate-500">Date: _______________________________</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <div className="border-b border-slate-800 pb-2">
                            <div className="h-8"></div>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 mb-1">
                              {formData.type === 'mutual' ? 'PARTY 2:' : 'RECEIVING PARTY:'}
                            </p>
                            <p className="text-slate-700 font-medium">
                              {formData.receiving || '[Party Name]'}
                            </p>
                            <div className="mt-4 space-y-1">
                              <p className="text-xs text-slate-500">Print Name: _________________________</p>
                              <p className="text-xs text-slate-500">Title: _______________________________</p>
                              <p className="text-xs text-slate-500">Date: _______________________________</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}

      </div>

      {/* Payment Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white relative">
              <button 
                onClick={() => setShowCheckout(false)}
                className="absolute top-6 right-6 hover:rotate-90 transition opacity-70 hover:opacity-100 focus:outline-none"
              >
                <SafeIcon icon={FiX} size={24} />
              </button>
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <SafeIcon icon={FiCreditCard} size={24} />
                Complete Purchase
              </h3>
              <p className="text-blue-100 mt-2 opacity-90">Secure payment processing</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                <span className="font-medium text-slate-700">Professional NDA Document</span>
                <span className="font-bold text-blue-600 text-lg">$12.99</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Email Address</label>
                  <input 
                    name="email"
                    type="email"
                    value={paymentData.email}
                    onChange={handlePaymentInputChange}
                    placeholder="your@email.com"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition" 
                    disabled={isProcessing} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Card Number</label>
                  <div className="relative">
                    <SafeIcon icon={FiCreditCard} className="absolute left-4 top-4 text-slate-400" size={18} />
                    <input 
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handlePaymentInputChange}
                      placeholder="1234 5678 9012 3456" 
                      className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition" 
                      disabled={isProcessing} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Expiry</label>
                    <input 
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={handlePaymentInputChange}
                      placeholder="MM/YY" 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition" 
                      disabled={isProcessing} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">CVC</label>
                    <input 
                      name="cvc"
                      value={paymentData.cvc}
                      onChange={handlePaymentInputChange}
                      placeholder="123" 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition" 
                      disabled={isProcessing} 
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={simulatePayment}
                disabled={isProcessing || !validatePaymentForm()}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiCheckCircle} size={18} />
                    Complete Purchase - $12.99
                  </>
                )}
              </button>
              
              <div className="flex items-center gap-2 justify-center text-xs text-slate-500 font-medium">
                <SafeIcon icon={FiGlobe} size={12} />
                Secured by 256-bit SSL encryption
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;