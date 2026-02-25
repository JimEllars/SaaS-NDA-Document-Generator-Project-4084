import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import NDAGeneratorForm from '../components/NDAGeneratorForm';
import { getDefaultFormData } from '../data/ndaData';

// @vitest-environment jsdom

expect.extend(matchers);

describe('NDAGeneratorForm', () => {
  afterEach(() => {
    cleanup();
  });

  const mockFormData = {
    ...getDefaultFormData(),
    effectiveDate: '2023-10-27'
  };

  const mockSetFormData = vi.fn();
  const mockOnPurchase = vi.fn();

  it('renders Effective Date field', () => {
    render(
      <NDAGeneratorForm
        formData={mockFormData}
        setFormData={mockSetFormData}
        onPurchase={mockOnPurchase}
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
      />
    );

    const dateInput = screen.getByLabelText(/Effective Date/i);
    fireEvent.change(dateInput, { target: { value: '2024-01-01' } });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it('disables purchase button if date is invalid', () => {
    const invalidFormData = { ...mockFormData, disclosing: 'Alice Corp', receiving: 'Bob Inc', effectiveDate: 'invalid-date' };
    render(
      <NDAGeneratorForm
        formData={invalidFormData}
        setFormData={mockSetFormData}
        onPurchase={mockOnPurchase}
      />
    );

    // Check that button is disabled
    const purchaseButton = screen.getByRole('button', { name: /Complete Form/i });
    expect(purchaseButton).toBeDisabled();

    // Check for validation message
    expect(screen.getByText(/Please enter a valid effective date/i)).toBeInTheDocument();
  });
});
