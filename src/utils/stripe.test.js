import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadStripe } from '@stripe/stripe-js';

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(),
}));

describe('stripe utility', () => {
  let consoleWarnSpy;

  beforeEach(() => {
    vi.resetModules();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    consoleWarnSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('resolves to null and warns if VITE_STRIPE_PUBLISHABLE_KEY is not defined', async () => {
    // Ensure the env var is not set
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', '');

    const { stripePromise } = await import('./stripe.js');

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'VITE_STRIPE_PUBLISHABLE_KEY is not defined in the environment variables.'
    );
    expect(loadStripe).not.toHaveBeenCalled();

    const result = await stripePromise;
    expect(result).toBeNull();
  });

  it('calls loadStripe and resolves with its return value if VITE_STRIPE_PUBLISHABLE_KEY is defined', async () => {
    const fakeKey = 'pk_test_123';
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', fakeKey);

    const mockStripeInstance = { elements: vi.fn() };
    loadStripe.mockResolvedValue(mockStripeInstance);

    const { stripePromise } = await import('./stripe.js');

    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(loadStripe).toHaveBeenCalledWith(fakeKey);

    const result = await stripePromise;
    expect(result).toBe(mockStripeInstance);
  });
});

describe('stripe utility additional tests', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('rejects if loadStripe rejects', async () => {
    const fakeKey = 'pk_test_123';
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', fakeKey);

    const error = new Error('Network error');
    loadStripe.mockRejectedValue(error);

    const { stripePromise } = await import('./stripe.js');

    await expect(stripePromise).rejects.toThrow('Network error');
  });
});
