// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getValidAccessToken, verifySession, processPayment, clearAccessToken } from '../api/paymentService';

describe('paymentService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
    // Use fake timers for simulate logic
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  describe('getValidAccessToken', () => {
    it('should return null if no token is stored', () => {
      expect(getValidAccessToken()).toBeNull();
    });

    it('should return the token from sessionStorage', () => {
      sessionStorage.setItem('axim_access_token', 'test_token');
      expect(getValidAccessToken()).toBe('test_token');
    });
  });

  describe('clearAccessToken', () => {
    it('should remove the token from sessionStorage', () => {
      sessionStorage.setItem('axim_access_token', 'test_token');
      clearAccessToken();
      expect(sessionStorage.getItem('axim_access_token')).toBeNull();
    });
  });

  describe('verifySession', () => {
    it('should throw an error if no session ID is provided', async () => {
      await expect(verifySession()).rejects.toThrow('Invalid session ID');
    });

    it('should throw if simulated payment and PROD is true', async () => {
      vi.stubEnv('PROD', true);
      await expect(verifySession('AXM-123')).rejects.toThrow('Simulation logic is not permitted');
    });

    it('should handle simulated payment in dev', async () => {
      vi.stubEnv('PROD', false);
      const promise = verifySession('AXM-123');
      await Promise.resolve(); // flush microtasks
      vi.advanceTimersByTime(1000);
      const result = await promise;

      expect(result).toEqual({ isPaid: true, token: 'simulated_jwt_token' });
      expect(sessionStorage.getItem('axim_access_token')).toBe('simulated_jwt_token');
    });

    it('should throw an error for a network/401 failure during verification', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      });

      await expect(verifySession('real-session-id')).rejects.toThrow('Failed to verify session');
      expect(global.fetch).toHaveBeenCalledWith('/api/verify-session?session_id=real-session-id', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should fetch and return session data', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ isPaid: true, token: 'real_jwt_token' })
      });

      const data = await verifySession('real-session-id');
      expect(data).toEqual({ isPaid: true, token: 'real_jwt_token' });
      expect(sessionStorage.getItem('axim_access_token')).toBe('real_jwt_token');
    });
  });

  describe('processPayment', () => {
    it('should throw if simulation and PROD is true', async () => {
      vi.stubEnv('PROD', true);
      vi.stubEnv('VITE_PAYMENT_API_URL', '');
      await expect(processPayment('prod_123')).rejects.toThrow('Simulation logic is not permitted');
    });

    it('should resolve simulation if not PROD', async () => {
      vi.stubEnv('PROD', false);
      vi.stubEnv('VITE_PAYMENT_API_URL', '');

      const promise = processPayment('prod_123');
      await Promise.resolve();
      vi.advanceTimersByTime(1000);
      const data = await promise;

      expect(data.url).toMatch(/\/\?session_id=AXM-/);
    });

    it('should handle fetch failure', async () => {
      vi.stubEnv('VITE_PAYMENT_API_URL', 'http://api.test');
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      await expect(processPayment('prod_123')).rejects.toThrow('Failed to create checkout session');
    });

    it('should fetch and return checkout URL', async () => {
      vi.stubEnv('VITE_PAYMENT_API_URL', 'http://api.test');
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.com/123', token: 'token123' })
      });

      const data = await processPayment('prod_123');
      expect(data.url).toBe('https://checkout.stripe.com/123');
      expect(sessionStorage.getItem('axim_access_token')).toBe('token123');
    });
  });
});
