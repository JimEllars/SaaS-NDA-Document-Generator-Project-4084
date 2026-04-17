import React from 'react';
// Use named imports from react-icons to enable tree-shaking and reduce bundle size
import { FiBriefcase, FiFileText, FiCheck, FiLock, FiRefreshCw, FiCalendar, FiAlertCircle, FiUnlock } from 'react-icons/fi';
import { ConnectButton } from 'thirdweb/react';
import { useWeb3Bypass } from '../hooks/useWeb3Bypass';
import SafeIcon from '../common/SafeIcon';
import useFormValidation from '../hooks/useFormValidation';
import { INDUSTRY_OPTIONS, JURISDICTIONS } from '../data/ndaData';

const FIELD_BASE_CLASSES = "w-full p-4 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-axim-teal focus:border-axim-teal outline-none text-zinc-100 placeholder-zinc-500";
const INPUT_CLASSES = `${FIELD_BASE_CLASSES} transition`;
const SELECT_CLASSES = FIELD_BASE_CLASSES;
const LABEL_CLASSES = "text-sm font-bold text-zinc-300 mb-2";
const TOGGLE_BUTTON_BASE_CLASSES = "flex-1 py-3 text-sm font-bold rounded-lg transition";

const NDAGeneratorForm = React.memo(({ formData, setFormData, onPurchase, isEditing, onUpdate }) => {
  const { hasToken, isChecking, client } = useWeb3Bypass();

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Instructions */}
      <div className="bg-axim-teal/5 border border-axim-teal/20 rounded-xl p-4 text-sm text-zinc-300">
        <p className="flex gap-2">
          <SafeIcon icon={FiBriefcase} className="text-axim-teal mt-0.5" size={16} />
          Please fill out the details below to generate your custom Non-Disclosure Agreement. Once completed, you can purchase and download the legally binding document in PDF format.
        </p>
      </div>

      {/* Configuration Panel */}
      <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <SafeIcon icon={FiFileText} size={20} className="text-axim-teal" />
          Agreement Details
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
            {!isEditing && (
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

              {!isEditing && hasToken && !isChecking && (
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
    </div>
  );
});

export default NDAGeneratorForm;
