// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useNDAForm from './useNDAForm';
import { getDefaultFormData } from '../data/ndaData';

describe('useNDAForm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
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

  it('should save to sessionStorage after debounce', () => {
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

  it('should load from sessionStorage on init', () => {
    const savedData = {
      ...getDefaultFormData(),
      disclosing: 'Loaded Company',
      effectiveDate: '2023-01-01'
    };
    sessionStorage.setItem('ndaFormData', JSON.stringify(savedData));

    const { result } = renderHook(() => useNDAForm());
    expect(result.current.formData.disclosing).toBe('Loaded Company');
  });
});
