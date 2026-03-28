/** @vitest-environment jsdom */
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

import NDAGeneratorForm from './NDAGeneratorForm';
import { getDefaultFormData } from '../data/ndaData';

describe('NDAGeneratorForm', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const defaultProps = {
    formData: getDefaultFormData(),
    setFormData: vi.fn(),
    onPurchase: vi.fn(),
    isEditing: false,
    onUpdate: vi.fn(),
  };

  it('renders correctly with default props', () => {
    render(<NDAGeneratorForm {...defaultProps} />);
    expect(screen.getByText('Agreement Details')).toBeInTheDocument();
    expect(screen.getByText('Unilateral NDA')).toBeInTheDocument();
    expect(screen.getByText('Mutual NDA')).toBeInTheDocument();
    expect(screen.getByLabelText(/Disclosing Party/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Receiving Party/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Effective Date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Industry Sector/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Governing Law/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Protection Level/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confidentiality Term/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Include document return clause/)).toBeInTheDocument();
  });

  it('handles text input changes correctly', () => {
    const mockSetFormData = vi.fn();
    render(<NDAGeneratorForm {...defaultProps} setFormData={mockSetFormData} />);

    const disclosingInput = screen.getByLabelText(/Disclosing Party/);
    fireEvent.change(disclosingInput, { target: { value: 'Acme Corp', name: 'disclosing' } });

    expect(mockSetFormData).toHaveBeenCalledTimes(1);

    // Test the state updater function passed to setFormData
    const updaterFn = mockSetFormData.mock.calls[0][0];
    const prevState = defaultProps.formData;
    const nextState = updaterFn(prevState);

    expect(nextState.disclosing).toBe('Acme Corp');
  });

  it('handles toggle button changes correctly', () => {
    const mockSetFormData = vi.fn();
    render(<NDAGeneratorForm {...defaultProps} setFormData={mockSetFormData} />);

    const mutualButton = screen.getByRole('radio', { name: /Mutual NDA/i });
    fireEvent.click(mutualButton);

    expect(mockSetFormData).toHaveBeenCalledTimes(1);

    const updaterFn = mockSetFormData.mock.calls[0][0];
    const prevState = defaultProps.formData;
    const nextState = updaterFn(prevState);

    expect(nextState.type).toBe('mutual');
  });

  it('handles select changes correctly', () => {
    const mockSetFormData = vi.fn();
    render(<NDAGeneratorForm {...defaultProps} setFormData={mockSetFormData} />);

    const industrySelect = screen.getByLabelText(/Industry Sector/);
    fireEvent.change(industrySelect, { target: { value: 'tech', name: 'industry' } });

    expect(mockSetFormData).toHaveBeenCalledTimes(1);

    const updaterFn = mockSetFormData.mock.calls[0][0];
    const prevState = defaultProps.formData;
    const nextState = updaterFn(prevState);

    expect(nextState.industry).toBe('tech');
  });

  it('handles checkbox changes correctly', () => {
    const mockSetFormData = vi.fn();
    render(<NDAGeneratorForm {...defaultProps} setFormData={mockSetFormData} />);

    const checkbox = screen.getByLabelText(/Include document return clause/);
    fireEvent.click(checkbox);

    expect(mockSetFormData).toHaveBeenCalledTimes(1);

    const updaterFn = mockSetFormData.mock.calls[0][0];
    const prevState = defaultProps.formData;
    const nextState = updaterFn(prevState);

    expect(nextState.includeReturn).toBe(false);
  });

  it('validates the form correctly', () => {
    render(<NDAGeneratorForm {...defaultProps} />);

    // Default form is invalid due to missing disclosing/receiving parties
    expect(screen.getByText(/Please enter a valid Disclosing Party name/i)).toBeInTheDocument();

    const purchaseButton = screen.getByRole('button', { name: /Complete Form/i });
    expect(purchaseButton).toBeDisabled();
    expect(purchaseButton).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('enables the submit button when valid', () => {
    const validFormData = {
      ...defaultProps.formData,
      disclosing: 'Acme Corp',
      receiving: 'Globex Inc',
      effectiveDate: '2023-01-01'
    };

    render(<NDAGeneratorForm {...defaultProps} formData={validFormData} />);

    const purchaseButton = screen.getByRole('button', { name: /Purchase & Generate/i });
    expect(purchaseButton).not.toBeDisabled();
    expect(purchaseButton).not.toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('calls onPurchase when clicking submit on a valid form', () => {
    const validFormData = {
      ...defaultProps.formData,
      disclosing: 'Acme Corp',
      receiving: 'Globex Inc',
      effectiveDate: '2023-01-01'
    };

    const mockOnPurchase = vi.fn();

    render(<NDAGeneratorForm {...defaultProps} formData={validFormData} onPurchase={mockOnPurchase} />);

    const purchaseButton = screen.getByRole('button', { name: /Purchase & Generate/i });
    fireEvent.click(purchaseButton);

    expect(mockOnPurchase).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onUpdate when in editing mode', () => {
    const validFormData = {
      ...defaultProps.formData,
      disclosing: 'Acme Corp',
      receiving: 'Globex Inc',
      effectiveDate: '2023-01-01'
    };

    const mockOnUpdate = vi.fn();

    render(<NDAGeneratorForm {...defaultProps} formData={validFormData} isEditing={true} onUpdate={mockOnUpdate} />);

    const updateButton = screen.getByRole('button', { name: /Update Document/i });
    expect(updateButton).not.toBeDisabled();

    fireEvent.click(updateButton);
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);

    // Verify pricing info is hidden in editing mode
    expect(screen.queryByText(/Generate Professional PDF/)).not.toBeInTheDocument();
    expect(screen.queryByText('$12.99')).not.toBeInTheDocument();
  });
  it('handles unilateral toggle button changes correctly', () => {
    const mockSetFormData = vi.fn();
    const mutualData = { ...defaultProps.formData, type: 'mutual' };
    render(<NDAGeneratorForm {...defaultProps} formData={mutualData} setFormData={mockSetFormData} />);

    const unilateralButton = screen.getByRole('radio', { name: /Unilateral NDA/i });
    fireEvent.click(unilateralButton);

    expect(mockSetFormData).toHaveBeenCalledTimes(1);

    const updaterFn = mockSetFormData.mock.calls[0][0];
    const prevState = mutualData;
    const nextState = updaterFn(prevState);

    expect(nextState.type).toBe('unilateral');
  });
  it('renders effective date as empty string if not provided', () => {
    const dataWithoutDate = { ...defaultProps.formData, effectiveDate: null };
    render(<NDAGeneratorForm {...defaultProps} formData={dataWithoutDate} />);

    const dateInput = screen.getByLabelText(/Effective Date/);
    expect(dateInput.value).toBe('');
  });
});
