// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import App from '../App';

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
    localStorage.clear();
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
});
