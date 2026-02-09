import React, { useState } from 'react';
// Using named imports to enable tree-shaking
import { FiX, FiCreditCard, FiCheckCircle, FiGlobe } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const PaymentModal = ({ onClose, onPaymentComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    email: ''
  });

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const validatePaymentForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return paymentData.cardNumber.replace(/\s/g, '').length >= 15 &&
           paymentData.expiryDate.length >= 4 &&
           paymentData.cvc.length >= 3 &&
           emailRegex.test(paymentData.email);
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

    // Simulate sending receipt email
    console.log('Payment successful! Receipt sent to:', paymentData.email);
    onPaymentComplete();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white relative">
          <button
            onClick={onClose}
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
  );
};

export default PaymentModal;
