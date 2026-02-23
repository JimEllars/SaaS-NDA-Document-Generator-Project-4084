import React, { useState } from 'react';
// Using named imports to enable tree-shaking
import { FiX, FiCreditCard, FiCheckCircle, FiGlobe, FiLock } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useToast } from '../context/ToastContext';

const PaymentModal = ({ onClose, onPaymentComplete }) => {
  const [step, setStep] = useState('form'); // 'form', 'processing', 'success'
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState({
    email: ''
  });

  const { addToast } = useToast();
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setError(null);
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const validatePaymentForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paymentData.email)) return 'Invalid email address';
    // Card validation is skipped here as it's handled by the secure provider in a real implementation
    return null;
  };

  const simulatePayment = async (e) => {
    e.preventDefault();
    const validationError = validatePaymentForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    console.log('Starting payment simulation...');
    setStep('processing');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Payment processed. Setting success step.');

    setStep('success');
    // Simulate sending receipt email
    console.log('Payment successful! Receipt sent to:', paymentData.email);

    setTimeout(() => {
        onPaymentComplete();
        addToast('Payment successful!', 'success');
    }, 1500);
  };

  if (step === 'success') {
      return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 no-print">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300 p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SafeIcon icon={FiCheckCircle} className="text-green-600" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
                <p className="text-slate-600 mb-6">Thank you for your purchase. Your document is now ready.</p>
                <div className="animate-pulse text-sm text-slate-500">Redirecting to document...</div>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 hover:rotate-90 transition opacity-70 hover:opacity-100 focus:outline-none"
            type="button"
            disabled={step === 'processing'}
          >
            <SafeIcon icon={FiX} size={24} />
          </button>
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <SafeIcon icon={FiCreditCard} size={24} />
            Complete Purchase
          </h3>
          <p className="text-blue-100 mt-2 opacity-90">Secure payment processing</p>
        </div>

        <form onSubmit={simulatePayment} className="p-8 space-y-6">
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <span className="font-medium text-slate-700">Professional NDA Document</span>
            <span className="font-bold text-blue-600 text-lg">$12.99</span>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-slate-700 mb-2 block">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={paymentData.email}
                onChange={handlePaymentInputChange}
                placeholder="your@email.com"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition"
                disabled={step === 'processing'}
                required
              />
            </div>
            <div className="p-5 border-2 border-slate-100 rounded-2xl bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                  <SafeIcon icon={FiLock} size={14} />
                  Secure Card Entry (Simulated Iframe)
                </div>
              </div>

              {/* Note: In a production app, the following inputs would be provided by a PCI-compliant iframe (e.g., Stripe Elements)
                  to ensure the application never touches raw card data. For this simulation, we use uncontrolled inputs
                  to avoid storing sensitive data in the React state. */}
              <div className="space-y-3">
                <div className="relative">
                  <label htmlFor="cardNumber" className="sr-only">Card Number</label>
                  <SafeIcon icon={FiCreditCard} className="absolute left-3 top-3.5 text-slate-300" size={18} />
                  <input
                    id="cardNumber"
                    type="text"
                    placeholder="Card Number"
                    className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition shadow-sm"
                    autoComplete="cc-number"
                    disabled={step === 'processing'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label htmlFor="expiryDate" className="sr-only">Expiry</label>
                    <input
                      id="expiryDate"
                      type="text"
                      placeholder="MM / YY"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition shadow-sm"
                      autoComplete="cc-exp"
                      disabled={step === 'processing'}
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="cvc" className="sr-only">CVC</label>
                    <input
                      id="cvc"
                      type="text"
                      placeholder="CVC"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition shadow-sm"
                      autoComplete="cc-csc"
                      disabled={step === 'processing'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium text-center bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={step === 'processing'}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {step === 'processing' ? (
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
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
