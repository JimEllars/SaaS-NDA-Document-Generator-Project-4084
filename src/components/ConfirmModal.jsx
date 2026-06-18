import React from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const ConfirmModal = React.memo(({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isDestructive = false }) => {

  React.useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-white/5 border border-white/10 rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (e.key === "Tab") { const focusableElements = e.currentTarget.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"); const firstElement = focusableElements[0]; const lastElement = focusableElements[focusableElements.length - 1]; if (e.shiftKey) { if (document.activeElement === firstElement) { lastElement.focus(); e.preventDefault(); } } else { if (document.activeElement === lastElement) { firstElement.focus(); e.preventDefault(); } } } }} tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="flex justify-between items-start mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-500/20 text-red-400' : 'bg-axim-teal/20 text-axim-teal'}`}>
                <SafeIcon icon={FiAlertCircle} size={20} />
            </div>
            <button onClick={onCancel} className="text-zinc-400 hover:text-zinc-200 transition">
                <SafeIcon icon={FiX} size={20} />
            </button>
        </div>

        <h3 id="confirm-modal-title" className="text-lg font-bold text-zinc-100 mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 bg-transparent border border-white/20 text-zinc-200 font-bold rounded-xl hover:bg-white/10 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 text-white font-semibold rounded-xl transition shadow-sm ${isDestructive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-axim-teal hover:bg-teal-400 text-black'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
});

export default ConfirmModal;
