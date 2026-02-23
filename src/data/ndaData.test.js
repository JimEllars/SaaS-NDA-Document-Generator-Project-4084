import { describe, it, expect } from 'vitest';
import { CLAUSES } from './ndaData';

describe('NDA Data Generation', () => {
  describe('CLAUSES.general.intro', () => {
    it('should generate correct intro for unilateral NDA', () => {
      const intro = CLAUSES.general.intro('Company A', 'Company B', 'unilateral');
      expect(intro).toContain('Unilateral Non-Disclosure Agreement');
      expect(intro).toContain('Company A');
      expect(intro).toContain('("Disclosing Party")');
      expect(intro).toContain('Company B');
      expect(intro).toContain('("Receiving Party")');
      expect(intro).not.toContain('collectively referred to as the "Parties"');
    });

    it('should generate correct intro for mutual NDA', () => {
      const intro = CLAUSES.general.intro('Company A', 'Company B', 'mutual');
      expect(intro).toContain('Mutual Non-Disclosure Agreement');
      expect(intro).toContain('Company A');
      expect(intro).not.toContain('("Disclosing Party")');
      expect(intro).toContain('collectively referred to as the "Parties"');
    });

    it('should handle missing party names', () => {
        const intro = CLAUSES.general.intro('', '', 'unilateral');
        expect(intro).toContain('[Disclosing Party]');
        expect(intro).toContain('[Receiving Party]');
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
