// @vitest-environment jsdom
import React from 'react';
import { render, waitFor, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';
import { fireEvent } from '@testing-library/react';

// Mock scrollTo and print since they are not implemented in JSDOM
window.scrollTo = vi.fn();
window.print = vi.fn();

describe('App Performance', () => {
  let localStorageSpy;

  beforeEach(() => {
    localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should not write to localStorage on initial render', async () => {
    render(<App />);

    // Fast-forward any initial effects
    act(() => {
      vi.runAllTimers();
    });

    // Verify localStorage.setItem was NOT called
    expect(localStorageSpy).not.toHaveBeenCalled();
  });

  it('should write to localStorage after form update and debounce', async () => {
    render(<App />);

    // Clear the spy calls from initial render
    localStorageSpy.mockClear();

    // Find an input field
    const nameInput = screen.getByLabelText(/Disclosing Party/i);

    // Simulate user typing
    fireEvent.change(nameInput, { target: { value: 'Test Company' } });

    // Advance timers for debounce (500ms in App.jsx)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Verify localStorage.setItem WAS called with the new data
    expect(localStorageSpy).toHaveBeenCalledWith(
      'ndaFormData',
      expect.stringContaining('Test Company')
    );
  });
});
