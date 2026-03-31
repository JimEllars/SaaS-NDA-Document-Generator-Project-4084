// @vitest-environment jsdom

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

// Mock scrollIntoView since it's not implemented in JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.print = vi.fn();
window.alert = vi.fn();

describe('App Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    window.print.mockClear();
    window.alert.mockClear();
    });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders the initial form correctly', () => {
    render(<App />);
    const headings = screen.getAllByText(/AXiM NDA Generator/i);
    expect(headings[0]).toBeInTheDocument();
    expect(screen.getByLabelText(/Disclosing Party/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Receiving Party/i)).toBeInTheDocument();
  });

  it('allows filling out the form and purchasing', async () => {
    render(<App />);

    // Fill form
    const disclosingInput = screen.getByLabelText(/Disclosing Party/i);
    const receivingInput = screen.getByLabelText(/Receiving Party/i);

    fireEvent.change(disclosingInput, { target: { value: 'Alice Corp' } });
    fireEvent.change(receivingInput, { target: { value: 'Bob Inc' } });

    // Check if purchase button is enabled
    // Use getAllByRole just in case
    const purchaseButtons = screen.getAllByRole('button', { name: /Purchase & Generate/i });
    const purchaseButton = purchaseButtons[0];
    expect(purchaseButton).not.toBeDisabled();

    // Click purchase
    fireEvent.click(purchaseButton);

    // Expect Payment Modal to open
    const modalHeaders = screen.getAllByText(/Complete Purchase/i);
    expect(modalHeaders[0]).toBeInTheDocument();

    // Fill payment details
    const emailInput = screen.getByLabelText(/Email Address/i);
    const cardInput = screen.getByLabelText(/Card Number/i);
    const expiryInput = screen.getByLabelText(/Expiry/i);
    const cvcInput = screen.getByLabelText(/CVC/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(cardInput, { target: { value: '4242 4242 4242 4242' } });
    fireEvent.change(expiryInput, { target: { value: '12/25' } });
    fireEvent.change(cvcInput, { target: { value: '123' } });

    // Click pay
    const payButtons = screen.getAllByRole('button', { name: /Pay \$12.99/i });
    fireEvent.click(payButtons[0]);

    // Fast-forward time for simulatePayment (2000ms processing + 1500ms success delay)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });

    // Modal should close and we should see "Payment Successful!"
    const successMsgs = screen.getAllByText(/Payment Successful!/i);
    expect(successMsgs[0]).toBeInTheDocument();

    // Check for document content
    expect(screen.getAllByText(/Alice Corp/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Bob Inc/i)[0]).toBeInTheDocument();
  });

  it('shows error toast when document update fails', async () => {
    // Spy on console.error to avoid noise in test output
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Spy on updateDocument to reject
    const updateSpy = vi.spyOn(paymentService, 'updateDocument').mockRejectedValue(new Error('Update failed'));

    render(<App />);

    // Fill form
    const disclosingInput = screen.getByLabelText(/Disclosing Party/i);
    const receivingInput = screen.getByLabelText(/Receiving Party/i);

    fireEvent.change(disclosingInput, { target: { value: 'Alice Corp' } });
    fireEvent.change(receivingInput, { target: { value: 'Bob Inc' } });

    // Click purchase
    const purchaseButtons = screen.getAllByRole('button', { name: /Purchase & Generate/i });
    fireEvent.click(purchaseButtons[0]);

    // Fill payment details
    const emailInput = screen.getByLabelText(/Email Address/i);
    const cardInput = screen.getByLabelText(/Card Number/i);
    const expiryInput = screen.getByLabelText(/Expiry/i);
    const cvcInput = screen.getByLabelText(/CVC/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(cardInput, { target: { value: '4242 4242 4242 4242' } });
    fireEvent.change(expiryInput, { target: { value: '12/25' } });
    fireEvent.change(cvcInput, { target: { value: '123' } });

    // Click pay
    const payButtons = screen.getAllByRole('button', { name: /Pay \$12.99/i });
    fireEvent.click(payButtons[0]);

    // Fast-forward time for payment completion
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });

    // We should be on the document preview now. Click "Edit Document"
    const editButtons = screen.getAllByRole('button', { name: /Edit Document/i });
    fireEvent.click(editButtons[0]);

    // Now we should be back at the form, but in editing mode.
    // Click "Update Document"
    const updateButtons = screen.getAllByRole('button', { name: /Update Document/i });
    fireEvent.click(updateButtons[0]);

    // Wait for the rejection to process
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(updateSpy).toHaveBeenCalled();

    // Verify error toast
    const errorToasts = screen.getAllByText(/Failed to update the document./i);
    expect(errorToasts[0]).toBeInTheDocument();

    updateSpy.mockRestore();
    console.error.mockRestore();
  });

  it('shows error toast when payment verification fails', async () => {
    // Spy on console.error to avoid noise in test output
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Spy on verifyPaymentAndGetDocument to reject
    const verifySpy = vi.spyOn(paymentService, 'verifyPaymentAndGetDocument').mockRejectedValue(new Error('Verification failed'));

    render(<App />);

    // Fill form
    const disclosingInput = screen.getByLabelText(/Disclosing Party/i);
    const receivingInput = screen.getByLabelText(/Receiving Party/i);

    fireEvent.change(disclosingInput, { target: { value: 'Alice Corp' } });
    fireEvent.change(receivingInput, { target: { value: 'Bob Inc' } });

    // Click purchase
    const purchaseButtons = screen.getAllByRole('button', { name: /Purchase & Generate/i });
    fireEvent.click(purchaseButtons[0]);

    // Fill payment details
    const emailInput = screen.getByLabelText(/Email Address/i);
    const cardInput = screen.getByLabelText(/Card Number/i);
    const expiryInput = screen.getByLabelText(/Expiry/i);
    const cvcInput = screen.getByLabelText(/CVC/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(cardInput, { target: { value: '4242 4242 4242 4242' } });
    fireEvent.change(expiryInput, { target: { value: '12/25' } });
    fireEvent.change(cvcInput, { target: { value: '123' } });

    // Click pay
    const payButtons = screen.getAllByRole('button', { name: /Pay \$12.99/i });
    fireEvent.click(payButtons[0]);

    // Allow promise rejection to bubble up
    await act(async () => {
      // Need a tiny tick to resolve the microtasks for createPaymentMethod before advancing timers
      await Promise.resolve();
    });

    // Wait for verifyPaymentAndGetDocument mock rejection
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(verifySpy).toHaveBeenCalled();

    // The payment processing should have set isProcessingPayment(false) and added a toast
    await act(async () => {
      await Promise.resolve();
    });

    // Verify error toast
    const errorToasts = screen.getAllByText(/Payment verification failed\. Please try again\./i);
    expect(errorToasts[0]).toBeInTheDocument();

    verifySpy.mockRestore();
    console.error.mockRestore();
  });
});
