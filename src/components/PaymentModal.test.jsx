/**
 * @vitest-environment jsdom
 */
import { render, screen, cleanup, act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import PaymentModal from './PaymentModal';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => <div data-testid="elements">{children}</div>,
  CardNumberElement: () => <div data-testid="card-number-element" />,
  CardExpiryElement: () => <div data-testid="card-expiry-element" />,
  CardCvcElement: () => <div data-testid="card-cvc-element" />,
  useStripe: vi.fn(),
  useElements: vi.fn()
}));

vi.mock('../context/ToastContext', () => ({
  useToast: vi.fn(() => ({ addToast: vi.fn() }))
}));

describe('PaymentModal', () => {
  const mockCreatePaymentMethod = vi.fn();
  const mockGetElement = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnPaymentComplete = vi.fn();

  beforeEach(() => {
    vi.mocked(useStripe).mockReturnValue({
      createPaymentMethod: mockCreatePaymentMethod,
    });
    vi.mocked(useElements).mockReturnValue({
      getElement: mockGetElement,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<PaymentModal isOpen={true} onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);
    expect(screen.getByText('Complete Purchase')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByTestId('card-number-element')).toBeInTheDocument();
    expect(screen.getByTestId('card-expiry-element')).toBeInTheDocument();
    expect(screen.getByTestId('card-cvc-element')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pay \$12\.99/i })).toBeInTheDocument();
  });

  it('disables submit button when stripe is not loaded', () => {
    vi.mocked(useStripe).mockReturnValue(null);
    render(<PaymentModal isOpen={true} onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);
    const button = screen.getByRole('button', { name: /Pay \$12\.99/i });
    expect(button).toBeDisabled();
  });

  it('shows error on invalid email address', async () => {
    // Setup proper userEvent
    const user = userEvent.setup();
    render(<PaymentModal isOpen={true} onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    const emailInput = screen.getByLabelText('Email Address');
    await user.type(emailInput, 'invalid@email'); // Needs to bypass regex but not HTML5 if we care, or just use fireEvent

    const form = emailInput.closest('form');
    fireEvent.submit(form);

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
    expect(mockCreatePaymentMethod).not.toHaveBeenCalled();
  });

  it('calls onPaymentComplete with paymentMethod id on success', async () => {
    const user = userEvent.setup();
    const fakeCardElement = { type: 'card' };
    mockGetElement.mockReturnValue(fakeCardElement);
    mockCreatePaymentMethod.mockResolvedValue({
      paymentMethod: { id: 'pm_123' },
    });

    render(<PaymentModal isOpen={true} onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    const emailInput = screen.getByLabelText('Email Address');
    await user.type(emailInput, 'test@example.com');

    const form = emailInput.closest('form');
    fireEvent.submit(form);

    expect(mockGetElement).toHaveBeenCalled();
    expect(mockCreatePaymentMethod).toHaveBeenCalledWith({
      type: 'card',
      card: fakeCardElement,
      billing_details: { email: 'test@example.com' },
    });

    // The component stays in 'processing' state in our mock flow since onPaymentComplete
    // would normally unmount it via the parent app component.
    await waitFor(() => {
      expect(mockOnPaymentComplete).toHaveBeenCalledWith('pm_123');
    });
  });

  it('shows error when createPaymentMethod returns an error', async () => {
    const user = userEvent.setup();
    mockGetElement.mockReturnValue({});
    mockCreatePaymentMethod.mockResolvedValue({
      error: { message: 'Your card has insufficient funds.' },
    });

    render(<PaymentModal isOpen={true} onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    const emailInput = screen.getByLabelText('Email Address');
    await user.type(emailInput, 'test@example.com');

    const form = emailInput.closest('form');

    // Silence console.error for this expected error test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fireEvent.submit(form);

    expect(await screen.findByText('Your card has insufficient funds.')).toBeInTheDocument();
    expect(mockOnPaymentComplete).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('shows unexpected error when createPaymentMethod throws', async () => {
    const user = userEvent.setup();
    mockGetElement.mockReturnValue({});
    mockCreatePaymentMethod.mockRejectedValue(new Error('Network error'));

    render(<PaymentModal isOpen={true} onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    const emailInput = screen.getByLabelText('Email Address');
    await user.type(emailInput, 'test@example.com');

    const form = emailInput.closest('form');

    // Silence console.error for this expected error test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fireEvent.submit(form);

    expect(await screen.findByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    expect(mockOnPaymentComplete).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<PaymentModal isOpen={true} onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    // Close button is the first button inside the modal
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons[0];
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the background overlay', async () => {
    const user = userEvent.setup();
    const { container } = render(<PaymentModal isOpen={true} onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    // Overlay is the first element inside the Elements wrapper div
    // Elements is mocked as <div data-testid="elements">{children}</div>
    const elementsDiv = screen.getByTestId('elements');
    const overlay = elementsDiv.firstChild;
    await user.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking modal content', async () => {
    const user = userEvent.setup();
    const { container } = render(<PaymentModal isOpen={true} onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    const elementsDiv = screen.getByTestId('elements');
    const overlay = elementsDiv.firstChild;
    const modalContent = overlay.firstChild;
    await user.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('clears error when typing in email input', async () => {
    const user = userEvent.setup();
    render(<PaymentModal isOpen={true} onClose={mockOnClose} onPaymentComplete={mockOnPaymentComplete} />);

    const emailInput = screen.getByLabelText('Email Address');
    await user.type(emailInput, 'invalid@email');

    const form = emailInput.closest('form');
    fireEvent.submit(form);

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();

    await user.type(emailInput, 'a');
    expect(screen.queryByText('Invalid email address')).not.toBeInTheDocument();
  });
});
