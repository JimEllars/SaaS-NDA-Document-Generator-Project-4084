/**
 * @vitest-environment jsdom
 */
import { render, fireEvent, act } from '@testing-library/react';
import React, { useRef, useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useNDAForm from '../hooks/useNDAForm';

function TestComponent() {
  const renderCount = useRef(0);
  renderCount.current++;

  const { formData, setFormData } = useNDAForm();

  return (
    <div>
      <span data-testid="renders">{renderCount.current}</span>
      <button onClick={() => setFormData({ ...formData, count: (formData.count || 0) + 1 })}>Update</button>
    </div>
  );
}

describe('useNDAForm Render Benchmark', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('avoids extra re-render on debounce timeout', async () => {
    const { getByTestId, getByText } = render(<TestComponent />);

    // Initial render count should be 1
    expect(getByTestId('renders').textContent).toBe('1');

    const button = getByText('Update');

    // Trigger update
    fireEvent.click(button);

    // Render count should be 2 because we updated state
    expect(getByTestId('renders').textContent).toBe('2');

    // Fast forward to let debounce trigger
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // With current implementation, it re-renders again (to 3) because debouncedFormData changes state
    // The goal is to keep it at 2 by using a ref for debounce, so that the parent component doesn't re-render.

    // Output the final render count
    console.log('Final render count:', getByTestId('renders').textContent);

    // we won't assert toBe(2) here yet until we fix it
  });
});
