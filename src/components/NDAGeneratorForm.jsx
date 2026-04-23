import SignatureCanvas from 'react-signature-canvas';
import React, { useRef, useState } from 'react';
// Use named imports from react-icons to enable tree-shaking and reduce bundle size
import { FiBriefcase, FiFileText, FiCheck, FiLock, FiRefreshCw, FiCalendar, FiAlertCircle, FiUnlock, FiChevronRight, FiChevronLeft, FiPenTool } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from 'thirdweb/react';
import { useWeb3Bypass } from '../hooks/useWeb3Bypass';
import SafeIcon from '../common/SafeIcon';
import UpsellCard from './UpsellCard';
import useFormValidation from '../hooks/useFormValidation';
export const JURISDICTIONS = [
  "Delaware", "California", "New York", "Texas", "Florida", "Illinois",
  "Washington", "Nevada", "Colorado", "Georgia", "North Carolina",
  "Virginia", "Massachusetts", "Pennsylvania", "Other"
];

export const INDUSTRY_OPTIONS = [
  { value: 'general', label: 'General Business' },
  { value: 'tech', label: 'Technology & Software' },
  { value: 'creative', label: 'Creative & Design' },
  { value: 'realestate', label: 'Real Estate' },
  { value: 'healthcare', label: 'Healthcare & Life Sciences' },
  { value: 'financial', label: 'Financial Services' }
];


const FIELD_BASE_CLASSES = "w-full p-4 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-axim-teal focus:border-axim-teal outline-none text-zinc-100 placeholder-zinc-500";
const INPUT_CLASSES = `${FIELD_BASE_CLASSES} transition`;
const SELECT_CLASSES = FIELD_BASE_CLASSES;
const LABEL_CLASSES = "text-sm font-bold text-zinc-300 mb-2";
const TOGGLE_BUTTON_BASE_CLASSES = "flex-1 py-3 text-sm font-bold rounded-lg transition";

const isWeb3Enabled = import.meta.env.VITE_ENABLE_WEB3 === 'true';

const NDAGeneratorForm = React.memo(({ formData, setFormData, currentStep = 1, setCurrentStep, onPurchase, isEditing, onUpdate, userSession, onPartnerCheckout }) => {
  const { hasToken, isChecking, client } = useWeb3Bypass();
  const trackingSessionId = React.useRef(`sess_${Math.random().toString(36).substring(2, 9)}`);

  const handleBypass = React.useCallback(() => {
    // Navigate using a dummy session ID to trigger successful state
    window.location.href = '/success?session_id=AXM-BYPASS';
  }, []);

  const handleInputChange = React.useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, [setFormData]);

  const { isValid: isFormValid, validationMessage } = useFormValidation(formData);
  const sigCanvas = useRef(null);
  const [isSigEmpty, setIsSigEmpty] = useState(true);

  const clearSignature = () => { if(sigCanvas.current) sigCanvas.current.clear(); setIsSigEmpty(true); setFormData(prev => ({ ...prev, signatureImage: null })); };
  const saveSignature = () => { if(sigCanvas.current && !sigCanvas.current.isEmpty()) { setFormData(prev => ({ ...prev, signatureImage: sigCanvas.current.getTrimmedCanvas().toDataURL('image/png') })); setIsSigEmpty(false); } };


  const nextStep = () => {
    fetch("/api/v1/telemetry/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: `nda_step_${currentStep}_completed`,
        sessionId: trackingSessionId.current,
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.error("Telemetry error:", err));
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderProgressBar = () => (
    <div className="flex justify-between items-center mb-8 relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full z-0"></div>
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-axim-teal rounded-full z-0 transition-all duration-300"
        style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
      ></div>
      {[1, 2, 3].map(step => (
        <div
          key={step}
          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep >= step ? 'bg-axim-teal text-black shadow-[0_0_10px_rgba(0,229,255,0.5)]' : 'bg-zinc-800 text-zinc-500 border border-white/10'}`}
        >
          {step}
        </div>
      ))}
    </div>
  );

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Instructions */}
      <div className="bg-axim-teal/5 border border-axim-teal/20 rounded-xl p-4 text-sm text-zinc-300">
        <p className="flex gap-2">
          <SafeIcon icon={FiBriefcase} className="text-axim-teal mt-0.5" size={16} />
          Please fill out the details below to generate your custom Non-Disclosure Agreement. Once completed, you can purchase and download the legally binding document in PDF format.
        </p>
      </div>

      {renderProgressBar()}

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <SafeIcon icon={FiFileText} size={20} className="text-axim-teal" />
                The Parties
              </h2>

              <div className="space-y-5">
                {/* Agreement Type Toggle */}
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex p-1 bg-black/50 rounded-xl border border-white/10" role="radiogroup" aria-label="Agreement Type">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={formData.type === 'unilateral'}
                      onClick={() => setFormData(p => ({...p, type: 'unilateral'}))}
                      className={`${TOGGLE_BUTTON_BASE_CLASSES} ${
                        formData.type === 'unilateral'
                          ? 'bg-axim-teal/20 shadow-sm text-axim-teal'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Unilateral NDA
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={formData.type === 'mutual'}
                      onClick={() => setFormData(p => ({...p, type: 'mutual'}))}
                      className={`${TOGGLE_BUTTON_BASE_CLASSES} ${
                        formData.type === 'mutual'
                          ? 'bg-axim-teal/20 shadow-sm text-axim-teal'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Mutual NDA
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 px-1">
                    {formData.type === 'unilateral'
                      ? 'One party (Disclosing) shares information with another (Receiving).'
                      : 'Both parties share confidential information with each other.'}
                  </p>
                </div>

                {/* Party Information */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="disclosing" className={`${LABEL_CLASSES} block`}>
                      Disclosing Party {formData.type === 'mutual' ? '(Party 1)' : ''}
                    </label>
                    <input
                      id="disclosing"
                      name="disclosing"
                      value={formData.disclosing}
                      onChange={handleInputChange}
                      placeholder="Company or Individual Name"
                      className={ INPUT_CLASSES }
                      required
                      maxLength="255"
                    />
                  </div>
                  <div>
                    <label htmlFor="receiving" className={`${LABEL_CLASSES} block`}>
                      Receiving Party {formData.type === 'mutual' ? '(Party 2)' : ''}
                    </label>
                    <input
                      id="receiving"
                      name="receiving"
                      value={formData.receiving}
                      onChange={handleInputChange}
                      placeholder="Counterparty Name"
                      className={ INPUT_CLASSES }
                      required
                      maxLength="255"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={nextStep}
                    disabled={!formData.disclosing || !formData.receiving}
                    className={`bg-axim-teal text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-axim-teal/90 transition transform active:scale-95 ${(!formData.disclosing || !formData.receiving) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Next Step <SafeIcon icon={FiChevronRight} size={18} />
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <SafeIcon icon={FiFileText} size={20} className="text-axim-teal" />
                The Scope
              </h2>

              <div className="space-y-5">
                <div>
                  <label htmlFor="effectiveDate" className={`${LABEL_CLASSES} flex items-center gap-2`}>
                    <SafeIcon icon={FiCalendar} size={14} />
                    Effective Date
                  </label>
                  <input
                    id="effectiveDate"
                    name="effectiveDate"
                    type="date"
                    value={formData.effectiveDate || ''}
                    onChange={handleInputChange}
                    min="2000-01-01"
                    max="2099-12-31"
                    className={ INPUT_CLASSES }
                    required
                  />
                </div>

                {/* Industry and Jurisdiction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="industry" className={`${LABEL_CLASSES} block`}>Industry Sector</label>
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className={SELECT_CLASSES}
                    >
                      {INDUSTRY_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="jurisdiction" className={`${LABEL_CLASSES} block`}>Governing Law</label>
                    <select
                      id="jurisdiction"
                      name="jurisdiction"
                      value={formData.jurisdiction}
                      onChange={handleInputChange}
                      className={SELECT_CLASSES}
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
                    <label htmlFor="strictness" className={`${LABEL_CLASSES} block`}>Protection Level</label>
                    <select
                      id="strictness"
                      name="strictness"
                      value={formData.strictness}
                      onChange={handleInputChange}
                      className={SELECT_CLASSES}
                    >
                      <option value="standard">Standard Protection</option>
                      <option value="robust">Enhanced (with Penalties)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="term" className={`${LABEL_CLASSES} block`}>Confidentiality Term</label>
                    <select
                      id="term"
                      name="term"
                      value={formData.term}
                      onChange={handleInputChange}
                      className={SELECT_CLASSES}
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
                <div className="flex items-center gap-3 p-4 bg-black/50 border border-white/10 rounded-xl">
                  <input
                    id="includeReturn"
                    type="checkbox"
                    name="includeReturn"
                    checked={formData.includeReturn}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-axim-teal border-zinc-600 rounded focus:ring-axim-teal bg-black"
                  />
                  <label htmlFor="includeReturn" className="text-sm font-medium text-zinc-300">
                    Include document return clause
                  </label>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={prevStep}
                    className="bg-transparent border border-white/20 text-zinc-200 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition"
                  >
                    <SafeIcon icon={FiChevronLeft} size={18} /> Back
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!formData.effectiveDate}
                    className={`bg-axim-teal text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-axim-teal/90 transition transform active:scale-95 ${(!formData.effectiveDate) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Review <SafeIcon icon={FiChevronRight} size={18} />
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Live Draft Preview Pane */}
            <section className="bg-white border border-zinc-200 rounded-lg p-8 shadow-[0_0_20px_rgba(0,0,0,0.5)] mb-6 text-black relative overflow-hidden"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='rgba(0,0,0,0.05)' font-family='sans-serif' font-weight='bold' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 100 100)'%3ESAMPLE DRAFT%3C/text%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}
            >
              <h2 className="text-2xl font-serif font-bold mb-6 text-center border-b pb-4 border-zinc-300">
                Non-Disclosure Agreement
              </h2>
              <div className="text-zinc-800 text-base leading-loose space-y-6 font-serif">
                <p>
                  This <strong>{formData.type === 'mutual' ? 'Mutual' : 'Unilateral'}</strong> agreement protects information shared between <strong>{formData.disclosing || '[Party A]'}</strong> and <strong>{formData.receiving || '[Party B]'}</strong>.
                </p>
                <p>
                  The agreement will become effective on <strong>{formData.effectiveDate || '[Date]'}</strong> and will remain in effect for a duration of <strong>{formData.term} {formData.term === '1' ? 'year' : 'years'}</strong>.
                </p>
                <p>
                  This agreement focuses on the <strong>{INDUSTRY_OPTIONS.find(o => o.value === formData.industry)?.label || formData.industry}</strong> sector and will be governed under the laws of <strong>{formData.jurisdiction}</strong>.
                </p>
                <p>
                  Protection level is set to <strong>{formData.strictness === 'robust' ? 'Enhanced (with Penalties)' : 'Standard'}</strong>.
                  {formData.includeReturn ? ' A document return clause is included.' : ''}
                </p>
              </div>
                {/* Signature Block */}
                <div className="mt-8 border-t border-zinc-300 pt-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><SafeIcon icon={FiPenTool} size={20} /> E-Signature</h3>
                  <p className="text-sm text-zinc-600 mb-4">Please sign below to certify this document.</p>
                  <div className="border border-zinc-400 bg-zinc-50 rounded-lg p-2 max-w-md">
                     <SignatureCanvas
                        ref={sigCanvas}
                        penColor="black"
                        canvasProps={{className: 'w-full h-32 cursor-crosshair'}}
                        onEnd={() => { setIsSigEmpty(false); saveSignature(); }}
                     />
                  </div>
                  <div className="flex gap-4 mt-4">
                     <button onClick={clearSignature} className="text-sm font-medium text-axim-teal underline">Clear Signature</button>
                  </div>
                </div>

            </section>

            {/* Download/Purchase Section */}
            <section className="bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                {!isEditing && (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">Generate Professional PDF</h3>
                      <span className="bg-axim-teal/20 text-axim-teal border border-axim-teal/30 text-xs font-bold px-3 py-1 rounded-full">$12.99</span>
                    </div>
                    <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
                      Get a watermark-free, legally formatted document ready for digital signatures and immediate use.
                    </p>

                    <ul className="text-zinc-300 text-sm mb-6 space-y-2">
                      <li className="flex items-center gap-2 text-axim-teal">
                        <SafeIcon icon={FiCheck} size={16} />
                        <span className="text-zinc-300">Professional formatting</span>
                      </li>
                      <li className="flex items-center gap-2 text-axim-teal">
                        <SafeIcon icon={FiCheck} size={16} />
                        <span className="text-zinc-300">Industry-specific clauses</span>
                      </li>
                      <li className="flex items-center gap-2 text-axim-teal">
                        <SafeIcon icon={FiCheck} size={16} />
                        <span className="text-zinc-300">Instant download</span>
                      </li>
                    </ul>
                  </>
                )}


                <div className="flex flex-col gap-4">
                  {formData.strictness === 'robust' && <UpsellCard />}

                  {!isEditing && isWeb3Enabled && (

                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-black/30 p-4 rounded-xl border border-white/5">
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-zinc-300">AXiM Node Holder?</p>
                        <p className="text-xs text-zinc-500">Connect wallet to bypass paywall.</p>
                      </div>
                      <ConnectButton client={client} />
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-4">
                    <button
                      onClick={prevStep}
                      className="bg-transparent border border-white/20 text-zinc-200 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition"
                    >
                      <SafeIcon icon={FiChevronLeft} size={18} /> Back
                    </button>
                    {userSession?.is_partner && !isEditing ? (
                      <button
                        onClick={onPartnerCheckout}
                        disabled={!isFormValid}
                        className={`flex-1 bg-amber-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition transform active:scale-95 shadow-lg ${!isFormValid ? 'opacity-50 cursor-not-allowed hover:shadow-none' : ''}`}
                      >
                        <SafeIcon icon={FiUnlock} size={20} />
                        Generate with Partner Credit
                      </button>
                    ) : (
                      <button
                        onClick={isEditing ? onUpdate : onPurchase}
                        disabled={!isFormValid}
                        className={`flex-1 bg-axim-teal text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-axim-teal/90 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition transform active:scale-95 shadow-lg ${!isFormValid ? 'opacity-50 cursor-not-allowed hover:shadow-none' : ''}`}
                      >
                        <SafeIcon icon={isEditing ? FiRefreshCw : FiLock} size={20} />
                        {isEditing
                          ? 'Update Document'
                          : (isFormValid ? 'Purchase & Generate' : 'Complete Form')
                        }
                      </button>
                    )}

                    {!isEditing && hasToken && !isChecking && isWeb3Enabled && (
                      <button
                        onClick={handleBypass}
                        disabled={!isFormValid}
                        className={`flex-1 bg-purple-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-500 hover:shadow-[0_0_15px_rgba(147,51,234,0.4)] transition transform active:scale-95 shadow-lg ${!isFormValid ? 'opacity-50 cursor-not-allowed hover:shadow-none' : ''}`}
                      >
                        <SafeIcon icon={FiUnlock} size={20} />
                        Bypass Paywall
                      </button>
                    )}
                  </div>
                </div>

                {!isFormValid && (
                  <p className="text-sm text-red-400 mt-4 font-medium flex items-center justify-center gap-2 animate-pulse">
                    <SafeIcon icon={FiAlertCircle} size={16} />
                    {validationMessage}
                  </p>
                )}
              </div>
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-axim-teal rounded-full opacity-10 blur-3xl pointer-events-none"></div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default NDAGeneratorForm;
