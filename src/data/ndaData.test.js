import { describe, it, expect, vi } from 'vitest';
import { CLAUSES, getDefaultFormData } from './ndaData';

describe('NDA Data Generation', () => {
  describe('CLAUSES.general.intro', () => {
    it('should generate correct intro for unilateral NDA', () => {
      vi.useFakeTimers();
      const mockDate = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(mockDate);

      const intro = CLAUSES.general.intro('Company A', 'Company B', 'unilateral');
      expect(intro).toBe(`This Unilateral Non-Disclosure Agreement (the "Agreement") is entered into as of ${mockDate.toLocaleDateString()} (the "Effective Date") by and between Company A ("Disclosing Party") and Company B ("Receiving Party").`);

      vi.useRealTimers();
    });

    it('should generate correct intro for mutual NDA', () => {
      vi.useFakeTimers();
      const mockDate = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(mockDate);

      const intro = CLAUSES.general.intro('Company A', 'Company B', 'mutual');
      expect(intro).toBe(`This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of ${mockDate.toLocaleDateString()} (the "Effective Date") by and between Company A  and Company B , collectively referred to as the "Parties" and individually as a "Party".`);

      vi.useRealTimers();
    });

    it('should handle missing party names', () => {
        vi.useFakeTimers();
        const mockDate = new Date('2024-01-01T12:00:00Z');
        vi.setSystemTime(mockDate);

        const intro = CLAUSES.general.intro('', '', 'unilateral');
        expect(intro).toBe(`This Unilateral Non-Disclosure Agreement (the "Agreement") is entered into as of ${mockDate.toLocaleDateString()} (the "Effective Date") by and between [Disclosing Party] ("Disclosing Party") and [Receiving Party] ("Receiving Party").`);

        vi.useRealTimers();
    });

    it('should handle missing disclosing party only', () => {
        vi.useFakeTimers();
        const mockDate = new Date('2024-01-01T12:00:00Z');
        vi.setSystemTime(mockDate);

        const intro = CLAUSES.general.intro('', 'Company B', 'unilateral');
        expect(intro).toBe(`This Unilateral Non-Disclosure Agreement (the "Agreement") is entered into as of ${mockDate.toLocaleDateString()} (the "Effective Date") by and between [Disclosing Party] ("Disclosing Party") and Company B ("Receiving Party").`);

        vi.useRealTimers();
    });

    it('should handle missing receiving party only', () => {
        vi.useFakeTimers();
        const mockDate = new Date('2024-01-01T12:00:00Z');
        vi.setSystemTime(mockDate);

        const intro = CLAUSES.general.intro('Company A', '', 'unilateral');
        expect(intro).toBe(`This Unilateral Non-Disclosure Agreement (the "Agreement") is entered into as of ${mockDate.toLocaleDateString()} (the "Effective Date") by and between Company A ("Disclosing Party") and [Receiving Party] ("Receiving Party").`);

        vi.useRealTimers();
    });

    it('should handle unexpected type parameter as unilateral', () => {
        vi.useFakeTimers();
        const mockDate = new Date('2024-01-01T12:00:00Z');
        vi.setSystemTime(mockDate);

        const intro = CLAUSES.general.intro('Company A', 'Company B', 'invalid-type');
        expect(intro).toBe(`This Unilateral Non-Disclosure Agreement (the "Agreement") is entered into as of ${mockDate.toLocaleDateString()} (the "Effective Date") by and between Company A ("Disclosing Party") and Company B ("Receiving Party").`);

        vi.useRealTimers();
    });

    it('should handle empty effectiveDate string as falsy and use current date', () => {
        vi.useFakeTimers();
        const mockDate = new Date('2024-01-01T12:00:00Z');
        vi.setSystemTime(mockDate);

        const intro = CLAUSES.general.intro('Company A', 'Company B', 'unilateral', '');
        expect(intro).toBe(`This Unilateral Non-Disclosure Agreement (the "Agreement") is entered into as of ${mockDate.toLocaleDateString()} (the "Effective Date") by and between Company A ("Disclosing Party") and Company B ("Receiving Party").`);

        vi.useRealTimers();
    });

    it('should handle missing type parameter (defaults to unilateral)', () => {
      vi.useFakeTimers();
      const mockDate = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(mockDate);

      const intro = CLAUSES.general.intro('Company A', 'Company B');
      expect(intro).toBe(`This Unilateral Non-Disclosure Agreement (the "Agreement") is entered into as of ${mockDate.toLocaleDateString()} (the "Effective Date") by and between Company A ("Disclosing Party") and Company B ("Receiving Party").`);

      vi.useRealTimers();
    });

    it('should handle all missing parameters', () => {
      vi.useFakeTimers();
      const mockDate = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(mockDate);

      const intro = CLAUSES.general.intro();
      expect(intro).toBe(`This Unilateral Non-Disclosure Agreement (the "Agreement") is entered into as of ${mockDate.toLocaleDateString()} (the "Effective Date") by and between [Disclosing Party] ("Disclosing Party") and [Receiving Party] ("Receiving Party").`);

      vi.useRealTimers();
    });

    it('should handle undefined and null parameters', () => {
      vi.useFakeTimers();
      const mockDate = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(mockDate);

      const intro = CLAUSES.general.intro(null, undefined, null, undefined);
      expect(intro).toBe(`This Unilateral Non-Disclosure Agreement (the "Agreement") is entered into as of ${mockDate.toLocaleDateString()} (the "Effective Date") by and between [Disclosing Party] ("Disclosing Party") and [Receiving Party] ("Receiving Party").`);

      vi.useRealTimers();
    });

    it('should use provided effectiveDate', () => {
        const testDate = 'December 31, 2023';
        const intro = CLAUSES.general.intro('Company A', 'Company B', 'unilateral', testDate);
        expect(intro).toBe(`This Unilateral Non-Disclosure Agreement (the "Agreement") is entered into as of ${testDate} (the "Effective Date") by and between Company A ("Disclosing Party") and Company B ("Receiving Party").`);
    });

    it('should default to current date when effectiveDate is not provided', () => {
        vi.useFakeTimers();
        const mockDate = new Date('2024-01-01T12:00:00Z');
        vi.setSystemTime(mockDate);

        const intro = CLAUSES.general.intro('Company A', 'Company B', 'unilateral');
        expect(intro).toBe(`This Unilateral Non-Disclosure Agreement (the "Agreement") is entered into as of ${mockDate.toLocaleDateString()} (the "Effective Date") by and between Company A ("Disclosing Party") and Company B ("Receiving Party").`);

        vi.useRealTimers();
    });
  });

  describe('CLAUSES.general.term', () => {
    it('should use default term if not provided', () => {
      const term = CLAUSES.general.term();
      expect(term).toContain('3 years');
    });

    it('should use provided term', () => {
      const term = CLAUSES.general.term(5);
      expect(term).toContain('5 years');
    });
  });

  describe('Industry Specific Clauses', () => {
      it('should have tech clauses', () => {
          expect(CLAUSES.tech.label).toBe('Technology & Software');
          expect(CLAUSES.tech.clauses.length).toBeGreaterThan(0);
      });

      it('should have creative clauses', () => {
        expect(CLAUSES.creative.label).toBe('Creative & Design');
        expect(CLAUSES.creative.clauses.length).toBeGreaterThan(0);
      });
  });

  describe('Robust Clauses', () => {
    it('should have separate definition and enforcement clauses', () => {
      expect(CLAUSES.robust.definition).toBeDefined();
      expect(CLAUSES.robust.definition.title).toContain('Broad Interpretation');
      expect(CLAUSES.robust.enforcement).toBeDefined();
      expect(Array.isArray(CLAUSES.robust.enforcement)).toBe(true);
      expect(CLAUSES.robust.enforcement.length).toBeGreaterThan(0);
      expect(CLAUSES.robust.enforcement[0].title).toBeDefined();
    });
  });
});

describe('getDefaultFormData', () => {
  it('should return the correct default form data', () => {
    const formData = getDefaultFormData();
    expect(formData).toEqual({
      disclosing: '',
      receiving: '',
      industry: 'general',
      strictness: 'standard',
      type: 'unilateral',
      jurisdiction: 'Delaware',
      term: '3',
      includeReturn: true,
      effectiveDate: new Date().toISOString().split('T')[0]
    });
  });
});
