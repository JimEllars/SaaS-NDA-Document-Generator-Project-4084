// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import ToastContainer from '../components/Toast';
import { useToast } from '../context/ToastContext';

expect.extend(matchers);

// Mock the context hook
vi.mock('../context/ToastContext', () => ({
  useToast: vi.fn(),
}));

import { cleanup } from '@testing-library/react';

describe('ToastContainer', () => {
  const mockRemoveToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders null when there are no toasts', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [],
      removeToast: mockRemoveToast,
    });
    const { container } = render(<ToastContainer />);
    expect(container.firstChild).toBeNull();
  });

  it('renders info toast correctly', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [{ id: '1', message: 'Info message', type: 'info' }],
      removeToast: mockRemoveToast,
    });
    render(<ToastContainer />);
    expect(screen.getByText('Info message')).toBeInTheDocument();

    const toastElement = screen.getByText('Info message').parentElement;
    expect(toastElement).toHaveClass('bg-blue-50');
  });

  it('renders success toast correctly', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [{ id: '2', message: 'Success message', type: 'success' }],
      removeToast: mockRemoveToast,
    });
    render(<ToastContainer />);
    expect(screen.getByText('Success message')).toBeInTheDocument();

    const toastElement = screen.getByText('Success message').parentElement;
    expect(toastElement).toHaveClass('bg-green-50');
  });

  it('renders error toast correctly', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [{ id: '3', message: 'Error message', type: 'error' }],
      removeToast: mockRemoveToast,
    });
    render(<ToastContainer />);
    expect(screen.getByText('Error message')).toBeInTheDocument();

    const toastElement = screen.getByText('Error message').parentElement;
    expect(toastElement).toHaveClass('bg-red-50');
  });

  it('calls removeToast when close button is clicked', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [{ id: '123', message: 'Dismissable message', type: 'info' }],
      removeToast: mockRemoveToast,
    });
    render(<ToastContainer />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(mockRemoveToast).toHaveBeenCalledTimes(1);
    expect(mockRemoveToast).toHaveBeenCalledWith('123');
  });

  it('renders multiple toasts', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [
        { id: '1', message: 'First', type: 'info' },
        { id: '2', message: 'Second', type: 'success' }
      ],
      removeToast: mockRemoveToast,
    });
    render(<ToastContainer />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});
