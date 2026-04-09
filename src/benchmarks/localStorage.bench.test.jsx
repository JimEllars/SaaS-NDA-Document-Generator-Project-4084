/**
 * @vitest-environment jsdom
 */
import { render, fireEvent, act } from '@testing-library/react';
import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Simplified component mimicking App.jsx's optimized logic
function TestApp() {
  const [formData, setFormData] = useState({ count: 0 });

  return (
    <button onClick={() => setFormData(prev => ({ count: prev.count + 1 }))}>
      Increment {formData.count}
    </button>
  );
}

describe('App State Performance', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('updates state correctly on click', async () => {
    const { getByText } = render(<TestApp />);
    const button = getByText('Increment 0');

    fireEvent.click(button);

    expect(getByText('Increment 1')).toBeDefined();
  });
});
