import React, { useRef } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCheckCircle, FiPrinter, FiFileText } = FiIcons;

const DocumentPreview = ({ formData, documentData, onDownload }) => {
  const documentRef = useRef();

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
       {/* Success Message */}
       <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center shadow-sm no-print">
          <div className="mx-auto bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <SafeIcon icon={FiCheckCircle} className="text-green-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-green-900 mb-2">Payment Successful!</h2>
          <p className="text-green-800">Your document is ready. You can now download or print your NDA.</p>

          <button
            onClick={onDownload}
            className="mt-6 w-full max-w-sm mx-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg"
          >
            <SafeIcon icon={FiPrinter} size={20} />
            Print / Download PDF
          </button>
       </div>

       {/* Document Display (Read Only View) */}
       <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center no-print">
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
                  {documentData.title}
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
                  {documentData.intro}
                </p>
                <p className="text-justify leading-relaxed">
                  NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein,
                  and for other good and valuable consideration, the receipt and sufficiency of which are
                  hereby acknowledged, the parties agree as follows:
                </p>
              </div>

              {/* Document Sections */}
              {documentData.sections.map((section, index) => (
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
  );
};

export default DocumentPreview;
