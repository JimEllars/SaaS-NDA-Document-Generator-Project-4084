// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useNDAForm from './useNDAForm';

describe('useNDAForm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useNDAForm());
    expect(result.current.formData.disclosing).toBe('');
    expect(result.current.formData.jurisdiction).toBe('Delaware');
  });

  it('should update form data', () => {
    const { result } = renderHook(() => useNDAForm());

    act(() => {
      // In hook, setFormData is state setter.
      // If we pass a function, it receives prev state.
      const current = result.current.formData;
      result.current.setFormData({ ...current, disclosing: 'New Company' });
    });

    expect(result.current.formData.disclosing).toBe('New Company');
  });

  it('should reset form data', () => {
    const { result } = renderHook(() => useNDAForm());

    act(() => {
      const current = result.current.formData;
      result.current.setFormData({ ...current, disclosing: 'Changed' });
    });
    expect(result.current.formData.disclosing).toBe('Changed');

    act(() => {
      result.current.resetForm();
    });
    expect(result.current.formData.disclosing).toBe('');
  });

  it('should save to localStorage after debounce', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => useNDAForm());

    act(() => {
        const current = result.current.formData;
        result.current.setFormData({ ...current, disclosing: 'Saved Company' });
    });

    // Advance timers by 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(setItemSpy).toHaveBeenCalledWith('ndaFormData', expect.stringContaining('Saved Company'));
  });

  it('should load from localStorage on init', () => {
    const savedData = {
      disclosing: 'Loaded Company',
      receiving: '',
      industry: 'general',
      strictness: 'standard',
      type: 'unilateral',
      jurisdiction: 'Delaware',
      term: '3',
      isPaid: false,
      includeReturn: true,
      effectiveDate: '2023-01-01'
    };
    localStorage.setItem('ndaFormData', JSON.stringify(savedData));

    const { result } = renderHook(() => useNDAForm());
    expect(result.current.formData.disclosing).toBe('Loaded Company');
  });
});
