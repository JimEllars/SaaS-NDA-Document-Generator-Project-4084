import { loadStripe } from '@stripe/stripe-js';

// The Publishable Key from the user.
// In a real application, this should be an environment variable.
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51M9M9WJahsdipCJXf8NR7es7EnYBzk5vxNCKWW51H7TZdYdC4N0qMYATnHniWkN85iZc2lIMWh360fKuYGMFFUDt00A1wBVyPk';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
