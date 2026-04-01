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

  it('should save obfuscated data to sessionStorage after debounce', () => {
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

    // Should call setItem with ndaFormData and an obfuscated string
    expect(setItemSpy).toHaveBeenCalled();
    const [key, value] = setItemSpy.mock.calls[0];
    expect(key).toBe('ndaFormData');

    // Check if it's correctly obfuscated (base64 of URI encoded JSON)
    const decodedValue = JSON.parse(decodeURIComponent(atob(value)));
    expect(decodedValue.disclosing).toBe('Saved Company');
  });

  it('should load from sessionStorage on init with fallback for un-obfuscated data', () => {
    const savedData = {
      ...getDefaultFormData(),
      disclosing: 'Loaded Company',
      effectiveDate: '2023-01-01'
    };
    // Test fallback: storing plain JSON (un-obfuscated)
    sessionStorage.setItem('ndaFormData', JSON.stringify(savedData));

    const { result } = renderHook(() => useNDAForm());
    expect(result.current.formData.disclosing).toBe('Loaded Company');
  });

  it('should load obfuscated data from sessionStorage on init', () => {
    const savedData = {
      ...getDefaultFormData(),
      disclosing: 'Obfuscated Company',
      effectiveDate: '2023-01-01'
    };
    const obfuscated = btoa(encodeURIComponent(JSON.stringify(savedData)));
    sessionStorage.setItem('ndaFormData', obfuscated);

    const { result } = renderHook(() => useNDAForm());
    expect(result.current.formData.disclosing).toBe('Obfuscated Company');
  });
});
