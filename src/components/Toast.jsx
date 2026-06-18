import React from 'react';
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useToast } from '../context/ToastContext';

const ToastItem = React.memo(({ toast, onClose }) => {
  const { type, message } = toast;

  let icon = FiInfo;
  let color = 'bg-black/80 backdrop-blur-md text-zinc-300 border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]';

  if (type === 'success') {
    icon = FiCheckCircle;
    color = 'bg-black/80 backdrop-blur-md text-axim-teal border-axim-teal/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]';
  } else if (type === 'error') {
    icon = FiAlertTriangle;
    color = 'bg-black/80 backdrop-blur-md text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border ${color} w-80 animate-in slide-in-from-right-full duration-300`}>
      <div className="mt-0.5 shrink-0">
        <SafeIcon icon={icon} size={20} />
      </div>
      <div className="flex-1 text-sm font-medium leading-relaxed">
        {message}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-zinc-400 hover:text-zinc-200 transition shrink-0"
      >
        <SafeIcon icon={FiX} size={16} />
      </button>
    </div>
  );
});

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
