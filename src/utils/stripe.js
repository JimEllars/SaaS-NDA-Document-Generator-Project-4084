import { loadStripe } from '@stripe/stripe-js';

// The Publishable Key from the user.
// TODO: In a production environment, this key should be stored in an environment variable (e.g., VITE_STRIPE_PUBLISHABLE_KEY)
// and accessed via import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.
// For now, it is hardcoded for demonstration purposes.
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51M9M9WJahsdipCJXf8NR7es7EnYBzk5vxNCKWW51H7TZdYdC4N0qMYATnHniWkN85iZc2lIMWh360fKuYGMFFUDt00A1wBVyPk';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
