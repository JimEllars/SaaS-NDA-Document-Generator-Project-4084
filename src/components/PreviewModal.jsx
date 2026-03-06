import React from 'react';
import { FiX, FiLock, FiPrinter } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import DocumentPreview from './DocumentPreview';

const PreviewModal = ({ isOpen, onClose, formData, documentData, onPurchase }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-white z-10">
            <h3 className="text-lg font-bold text-slate-800">Document Preview</h3>
            <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500 hover:text-slate-700"
            >
                <SafeIcon icon={FiX} size={24} />
            </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
             <DocumentPreview
                formData={formData}
                documentData={documentData}
                isPreview={true}
            />
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-white z-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 text-center md:text-left">
                This is a preview. Purchase to remove watermark and download.
            </p>
            <div className="flex gap-3 w-full md:w-auto">
                <button
                    onClick={onClose}
                    className="flex-1 md:flex-none px-4 py-3 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                    Close
                </button>
                <button
                    onClick={() => window.print()}
                    className="flex-1 md:flex-none px-4 py-3 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-2"
                >
                    <SafeIcon icon={FiPrinter} size={18} />
                    Print
                </button>
                <button
                    onClick={() => {
                        onClose();
                        onPurchase();
                    }}
                    className="flex-1 md:flex-none px-6 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                    <SafeIcon icon={FiLock} size={18} />
                    Purchase Now - $12.99
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PreviewModal;
