import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import NDAGeneratorForm from '../components/NDAGeneratorForm';

// @vitest-environment jsdom

expect.extend(matchers);

describe('NDAGeneratorForm', () => {
  afterEach(() => {
    cleanup();
  });

  const mockFormData = {
    disclosing: '',
    receiving: '',
    industry: 'general',
    strictness: 'standard',
    type: 'unilateral',
    jurisdiction: 'Delaware',
    term: '3',
    isPaid: false,
    includeReturn: true,
    effectiveDate: '2023-10-27'
  };

  const mockSetFormData = vi.fn();
  const mockOnPurchase = vi.fn();
  const mockOnPreview = vi.fn();

  it('renders Effective Date field', () => {
    render(
      <NDAGeneratorForm
        formData={mockFormData}
        setFormData={mockSetFormData}
        onPurchase={mockOnPurchase}
        onPreview={mockOnPreview}
      />
    );
    expect(screen.getByLabelText(/Effective Date/i)).toBeInTheDocument();
  });

  it('calls setFormData when Effective Date changes', () => {
    render(
      <NDAGeneratorForm
        formData={mockFormData}
        setFormData={mockSetFormData}
        onPurchase={mockOnPurchase}
        onPreview={mockOnPreview}
      />
    );

    const dateInput = screen.getByLabelText(/Effective Date/i);
    fireEvent.change(dateInput, { target: { value: '2024-01-01' } });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it('renders Preview button', () => {
    render(
      <NDAGeneratorForm
        formData={mockFormData}
        setFormData={mockSetFormData}
        onPurchase={mockOnPurchase}
        onPreview={mockOnPreview}
      />
    );
    expect(screen.getByRole('button', { name: /Preview Document/i })).toBeInTheDocument();
  });

  it('calls onPreview when Preview button is clicked', () => {
    // Fill required fields to enable buttons
    const validFormData = { ...mockFormData, disclosing: 'A', receiving: 'B' };

    render(
      <NDAGeneratorForm
        formData={validFormData}
        setFormData={mockSetFormData}
        onPurchase={mockOnPurchase}
        onPreview={mockOnPreview}
      />
    );

    const previewButton = screen.getByRole('button', { name: /Preview Document/i });
    expect(previewButton).not.toBeDisabled();
    fireEvent.click(previewButton);

    expect(mockOnPreview).toHaveBeenCalled();
  });
});
