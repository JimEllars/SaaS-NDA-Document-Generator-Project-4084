import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('stripe utils', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.mock('@stripe/stripe-js', () => ({
      loadStripe: vi.fn().mockResolvedValue('mocked_stripe_instance'),
    }));
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('calls loadStripe when env var is present', async () => {
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_123');
    const { loadStripe } = await import('@stripe/stripe-js');
    const { stripePromise } = await import('./stripe.js');

    expect(loadStripe).toHaveBeenCalledWith('pk_test_123');
    expect(console.warn).not.toHaveBeenCalled();
    const result = await stripePromise;
    expect(result).toBe('mocked_stripe_instance');
  });

  it('resolves to null and warns when env var is missing (empty string)', async () => {
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', '');
    const { loadStripe } = await import('@stripe/stripe-js');
    const { stripePromise } = await import('./stripe.js');

    expect(loadStripe).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('VITE_STRIPE_PUBLISHABLE_KEY is not defined in the environment variables.');
    const result = await stripePromise;
    expect(result).toBeNull();
  });

  it('resolves to null and warns when env var is undefined', async () => {
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', undefined);
    const { loadStripe } = await import('@stripe/stripe-js');
    const { stripePromise } = await import('./stripe.js');

    expect(loadStripe).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('VITE_STRIPE_PUBLISHABLE_KEY is not defined in the environment variables.');
    const result = await stripePromise;
    expect(result).toBeNull();
  });

  it('rejects when loadStripe fails', async () => {
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_123');
    const { loadStripe } = await import('@stripe/stripe-js');
    loadStripe.mockRejectedValue(new Error('Stripe failed to load'));

    const { stripePromise } = await import('./stripe.js');

    await expect(stripePromise).rejects.toThrow('Stripe failed to load');
  });
});
