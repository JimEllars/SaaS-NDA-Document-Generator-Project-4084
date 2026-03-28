/**
 * @vitest-environment jsdom
 */
import { render, fireEvent, act } from '@testing-library/react';
import { useRef, useEffect } from 'react';
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

    // Output the final render count to verify it stayed at 2
    console.log('Final render count:', getByTestId('renders').textContent);

    expect(getByTestId('renders').textContent).toBe('2');
  });
});
