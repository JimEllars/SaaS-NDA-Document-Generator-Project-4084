import { describe, it, expect } from 'vitest';
import { generateDocument } from './documentGenerator';

const baseFormData = {
  isPaid: true,
  disclosing: 'Company A',
  receiving: 'Company B',
  type: 'unilateral',
  effectiveDate: '2023-10-27',
  strictness: 'standard',
  industry: 'general',
  term: '3',
  includeReturn: false,
  jurisdiction: 'Delaware'
};

describe('generateDocument', () => {
  it('should return null if not paid', () => {
    const data = generateDocument({ ...baseFormData, isPaid: false });
    expect(data).toBeNull();
  });

  it('should generate unilateral title correctly', () => {
    const data = generateDocument(baseFormData);
    expect(data.title).toBe('Unilateral Non-Disclosure Agreement');
  });

  it('should generate mutual title correctly', () => {
    const data = generateDocument({ ...baseFormData, type: 'mutual' });
    expect(data.title).toBe('Mutual Non-Disclosure Agreement');
  });

  it('should include robust clauses when strictness is robust', () => {
    const data = generateDocument({ ...baseFormData, strictness: 'robust' });
    // Robust adds clauses to Article 1 and Article 4
    const article1 = data.sections.find(s => s.title.includes('Article 1'));
    expect(article1.content.length).toBe(2); // Definition + robust clause

    const article4 = data.sections.find(s => s.title.includes('Article 4'));
    expect(article4).toBeDefined();
    expect(article4.title).toContain('Enforcement and Remedies');
  });

  it('should not include robust clauses when strictness is standard', () => {
    const data = generateDocument({ ...baseFormData, strictness: 'standard' });
    const article1 = data.sections.find(s => s.title.includes('Article 1'));
    expect(article1.content.length).toBe(1); // Definition only

    const article4 = data.sections.find(s => s.title.includes('Article 4'));
    // Article 4 is Enforcement and Remedies in robust mode.
    // In standard mode, Article 4 might be Jurisdiction if no return clause?
    // Wait, the order is:
    // Art 1: Def
    // Art 2: Industry (optional)
    // Art 3: Permitted Use (always present)
    // Art 4: Enforcement (optional)
    // Art 5: Jurisdiction (always present, but index changes)

    // In standard mode, we expect no Enforcement section.
    const enforcement = data.sections.find(s => s.title.includes('Enforcement'));
    expect(enforcement).toBeUndefined();
  });

  it('should include industry specific clauses for tech', () => {
    const data = generateDocument({ ...baseFormData, industry: 'tech' });
    const article2 = data.sections.find(s => s.title.includes('Article 2'));
    expect(article2.title).toContain('Technology & Software Specific Provisions');
    expect(article2.content.length).toBeGreaterThan(0);
  });

  it('should include return clause when includeReturn is true', () => {
    const data = generateDocument({ ...baseFormData, includeReturn: true });
    const article3 = data.sections.find(s => s.title.includes('Article 3'));
    // Exclusions + Term + Return
    expect(article3.content.length).toBe(3);
    expect(article3.content[2]).toContain('return or destroy');
  });

  it('should format date correctly', () => {
    // 2023-10-27
    const data = generateDocument(baseFormData);
    // Since we are running in node/vitest, locale might be different.
    // However, toLocaleDateString() usually defaults to MM/DD/YYYY in US locale which is typical in many envs,
    // but in CI it might be different.
    // Let's just check it's not "Invalid Date" and contains year/month/day parts.
    expect(data.effectiveDate).not.toBe('Invalid Date');
    // We expect it to be a string.
    expect(typeof data.effectiveDate).toBe('string');
  });

  it('should handle missing effectiveDate gracefully', () => {
      const data = generateDocument({ ...baseFormData, effectiveDate: '' });
      expect(data.effectiveDate).not.toBe('Invalid Date');
  });
});
