import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
/**
 * @vitest-environment jsdom
 */
import { vi, describe, it, expect, afterEach } from 'vitest';
import ToastContainer from './Toast';
import { useToast } from '../context/ToastContext';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

vi.mock('../context/ToastContext', () => ({
  useToast: vi.fn(),
}));

describe('ToastContainer', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders nothing when there are no toasts', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [],
      removeToast: vi.fn(),
    });

    const { container } = render(<ToastContainer />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a list of toasts', () => {
    const mockToasts = [
      { id: '1', type: 'info', message: 'Info message' },
      { id: '2', type: 'success', message: 'Success message' },
      { id: '3', type: 'error', message: 'Error message' },
    ];

    vi.mocked(useToast).mockReturnValue({
      toasts: mockToasts,
      removeToast: vi.fn(),
    });

    render(<ToastContainer />);

    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('applies correct styling based on toast type', () => {
    const mockToasts = [
      { id: '1', type: 'info', message: 'Info message' },
      { id: '2', type: 'success', message: 'Success message' },
      { id: '3', type: 'error', message: 'Error message' },
    ];

    vi.mocked(useToast).mockReturnValue({
      toasts: mockToasts,
      removeToast: vi.fn(),
    });

    render(<ToastContainer />);

    const infoToast = screen.getByText('Info message').closest('div').parentElement;
    expect(infoToast).toHaveClass('bg-blue-50', 'text-blue-800', 'border-blue-200');

    const successToast = screen.getByText('Success message').closest('div').parentElement;
    expect(successToast).toHaveClass('bg-green-50', 'text-green-800', 'border-green-200');

    const errorToast = screen.getByText('Error message').closest('div').parentElement;
    expect(errorToast).toHaveClass('bg-red-50', 'text-red-800', 'border-red-200');
  });

  it('calls removeToast when close button is clicked', async () => {
    const removeToastMock = vi.fn();
    const mockToasts = [
      { id: '1', type: 'info', message: 'Info message' },
    ];

    vi.mocked(useToast).mockReturnValue({
      toasts: mockToasts,
      removeToast: removeToastMock,
    });

    render(<ToastContainer />);

    // Find the close button. Since SafeIcon is an SVG, we can find the button
    const closeButton = screen.getByRole('button');
    await userEvent.click(closeButton);

    expect(removeToastMock).toHaveBeenCalledWith('1');
    expect(removeToastMock).toHaveBeenCalledTimes(1);
  });
});
