// @vitest-environment jsdom
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from './ToastContext';

describe('ToastContext', () => {
  describe('useToast', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('throws an error if used outside of a ToastProvider', () => {
      // Mock console.error to avoid React's error boundary logging in the test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useToast());
      }).toThrow('useToast must be used within a ToastProvider');

      consoleSpy.mockRestore();
    });

    it('adds and removes toasts correctly', () => {
      const wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;
      const { result } = renderHook(() => useToast(), { wrapper });

      // Initially empty
      expect(result.current.toasts).toEqual([]);

      // Add a toast
      act(() => {
        result.current.addToast('Test message', 'success', 0); // duration 0 for manual removal
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        message: 'Test message',
        type: 'success',
        duration: 0,
      });
      // id should be a string containing numbers/letters
      expect(typeof result.current.toasts[0].id).toBe('string');

      const toastId = result.current.toasts[0].id;

      // Remove the toast
      act(() => {
        result.current.removeToast(toastId);
      });

      expect(result.current.toasts).toEqual([]);
    });

    it('automatically removes toasts after the specified duration', () => {
      vi.useFakeTimers();

      const wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Auto-remove test', 'info', 3000);
      });

      expect(result.current.toasts).toHaveLength(1);

      // Fast-forward time by 2999ms - toast should still be there
      act(() => {
        vi.advanceTimersByTime(2999);
      });
      expect(result.current.toasts).toHaveLength(1);

      // Fast-forward by 1ms to reach 3000ms
      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(result.current.toasts).toEqual([]);
    });

    it('does not automatically remove toasts with duration 0', () => {
      vi.useFakeTimers();

      const wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Persistent toast', 'error', 0);
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        // Advance time significantly
        vi.advanceTimersByTime(100000);
      });

      expect(result.current.toasts).toHaveLength(1);
    });
  });
});
