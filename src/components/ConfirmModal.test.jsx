/**
 * @vitest-environment jsdom
 */
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';
import ConfirmModal from './ConfirmModal';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

describe('ConfirmModal', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConfirmModal isOpen={false} title="Test Title" message="Test Message" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
      />
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('renders custom confirm and cancel text', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Title"
        message="Message"
        confirmText="Yes, do it"
        cancelText="No, go back"
      />
    );

    expect(screen.getByRole('button', { name: 'Yes, do it' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No, go back' })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirmMock = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        title="Title"
        message="Message"
        onConfirm={onConfirmMock}
      />
    );

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    await userEvent.click(confirmButton);

    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancelMock = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        title="Title"
        message="Message"
        onCancel={onCancelMock}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the background overlay is clicked', async () => {
    const onCancelMock = vi.fn();
    const { container } = render(
      <ConfirmModal
        isOpen={true}
        title="Title"
        message="Message"
        onCancel={onCancelMock}
      />
    );

    // The overlay is the first div
    const overlay = container.firstChild;
    await userEvent.click(overlay);

    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onCancel when the modal content is clicked', async () => {
    const onCancelMock = vi.fn();
    const { container } = render(
      <ConfirmModal
        isOpen={true}
        title="Title"
        message="Message"
        onCancel={onCancelMock}
      />
    );

    // The modal content is the inner div
    const modalContent = container.firstChild.firstChild;
    await userEvent.click(modalContent);

    expect(onCancelMock).not.toHaveBeenCalled();
  });

  it('applies destructive styling when isDestructive is true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Title"
        message="Message"
        isDestructive={true}
      />
    );

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmButton).toHaveClass('bg-red-600', 'hover:bg-red-700');
  });

  it('applies default styling when isDestructive is false', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Title"
        message="Message"
        isDestructive={false}
      />
    );

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700');
  });

  it('calls onCancel when close icon is clicked', async () => {
    const onCancelMock = vi.fn();
    const { container } = render(
      <ConfirmModal
        isOpen={true}
        title="Title"
        message="Message"
        onCancel={onCancelMock}
      />
    );

    // We have three buttons: Close icon, Cancel, Confirm.
    // The close icon button is the first one.
    const buttons = screen.getAllByRole('button');
    const closeIconButton = buttons[0];
    await userEvent.click(closeIconButton);

    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it('matches snapshot when rendered', () => {
    const { asFragment } = render(
      <ConfirmModal
        isOpen={true}
        title="Snapshot Title"
        message="Snapshot Message"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not crash when optional props are omitted', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Title"
        message="Message"
      />
    );
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
