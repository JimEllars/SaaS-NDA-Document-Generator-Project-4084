import { loadStripe } from '@stripe/stripe-js';

// The Publishable Key from the user.
// Accessed via environment variable VITE_STRIPE_PUBLISHABLE_KEY.
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY is not defined in the environment variables.');
}

export const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : Promise.resolve(null);
