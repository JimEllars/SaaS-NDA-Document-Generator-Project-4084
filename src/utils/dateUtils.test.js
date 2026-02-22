import { describe, it, expect } from 'vitest';
import { formatEffectiveDate } from './dateUtils';

describe('formatEffectiveDate', () => {
  it('formats YYYY-MM-DD correctly', () => {
    expect(formatEffectiveDate('2023-01-01')).toBe('January 1, 2023');
    expect(formatEffectiveDate('2023-12-31')).toBe('December 31, 2023');
  });

  it('handles single digit month/day if padded', () => {
    expect(formatEffectiveDate('2023-05-05')).toBe('May 5, 2023');
  });

  it('returns current date if input is invalid or empty', () => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    expect(formatEffectiveDate('')).toBe(today);
    expect(formatEffectiveDate(null)).toBe(today);
    // Note: The function handles format errors by fallback
  });
});
