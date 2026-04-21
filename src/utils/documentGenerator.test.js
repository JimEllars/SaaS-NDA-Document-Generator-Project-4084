import { describe, it, expect } from 'vitest';
import { generateDocumentData, generatePlainText, generateDocument } from './documentGenerator';
import { getDefaultFormData } from '../data/ndaData';

const baseFormData = {
  ...getDefaultFormData(),
  isPaid: true,
  disclosing: 'Company A',
  receiving: 'Company B',
  effectiveDate: '2023-10-27',
  includeReturn: false,
};

describe('generateDocumentData', () => {
  it('should return null if not paid', () => {
    const data = generateDocumentData({ ...baseFormData, isPaid: false });
    expect(data).toBeNull();
  });

  it('should generate unilateral title correctly', () => {
    const data = generateDocumentData(baseFormData);
    expect(data.title).toBe('Unilateral Non-Disclosure Agreement');
  });

  it('should generate mutual title correctly', () => {
    const data = generateDocumentData({ ...baseFormData, type: 'mutual' });
    expect(data.title).toBe('Mutual Non-Disclosure Agreement');
  });

  it('should include robust clauses when strictness is robust', () => {
    const data = generateDocumentData({ ...baseFormData, strictness: 'robust' });
    const definitionSection = data.sections.find(s => s.title.includes('Definition of Confidential Information'));
    // Content is now objects
    expect(definitionSection.content.length).toBe(2);
    // Check first item is paragraph (definition)
    expect(definitionSection.content[0].type).toBe('paragraph');
    // Check second item is clause (robust definition)
    expect(definitionSection.content[1].type).toBe('clause');
    expect(definitionSection.content[1].title).toBeDefined();

    const enforcementSection = data.sections.find(s => s.title.includes('Enforcement and Remedies'));
    expect(enforcementSection).toBeDefined();
    expect(enforcementSection.title).toContain('Enforcement and Remedies');
  });

  it('should not include robust clauses when strictness is standard', () => {
    const data = generateDocumentData({ ...baseFormData, strictness: 'standard' });
    const definitionSection = data.sections.find(s => s.title.includes('Definition of Confidential Information'));
    expect(definitionSection.content.length).toBe(1); // Definition only
    expect(definitionSection.content[0].type).toBe('paragraph');

    const enforcement = data.sections.find(s => s.title.includes('Enforcement'));
    expect(enforcement).toBeUndefined();
  });

  it('should include industry specific clauses for tech', () => {
    const data = generateDocumentData({ ...baseFormData, industry: 'tech' });
    const industrySection = data.sections.find(s => s.title.includes('Technology & Software Specific Provisions'));
    expect(industrySection).toBeDefined();
    expect(industrySection.content.length).toBeGreaterThan(0);
    // Tech clauses are typically 'clause' type
    expect(industrySection.content[0].type).toBe('clause');
    expect(industrySection.content[0].number).toBe(1);
  });

  it('should include return clause when includeReturn is true', () => {
    const data = generateDocumentData({ ...baseFormData, includeReturn: true });
    const exclusionsSection = data.sections.find(s => s.title.includes('Permitted Use and Exclusions'));
    // Exclusions + Term + Return
    expect(exclusionsSection.content.length).toBe(3);
    // Return clause is paragraph
    expect(exclusionsSection.content[2].type).toBe('paragraph');
    expect(exclusionsSection.content[2].text).toContain('return or destroy');
  });

  it('should format date correctly', () => {
    const data = generateDocumentData(baseFormData);
    expect(data.effectiveDate).not.toBe('Invalid Date');
    expect(typeof data.effectiveDate).toBe('string');
  });

  it('should format date consistently', () => {
      const data = generateDocumentData({ ...baseFormData, effectiveDate: '2023-10-27' });
      expect(data.effectiveDate).toBe('October 27, 2023');
  });

  it('should throw an error if an invalid industry is provided', () => {
    expect(() => {
      generateDocumentData({ ...baseFormData, industry: 'invalid-industry' });
    }).toThrow(TypeError);
  });
});

describe('generatePlainText', () => {
    it('should generate text containing key sections', () => {
        const docData = generateDocumentData(baseFormData);
        const text = generatePlainText(docData, baseFormData);

        expect(text).toContain('Unilateral Non-Disclosure Agreement');
        expect(text).toContain('ARTICLE 1: DEFINITION OF CONFIDENTIAL INFORMATION');
        expect(text).toContain('Company A');
        expect(text).toContain('Company B');
        expect(text).toContain('EXECUTION');
    });

    it('should include correct signature block labels for unilateral', () => {
        const docData = generateDocumentData(baseFormData);
        const text = generatePlainText(docData, baseFormData);
        expect(text).toContain('DISCLOSING PARTY: Company A');
        expect(text).toContain('RECEIVING PARTY: Company B');
    });

    it('should include correct signature block labels for mutual', () => {
        const formData = { ...baseFormData, type: 'mutual' };
        const docData = generateDocumentData(formData);
        const text = generatePlainText(docData, formData);
        expect(text).toContain('PARTY 1: Company A');
        expect(text).toContain('PARTY 2: Company B');
    });

    it('should return empty string if documentData is falsy', () => {
        expect(generatePlainText(null, baseFormData)).toBe('');
        expect(generatePlainText(undefined, baseFormData)).toBe('');
    });

    it('should generate exactly constructed text with paragraphs and clauses', () => {
        const mockDocData = {
          title: 'Test Title',
          effectiveDate: 'October 27, 2023',
          intro: 'Test Intro.',
          sections: [
            {
              title: 'Test Section',
              content: [
                { type: 'paragraph', text: 'Test paragraph.' },
                { type: 'clause', number: 1, title: 'Test Clause', text: 'Clause text.' }
              ]
            }
          ]
        };

        const mockFormData = {
          type: 'unilateral',
          disclosing: 'Party A',
          receiving: 'Party B'
        };

        const result = generatePlainText(mockDocData, mockFormData);

        const expectedResult = `Test Title
Effective Date: October 27, 2023

RECITALS
Test Intro.

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:

TEST SECTION

Test paragraph.

1. Test Clause
Clause text.

EXECUTION

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

DISCLOSING PARTY: Party A
Print Name: _________________________
Title: _______________________________
Date: _______________________________

RECEIVING PARTY: Party B
Print Name: _________________________
Title: _______________________________
Date: _______________________________
`;
        expect(result).toBe(expectedResult);
    });

    it('should generate execution parts with fallback party names if missing in form data', () => {
        const mockDocData = {
          title: 'Test',
          effectiveDate: 'October 27, 2023',
          intro: 'Intro',
          sections: []
        };
        const mockFormData = { type: 'unilateral' };

        const result = generatePlainText(mockDocData, mockFormData);
        expect(result).toContain('DISCLOSING PARTY: [Party Name]\n');
        expect(result).toContain('RECEIVING PARTY: [Party Name]\n');
    });
});
