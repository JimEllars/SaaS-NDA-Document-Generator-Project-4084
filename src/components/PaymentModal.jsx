import React, { useState, useRef, useEffect } from 'react';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { FiX, FiCreditCard, FiCheckCircle, FiGlobe, FiLock } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useToast } from '../context/ToastContext';
import { stripePromise } from '../utils/stripe';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#334155", // slate-700
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "14px",
      "::placeholder": {
        color: "#94a3b8" // slate-400
      }
    },
    invalid: {
      color: "#dc2626", // red-600
      iconColor: "#dc2626"
    }
  }
};

const INPUT_CLASSES = "w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition";
const LABEL_CLASSES = "text-sm font-medium text-slate-700 mb-2 block";
const CARD_CONTAINER_CLASSES = "w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus-within:border-blue-500 transition shadow-sm";
const SR_ONLY_LABEL = "sr-only";

const PaymentFormContent = React.memo(({ onClose, onPaymentComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [step, setStep] = useState('form'); // 'form', 'processing', 'success'
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');

  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email address');
      return;
    }

    setStep('processing');
    setError(null);

    const cardNumberElement = elements.getElement(CardNumberElement);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: {
          email: email,
        },
      });

      if (error) {
        console.error('Payment Error:', error);
        setError(error.message);
        setStep('form');
      } else {
        // PaymentMethod created successfully
        // We pass the paymentMethod.id up to the App, which will call the mock backend API
        onPaymentComplete(paymentMethod.id);
      }
    } catch (err) {
      console.error("An unexpected error occurred", err);
      setError("An unexpected error occurred. Please try again.");
      setStep('form');
    }
  };


  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 no-print"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
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
          <p className="text-blue-100 mt-2 opacity-90">Secure payment processing via Stripe</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <span className="font-medium text-slate-700">Professional NDA Document</span>
            <span className="font-bold text-blue-600 text-lg">$12.99</span>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className={LABEL_CLASSES}>Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setError(null);
                  setEmail(e.target.value);
                }}
                placeholder="your@email.com"
                className={INPUT_CLASSES}
                disabled={step === 'processing'}
                required
              />
            </div>
            <div className="p-5 border-2 border-slate-100 rounded-2xl bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                  <SafeIcon icon={FiLock} size={14} />
                  Secure Card Entry
                </div>
                <div className="flex gap-1 opacity-50">
                  {/* Icons for card types could go here */}
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <label htmlFor="cardNumber-element" className={SR_ONLY_LABEL}>Card Number</label>
                  <div className={CARD_CONTAINER_CLASSES}>
                    <CardNumberElement id="cardNumber-element" options={CARD_ELEMENT_OPTIONS} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label htmlFor="expiryDate-element" className={SR_ONLY_LABEL}>Expiry</label>
                    <div className={CARD_CONTAINER_CLASSES}>
                        <CardExpiryElement id="expiryDate-element" options={CARD_ELEMENT_OPTIONS} />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="cvc-element" className={SR_ONLY_LABEL}>CVC</label>
                    <div className={CARD_CONTAINER_CLASSES}>
                        <CardCvcElement id="cvc-element" options={CARD_ELEMENT_OPTIONS} />
                    </div>
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
            disabled={!stripe || step === 'processing'}
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
                Pay $12.99
              </>
            )}
          </button>

          <div className="flex items-center gap-2 justify-center text-xs text-slate-500 font-medium">
            <SafeIcon icon={FiGlobe} size={12} />
            Secured by Stripe
          </div>
        </form>
      </div>
    </div>
  );
});

const PaymentModal = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};

export default PaymentModal;
