// @vitest-environment jsdom

import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';
import { fireEvent } from '@testing-library/react';

// Mock scrollTo and print since they are not implemented in JSDOM
window.scrollTo = vi.fn();
window.print = vi.fn();

describe('App Performance', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should not write to sessionStorage on initial render', async () => {
    const sessionStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    render(<App />);

    // Fast-forward any initial effects
    act(() => {
      vi.runAllTimers();
    });

    // Verify sessionStorage.setItem was NOT called
    expect(sessionStorageSpy).not.toHaveBeenCalled();
  });

  it('should update form state when user types', async () => {
    render(<App />);

    // Find an input field
    const nameInput = screen.getByLabelText(/Disclosing Party/i);

    // Simulate user typing
    fireEvent.change(nameInput, { target: { value: 'Test Company' } });

    // Verify input value changed
    expect(nameInput.value).toBe('Test Company');
  });
});
