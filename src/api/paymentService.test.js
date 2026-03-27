import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyPaymentAndGetDocument, updateDocument } from './paymentService';
import { generateDocument } from '../utils/documentGenerator';

vi.mock('../utils/documentGenerator', () => ({
  generateDocument: vi.fn(),
}));

describe('paymentService', () => {
  const mockFormData = { disclosing: 'Alice', receiving: 'Bob' };
  const mockDocument = { title: 'NDA', content: '...' };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('verifyPaymentAndGetDocument', () => {
    it('should reject with "Invalid payment method" if paymentMethodId is null', async () => {
      const promise = verifyPaymentAndGetDocument(null, mockFormData);

      // Advance timers to trigger the setTimeout
      vi.advanceTimersByTime(2000);

      await expect(promise).rejects.toThrow('Invalid payment method');
    });

    it('should reject with "Invalid payment method" if paymentMethodId is missing', async () => {
      const promise = verifyPaymentAndGetDocument(undefined, mockFormData);

      vi.advanceTimersByTime(2000);

      await expect(promise).rejects.toThrow('Invalid payment method');
    });

    it('should resolve with the document when valid parameters are provided', async () => {
      generateDocument.mockReturnValue(mockDocument);

      const promise = verifyPaymentAndGetDocument('pm_123', mockFormData);

      vi.advanceTimersByTime(2000);

      const result = await promise;
      expect(result).toEqual({
        success: true,
        document: mockDocument
      });
      expect(generateDocument).toHaveBeenCalledWith({ ...mockFormData, isPaid: true });
    });

    it('should reject with "Failed to generate document securely" if generateDocument throws', async () => {
      generateDocument.mockImplementation(() => {
        throw new Error('Gen error');
      });

      const promise = verifyPaymentAndGetDocument('pm_123', mockFormData);

      vi.advanceTimersByTime(2000);

      await expect(promise).rejects.toThrow('Failed to generate document securely');
    });
  });

  describe('updateDocument', () => {
    it('should resolve with the updated document when valid formData is provided', async () => {
      generateDocument.mockReturnValue(mockDocument);

      const promise = updateDocument(mockFormData);

      vi.advanceTimersByTime(1000);

      const result = await promise;
      expect(result).toEqual({
        success: true,
        document: mockDocument
      });
      expect(generateDocument).toHaveBeenCalledWith({ ...mockFormData, isPaid: true });
    });

    it('should reject with "Failed to update document" if generateDocument throws', async () => {
      generateDocument.mockImplementation(() => {
        throw new Error('Gen error');
      });

      const promise = updateDocument(mockFormData);

      vi.advanceTimersByTime(1000);

      await expect(promise).rejects.toThrow('Failed to update document');
    });
  });
});
