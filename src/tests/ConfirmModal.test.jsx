
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import ConfirmModal from '../components/ConfirmModal';

// @vitest-environment jsdom

expect.extend(matchers);

describe('ConfirmModal Component', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      isOpen: true,
      title: 'Test Title',
      message: 'Test Message',
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
    };
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders correctly when isOpen is true', () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<ConfirmModal {...defaultProps} isOpen={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders custom confirm and cancel text', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmText="Yes, Proceed"
        cancelText="No, Go Back"
      />
    );

    expect(screen.getByText('Yes, Proceed')).toBeInTheDocument();
    expect(screen.getByText('No, Go Back')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when close icon button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);

    const closeButtons = screen.getAllByRole('button');
    const iconButton = closeButtons.find(btn =>
      !btn.textContent.includes('Confirm') && !btn.textContent.includes('Cancel')
    );

    fireEvent.click(iconButton);
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when clicking on the backdrop', () => {
    const { container } = render(<ConfirmModal {...defaultProps} />);

    const backdrop = container.firstChild;
    fireEvent.click(backdrop);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onCancel when clicking on the modal content', () => {
    render(<ConfirmModal {...defaultProps} />);

    const modalContent = screen.getByText('Test Title').closest('div');

    fireEvent.click(modalContent);

    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it('applies destructive styling when isDestructive is true', () => {
    render(<ConfirmModal {...defaultProps} isDestructive={true} />);

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton.className).toContain('bg-red-600');
    expect(confirmButton.className).not.toContain('bg-blue-600');
  });

  it('applies standard styling when isDestructive is false', () => {
    render(<ConfirmModal {...defaultProps} isDestructive={false} />);

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton.className).toContain('bg-blue-600');
    expect(confirmButton.className).not.toContain('bg-red-600');
  });
});
