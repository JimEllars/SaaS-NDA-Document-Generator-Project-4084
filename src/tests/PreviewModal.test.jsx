// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import PreviewModal from '../components/PreviewModal';

expect.extend(matchers);

// Mock child components to isolate tests
vi.mock('../components/DocumentPreview', () => ({
  default: ({ formData, documentData, isPreview }) => (
    <div data-testid="document-preview">
      Preview: {isPreview ? 'Yes' : 'No'} | Disclosing: {formData?.disclosing} | Title: {documentData?.title}
    </div>
  ),
}));

vi.mock('../common/SafeIcon', () => ({
  default: ({ icon, size }) => <span data-testid={`icon-${icon.name || 'unknown'}`} data-size={size}>Icon</span>,
}));

describe('PreviewModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onPurchase: vi.fn(),
    formData: { disclosing: 'Alice Corp', type: 'mutual' },
    documentData: { title: 'Mutual Non-Disclosure Agreement', intro: 'Intro text' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.print
    window.print = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<PreviewModal {...defaultProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the modal when isOpen is true', () => {
    render(<PreviewModal {...defaultProps} />);

    // Check header
    expect(screen.getByText('Document Preview')).toBeInTheDocument();

    // Check content
    const previewText = screen.getByTestId('document-preview');
    expect(previewText).toHaveTextContent('Preview: Yes | Disclosing: Alice Corp | Title: Mutual Non-Disclosure Agreement');

    // Check footer message
    expect(screen.getByText('This is a preview. Purchase to remove watermark and download.')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const { container } = render(<PreviewModal {...defaultProps} />);

    // The backdrop is the outermost div of the component
    const backdrop = container.firstChild;
    fireEvent.click(backdrop);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', () => {
    render(<PreviewModal {...defaultProps} />);

    // The modal content is the div inside the backdrop with white bg
    const modalContent = screen.getByText('Document Preview').closest('div.bg-white');
    fireEvent.click(modalContent);

    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the close icon in header is clicked', () => {
    render(<PreviewModal {...defaultProps} />);

    const closeButtons = screen.getAllByRole('button');
    // closeButtons[0] is header close icon
    fireEvent.click(closeButtons[0]);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the Close button in footer is clicked', () => {
    render(<PreviewModal {...defaultProps} />);

    const closeBtn = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls window.print when Print button is clicked', () => {
    render(<PreviewModal {...defaultProps} />);

    const printBtn = screen.getByRole('button', { name: /Print/i });
    fireEvent.click(printBtn);

    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it('calls onClose and onPurchase when Purchase Now button is clicked', () => {
    render(<PreviewModal {...defaultProps} />);

    // Find the purchase button by role and text
    const purchaseBtn = screen.getByRole('button', { name: /Purchase Now/i });

    fireEvent.click(purchaseBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onPurchase).toHaveBeenCalledTimes(1);
  });
});
