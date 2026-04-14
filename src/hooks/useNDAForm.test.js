// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useNDAForm from './useNDAForm';
import { getDefaultFormData } from '../data/ndaData';

describe('useNDAForm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useNDAForm());
    const defaults = getDefaultFormData();
    expect(result.current.formData.disclosing).toBe(defaults.disclosing);
    expect(result.current.formData.jurisdiction).toBe(defaults.jurisdiction);
    expect(result.current.debouncedFormData.disclosing).toBe(defaults.disclosing);
  });

  it('should update form data and debounce debouncedFormData', () => {
    const { result, rerender } = renderHook(() => useNDAForm());

    act(() => {
      // In hook, setFormData is state setter.
      // If we pass a function, it receives prev state.
      const current = result.current.formData;
      result.current.setFormData({ ...current, disclosing: 'New Company' });
    });

    expect(result.current.formData.disclosing).toBe('New Company');
    // Before timeout, debounced should still be default
    expect(result.current.debouncedFormData.disclosing).toBe('');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    rerender(); // Force re-render to get the updated debouncedFormData since useRef won't trigger it

    expect(result.current.debouncedFormData.disclosing).toBe('New Company');
  });

  it('should reset form data', () => {
    const { result } = renderHook(() => useNDAForm());
    const defaults = getDefaultFormData();

    act(() => {
      const current = result.current.formData;
      result.current.setFormData({ ...current, disclosing: 'Changed' });
    });
    expect(result.current.formData.disclosing).toBe('Changed');

    act(() => {
      result.current.resetForm();
    });
    expect(result.current.formData.disclosing).toBe(defaults.disclosing);
  });

  it('should not persist sensitive data to sessionStorage (Regression test for Base64 obfuscation vulnerability)', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => useNDAForm());

    act(() => {
      const current = result.current.formData;
      result.current.setFormData({ ...current, disclosing: 'Secret Company' });
    });

    // Advance timers in case a debounce strategy is still present
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // The component should NOT use sessionStorage to persist the form state
    expect(setItemSpy).not.toHaveBeenCalledWith('ndaFormData', expect.any(String));

    setItemSpy.mockRestore();
  });
});
