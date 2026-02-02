import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { INDUSTRY_OPTIONS, JURISDICTIONS } from '../data/ndaData';

const { FiBriefcase, FiFileText, FiCheck, FiLock } = FiIcons;

const NDAGeneratorForm = ({ formData, setFormData, onPurchase }) => {

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const isFormValid = formData.disclosing.trim() !== '' && formData.receiving.trim() !== '';

  return (
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
            onClick={onPurchase}
            disabled={!isFormValid}
            className={`w-full bg-white text-blue-800 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition transform active:scale-95 shadow-lg ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <SafeIcon icon={FiLock} size={20} />
            {isFormValid ? 'Purchase & Generate Document' : 'Enter Party Names to Continue'}
          </button>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-700 rounded-full opacity-40 blur-3xl"></div>
      </section>
    </div>
  );
};

export default NDAGeneratorForm;
