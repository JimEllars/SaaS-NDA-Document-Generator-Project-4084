import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VerificationPortal from './VerificationPortal';
import { ToastProvider } from '../context/ToastContext';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </BrowserRouter>
  );
};

vi.mock('../utils/telemetry', () => ({
  logException: vi.fn(),
}));

describe('VerificationPortal Timeout Recovery', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('handles verification timeout correctly', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new DOMException('The user aborted a request.', 'AbortError'));

    renderWithProviders(<VerificationPortal />);

    const input = screen.getByPlaceholderText('Enter Secure Trace ID...');
    fireEvent.change(input, { target: { value: 'AXM-1234' } });

    const verifyButton = screen.getByRole('button', { name: /verify/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Network Connection Interrupted')).toBeInTheDocument();
      expect(screen.getByText('Retry Connection')).toBeInTheDocument();
    });
  });
});
