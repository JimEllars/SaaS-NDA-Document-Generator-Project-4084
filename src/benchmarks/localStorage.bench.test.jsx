/**
 * @vitest-environment jsdom
 */
import { render, fireEvent, act } from '@testing-library/react';
import React, { useState, useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useDebounce from '../hooks/useDebounce';

// Simplified component mimicking App.jsx's optimized logic
function TestApp() {
  const [formData, setFormData] = useState({ count: 0 });
  const debouncedFormData = useDebounce(formData, 500);

  useEffect(() => {
    localStorage.setItem('ndaFormData', JSON.stringify(debouncedFormData));
  }, [debouncedFormData]);

  return (
    <button onClick={() => setFormData(prev => ({ count: prev.count + 1 }))}>
      Increment
    </button>
  );
}

describe('LocalStorage Performance Benchmark', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock setItem directly on the localStorage object
    vi.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem');
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('debounces localStorage updates', async () => {
    const { getByText } = render(<TestApp />);
    const button = getByText('Increment');

    // Initial render triggers one call immediately because debouncedValue initializes with initial value
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);

    // Simulate 10 rapid updates
    for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
        // Advance time slightly but not enough to trigger debounce
        act(() => {
             vi.advanceTimersByTime(10);
        });
    }

    // Should still be 1 call because debounce hasn't fired yet
    // The previous 1 call was from mount.
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);

    // Fast forward time past debounce delay (500ms)
    act(() => {
        vi.advanceTimersByTime(1000);
    });

    // Now it should have fired once more with the final value
    // Total calls: 1 (mount) + 1 (debounced update) = 2
    expect(localStorage.setItem).toHaveBeenCalledTimes(2);
  });
});
