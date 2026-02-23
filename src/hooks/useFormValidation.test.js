// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import useFormValidation from './useFormValidation';

describe('useFormValidation', () => {
  it('should return false if names are too short', () => {
    const formData = {
      disclosing: 'A',
      receiving: 'B',
      effectiveDate: '2023-10-27'
    };
    const { result } = renderHook(() => useFormValidation(formData));
    expect(result.current.isValid).toBe(false);
    expect(result.current.validationMessage).toMatch(/min 2 characters/);
  });

  it('should return false if date is invalid', () => {
    const formData = {
      disclosing: 'Alice',
      receiving: 'Bob',
      effectiveDate: 'invalid-date'
    };
    const { result } = renderHook(() => useFormValidation(formData));
    expect(result.current.isValid).toBe(false);
    expect(result.current.validationMessage).toMatch(/valid effective date/);
  });

  it('should return true if form is valid', () => {
    const formData = {
      disclosing: 'Alice',
      receiving: 'Bob',
      effectiveDate: '2023-10-27'
    };
    const { result } = renderHook(() => useFormValidation(formData));
    expect(result.current.isValid).toBe(true);
    expect(result.current.validationMessage).toBe('');
  });
});
