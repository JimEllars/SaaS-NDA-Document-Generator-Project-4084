import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadStripe } from '@stripe/stripe-js';

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(),
}));

describe('stripe', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('resolves to null and warns if VITE_STRIPE_PUBLISHABLE_KEY is not defined', async () => {
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', '');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { stripePromise } = await import('./stripe.js');
    const result = await stripePromise;

    expect(warnSpy).toHaveBeenCalledWith('VITE_STRIPE_PUBLISHABLE_KEY is not defined in the environment variables.');
    expect(result).toBeNull();
    expect(loadStripe).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('calls loadStripe and resolves to its result if VITE_STRIPE_PUBLISHABLE_KEY is defined', async () => {
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_123');
    const mockStripeInstance = { elements: vi.fn() };
    vi.mocked(loadStripe).mockResolvedValue(mockStripeInstance);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { stripePromise } = await import('./stripe.js');
    const result = await stripePromise;

    expect(warnSpy).not.toHaveBeenCalled();
    expect(loadStripe).toHaveBeenCalledWith('pk_test_123');
    expect(result).toBe(mockStripeInstance);

    warnSpy.mockRestore();
  });
});
