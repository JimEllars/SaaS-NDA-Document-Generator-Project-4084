// @vitest-environment jsdom
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import App from '../App';
import * as paymentService from '../api/paymentService';

expect.extend(matchers);

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({})),
}));

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => <div>{children}</div>,
  useStripe: () => ({
    createPaymentMethod: vi.fn().mockResolvedValue({
      paymentMethod: { id: 'pm_test' }
    }),
  }),
  useElements: () => ({
    getElement: vi.fn(),
  }),
  CardNumberElement: (props) => <input data-testid="card-number-element" {...props} onChange={() => {}} />,
  CardExpiryElement: (props) => <input data-testid="card-expiry-element" {...props} onChange={() => {}} />,
  CardCvcElement: (props) => <input data-testid="card-cvc-element" {...props} onChange={() => {}} />,
}));

// Mock window functions
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.print = vi.fn();
window.alert = vi.fn();

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    window.print.mockClear();
    window.alert.mockClear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('handles error when payment verification fails', async () => {
    // Spy on console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock verifyPaymentAndGetDocument to reject
    const verifySpy = vi.spyOn(paymentService, 'verifyPaymentAndGetDocument').mockRejectedValue(new Error('Verification failed test case'));

    render(<App />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/Disclosing Party/i), { target: { value: 'Alice Corp' } });
    fireEvent.change(screen.getByLabelText(/Receiving Party/i), { target: { value: 'Bob Inc' } });

    // Click purchase
    fireEvent.click(screen.getAllByRole('button', { name: /Purchase & Generate/i })[0]);

    // Fill payment details
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Card Number/i), { target: { value: '4242 4242 4242 4242' } });
    fireEvent.change(screen.getByLabelText(/Expiry/i), { target: { value: '12/25' } });
    fireEvent.change(screen.getByLabelText(/CVC/i), { target: { value: '123' } });

    // Click pay
    fireEvent.click(screen.getAllByRole('button', { name: /Pay \$12.99/i })[0]);

    // Allow promise rejection to bubble up
    await act(async () => {
      await Promise.resolve();
    });

    // Wait for verifyPaymentAndGetDocument mock rejection
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(verifySpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("Verification error:", expect.any(Error));

    // The payment processing should have set isProcessingPayment(false) and added a toast
    await act(async () => {
      await Promise.resolve();
    });

    // Verify error toast
    const errorToasts = screen.getAllByText(/Payment verification failed\. Please try again\./i);
    expect(errorToasts[0]).toBeInTheDocument();

    verifySpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('handles download, start over flow, and closing checkout', async () => {
    // To test the start over / close checkout / download flows.
    render(<App />);

    // 1. Fill form and purchase to open checkout modal
    fireEvent.change(screen.getByLabelText(/Disclosing Party/i), { target: { value: 'Alice Corp' } });
    fireEvent.change(screen.getByLabelText(/Receiving Party/i), { target: { value: 'Bob Inc' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Purchase & Generate/i })[0]);

    // Wait for the modal to be open and check if the Payment Modal Header exists
    expect(screen.getByText('Complete Purchase')).toBeInTheDocument();

    // Close the Payment Modal
    const purchaseText = screen.getByText('Complete Purchase');
    const headerDiv = purchaseText.parentElement;
    const closeBtn = headerDiv.querySelector('button');
    if (closeBtn) fireEvent.click(closeBtn);

    // 2. Start Over flow (cancel)
    const headerStartOver = screen.getAllByText(/Reset/i)[0];
    fireEvent.click(headerStartOver);

    // Expect Confirm Modal
    expect(screen.getAllByText(/Start Over\?/i)[0]).toBeInTheDocument();

    // Cancel Start over
    fireEvent.click(screen.getAllByText(/Cancel/i)[0]);

    // 3. Start Over flow (confirm)
    fireEvent.click(headerStartOver);
    fireEvent.click(screen.getAllByRole('button', { name: /Yes, Start Over/i })[0]);

    // 4. Download document
    // To test download we need a purchased document
    const verifySpy = vi.spyOn(paymentService, 'verifyPaymentAndGetDocument').mockResolvedValue({
      success: true,
      document: {
        title: 'Non-Disclosure Agreement',
        sections: [{ title: 'Parties', content: [{ type: 'paragraph', text: 'Test content' }] }]
      }
    });

    fireEvent.change(screen.getByLabelText(/Disclosing Party/i), { target: { value: 'Alice Corp' } });
    fireEvent.change(screen.getByLabelText(/Receiving Party/i), { target: { value: 'Bob Inc' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Purchase & Generate/i })[0]);

    // Fill payment
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Card Number/i), { target: { value: '4242 4242 4242 4242' } });
    fireEvent.change(screen.getByLabelText(/Expiry/i), { target: { value: '12/25' } });
    fireEvent.change(screen.getByLabelText(/CVC/i), { target: { value: '123' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Pay \$12.99/i })[0]);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });

    // Now we have the purchased document preview
    const downloadBtns = screen.getAllByRole('button', { name: /Download PDF/i });
    fireEvent.click(downloadBtns[0]);
    expect(window.print).toHaveBeenCalled();
  });
});
