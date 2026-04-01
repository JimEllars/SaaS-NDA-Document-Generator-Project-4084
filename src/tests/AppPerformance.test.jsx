// @vitest-environment jsdom

import { render, waitFor, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';
import { fireEvent } from '@testing-library/react';

// Mock scrollTo and print since they are not implemented in JSDOM
window.scrollTo = vi.fn();
window.print = vi.fn();

describe('App Performance', () => {
  let sessionStorageSpy;

  beforeEach(() => {
    sessionStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should not write to sessionStorage on initial render', async () => {
    render(<App />);

    // Fast-forward any initial effects
    act(() => {
      vi.runAllTimers();
    });

    // Verify sessionStorage.setItem was NOT called
    expect(sessionStorageSpy).not.toHaveBeenCalled();
  });

  it('should write to sessionStorage after form update and debounce', async () => {
    render(<App />);

    // Clear the spy calls from initial render
    sessionStorageSpy.mockClear();

    // Find an input field
    const nameInput = screen.getByLabelText(/Disclosing Party/i);

    // Simulate user typing
    fireEvent.change(nameInput, { target: { value: 'Test Company' } });

    // Advance timers for debounce (500ms in App.jsx)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Verify sessionStorage.setItem WAS called
    expect(sessionStorageSpy).toHaveBeenCalled();
    const [key, value] = sessionStorageSpy.mock.calls[0];
    expect(key).toBe('ndaFormData');

    // Check if it's correctly obfuscated (base64 of URI encoded JSON)
    const decodedValue = JSON.parse(decodeURIComponent(atob(value)));
    expect(decodedValue.disclosing).toBe('Test Company');
  });
});
