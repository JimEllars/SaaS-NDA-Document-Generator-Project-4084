import { FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useToast } from '../context/ToastContext';

const ToastItem = ({ toast, onClose }) => {
  const { type, message } = toast;

  let icon = FiInfo;
  let color = 'bg-blue-50 text-blue-800 border-blue-200';

  if (type === 'success') {
    icon = FiCheckCircle;
    color = 'bg-green-50 text-green-800 border-green-200';
  } else if (type === 'error') {
    icon = FiAlertTriangle;
    color = 'bg-red-50 text-red-800 border-red-200';
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
        className="text-slate-400 hover:text-slate-600 transition shrink-0"
      >
        <SafeIcon icon={FiX} size={16} />
      </button>
    </div>
  );
};

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
