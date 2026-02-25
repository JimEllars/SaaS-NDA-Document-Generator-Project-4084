import { describe, it, expect } from 'vitest';
import { generateDocument, generatePlainText } from './documentGenerator';
import { getDefaultFormData } from '../data/ndaData';

const baseFormData = {
  ...getDefaultFormData(),
  isPaid: true,
  disclosing: 'Company A',
  receiving: 'Company B',
  effectiveDate: '2023-10-27',
  includeReturn: false,
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
    const article1 = data.sections.find(s => s.title.includes('Article 1'));
    // Content is now objects
    expect(article1.content.length).toBe(2);
    // Check first item is paragraph (definition)
    expect(article1.content[0].type).toBe('paragraph');
    // Check second item is clause (robust definition)
    expect(article1.content[1].type).toBe('clause');
    expect(article1.content[1].title).toBeDefined();

    const article4 = data.sections.find(s => s.title.includes('Article 4'));
    expect(article4).toBeDefined();
    expect(article4.title).toContain('Enforcement and Remedies');
  });

  it('should not include robust clauses when strictness is standard', () => {
    const data = generateDocument({ ...baseFormData, strictness: 'standard' });
    const article1 = data.sections.find(s => s.title.includes('Article 1'));
    expect(article1.content.length).toBe(1); // Definition only
    expect(article1.content[0].type).toBe('paragraph');

    const enforcement = data.sections.find(s => s.title.includes('Enforcement'));
    expect(enforcement).toBeUndefined();
  });

  it('should include industry specific clauses for tech', () => {
    const data = generateDocument({ ...baseFormData, industry: 'tech' });
    const article2 = data.sections.find(s => s.title.includes('Article 2'));
    expect(article2.title).toContain('Technology & Software Specific Provisions');
    expect(article2.content.length).toBeGreaterThan(0);
    // Tech clauses are typically 'clause' type
    expect(article2.content[0].type).toBe('clause');
    expect(article2.content[0].number).toBe(1);
  });

  it('should include return clause when includeReturn is true', () => {
    const data = generateDocument({ ...baseFormData, includeReturn: true });
    const article3 = data.sections.find(s => s.title.includes('Article 3'));
    // Exclusions + Term + Return
    expect(article3.content.length).toBe(3);
    // Return clause is paragraph
    expect(article3.content[2].type).toBe('paragraph');
    expect(article3.content[2].text).toContain('return or destroy');
  });

  it('should format date correctly', () => {
    const data = generateDocument(baseFormData);
    expect(data.effectiveDate).not.toBe('Invalid Date');
    expect(typeof data.effectiveDate).toBe('string');
  });

  it('should format date consistently', () => {
      const data = generateDocument({ ...baseFormData, effectiveDate: '2023-10-27' });
      expect(data.effectiveDate).toBe('October 27, 2023');
  });
});

describe('generatePlainText', () => {
    it('should generate text containing key sections', () => {
        const docData = generateDocument(baseFormData);
        const text = generatePlainText(docData, baseFormData);

        expect(text).toContain('Unilateral Non-Disclosure Agreement');
        expect(text).toContain('ARTICLE 1: DEFINITION OF CONFIDENTIAL INFORMATION');
        expect(text).toContain('Company A');
        expect(text).toContain('Company B');
        expect(text).toContain('EXECUTION');
    });

    it('should include correct signature block labels for unilateral', () => {
        const docData = generateDocument(baseFormData);
        const text = generatePlainText(docData, baseFormData);
        expect(text).toContain('DISCLOSING PARTY: Company A');
        expect(text).toContain('RECEIVING PARTY: Company B');
    });

    it('should include correct signature block labels for mutual', () => {
        const formData = { ...baseFormData, type: 'mutual' };
        const docData = generateDocument(formData);
        const text = generatePlainText(docData, formData);
        expect(text).toContain('PARTY 1: Company A');
        expect(text).toContain('PARTY 2: Company B');
    });
});
