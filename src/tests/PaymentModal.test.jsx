// @vitest-environment jsdom

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import PaymentModal from '../components/PaymentModal';
import { useStripe } from '@stripe/react-stripe-js';

expect.extend(matchers);

const mockCreatePaymentMethod = vi.fn();
const mockGetElement = vi.fn();
const mockUseStripe = vi.fn();

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({})),
}));

vi.mock('@stripe/react-stripe-js', async () => {
  const actual = await vi.importActual('@stripe/react-stripe-js');
  return {
    ...actual,
    Elements: ({ children }) => <div>{children}</div>,
    useStripe: vi.fn(),
    useElements: () => ({
      getElement: mockGetElement,
    }),
    CardNumberElement: (props) => <input data-testid="card-number-element" {...props} onChange={() => {}} />,
    CardExpiryElement: (props) => <input data-testid="card-expiry-element" {...props} onChange={() => {}} />,
    CardCvcElement: (props) => <input data-testid="card-cvc-element" {...props} onChange={() => {}} />,
  };
});

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

describe('PaymentModal', () => {
  const mockOnClose = vi.fn();
  const mockOnPaymentComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useStripe.mockReturnValue({
      createPaymentMethod: mockCreatePaymentMethod,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the payment modal correctly', () => {
    render(<PaymentModal onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    expect(screen.getByText('Complete Purchase')).toBeInTheDocument();
    expect(screen.getByText('Professional NDA Document')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();

    // Check for Stripe elements by our mock data-testids
    expect(screen.getByTestId('card-number-element')).toBeInTheDocument();
    expect(screen.getByTestId('card-expiry-element')).toBeInTheDocument();
    expect(screen.getByTestId('card-cvc-element')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Pay \$12.99/i })).toBeInTheDocument();
  });

  it('calls onClose when clicking the close button', () => {
    render(<PaymentModal onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    // The close button has an SVG icon and is positioned absolute top-right.
    // We can find it by its type "button" and verify the background click as well.
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find(b => b.querySelector('svg') && !b.textContent.includes('Pay'));

    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the backdrop', () => {
    render(<PaymentModal onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    // The backdrop is the parent div that has inset-0
    const backdrop = screen.getAllByText('Complete Purchase')[0].closest('div.fixed.inset-0');
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('prevents onClose when clicking inside the modal content', () => {
    render(<PaymentModal onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    // The modal content container has bg-white
    const modalContent = screen.getAllByText('Complete Purchase')[0].closest('div.bg-white.rounded-3xl');
    fireEvent.click(modalContent);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('displays an error for invalid email', async () => {
    render(<PaymentModal onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    const emailInput = screen.getByLabelText('Email Address');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    // Simulate form submission
    const form = emailInput.closest('form');
    fireEvent.submit(form);

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
    expect(mockCreatePaymentMethod).not.toHaveBeenCalled();
  });

  it('handles successful payment', async () => {
    const mockPaymentMethodId = 'pm_12345';
    mockCreatePaymentMethod.mockResolvedValueOnce({
      paymentMethod: { id: mockPaymentMethodId }
    });

    mockGetElement.mockReturnValue({ mockElement: true });

    render(<PaymentModal onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    const emailInput = screen.getByLabelText('Email Address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = emailInput.closest('form');
    fireEvent.submit(form);

    // Step should change to processing
    expect(await screen.findByText('Processing...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockCreatePaymentMethod).toHaveBeenCalledWith({
        type: 'card',
        card: { mockElement: true },
        billing_details: { email: 'test@example.com' }
      });
    });

    await waitFor(() => {
      expect(mockOnPaymentComplete).toHaveBeenCalledWith(mockPaymentMethodId);
    });
  });

  it('displays an error if createPaymentMethod returns an error', async () => {
    mockCreatePaymentMethod.mockResolvedValueOnce({
      error: { message: 'Your card was declined.' }
    });

    render(<PaymentModal onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    const emailInput = screen.getByLabelText('Email Address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = emailInput.closest('form');
    fireEvent.submit(form);

    expect(await screen.findByText('Your card was declined.')).toBeInTheDocument();

    // Step should be back to form
    expect(screen.getAllByRole('button', { name: /Pay \$12.99/i })[0]).toBeInTheDocument();
    expect(mockOnPaymentComplete).not.toHaveBeenCalled();
  });

  it('displays a generic error if createPaymentMethod throws an exception', async () => {
    mockCreatePaymentMethod.mockRejectedValueOnce(new Error('Network error'));

    // Mock console.error to keep test output clean
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<PaymentModal onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    const emailInput = screen.getByLabelText('Email Address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = emailInput.closest('form');
    fireEvent.submit(form);

    expect(await screen.findByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();

    expect(mockOnPaymentComplete).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('disables submit button when processing', () => {
    // Note: Since `useStripe` is injected via context in `Elements`, and our top-level
    // module mock doesn't naturally penetrate the `Elements` children without more complex
    // setup (and depending on `@stripe/react-stripe-js` internals), we can test the disabled
    // state by simulating a processing step.
    // Let's do a processing state instead to verify disabled logic!
    const { getByRole, getByLabelText } = render(<PaymentModal onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    // Setup to return a never-resolving promise so it stays in processing
    mockCreatePaymentMethod.mockImplementationOnce(() => new Promise(() => {}));

    // Make sure stripe is mock resolved, to not block the function
    const emailInput = getByLabelText('Email Address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Submit form to set step = 'processing'
    const form = emailInput.closest('form');
    fireEvent.submit(form);

    // Now it should be processing and disabled
    const processingButton = screen.getAllByRole('button')[1]; // Second button is the submit
    expect(processingButton.disabled).toBe(true);
  });
});
