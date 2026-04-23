// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useNDAForm from './useNDAForm';

describe('useNDAForm Security', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should store data in localStorage in an encrypted or obfuscated format', () => {
    const { result } = renderHook(() => useNDAForm());
    const sensitiveName = 'Super Secret Stealth Startup';

    act(() => {
      result.current.setFormData({ ...result.current.formData, disclosing: sensitiveName });
    });

    // Advance timers for the debounce in useEffect
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const storedValue = localStorage.getItem('axim_nda_draft');
    expect(storedValue).not.toBeNull();

    // Verify that the sensitive name is NOT stored in plaintext
    expect(storedValue).not.toContain(sensitiveName);

    // We also expect it not to be easily readable as JSON if we encrypt the whole payload
    let isPlainJSON = true;
    try {
      JSON.parse(storedValue);
    } catch (e) {
      isPlainJSON = false;
    }
    expect(isPlainJSON).toBe(false);
  });
});
