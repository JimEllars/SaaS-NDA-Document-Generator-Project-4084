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
    const data = generateDocument({ ...baseFormData, strictness: 'standard' });
    const definitionSection = data.sections.find(s => s.title.includes('Definition of Confidential Information'));
    expect(definitionSection.content.length).toBe(1); // Definition only
    expect(definitionSection.content[0].type).toBe('paragraph');

    const enforcement = data.sections.find(s => s.title.includes('Enforcement'));
    expect(enforcement).toBeUndefined();
  });

  it('should include industry specific clauses for tech', () => {
    const data = generateDocument({ ...baseFormData, industry: 'tech' });
    const industrySection = data.sections.find(s => s.title.includes('Technology & Software Specific Provisions'));
    expect(industrySection).toBeDefined();
    expect(industrySection.content.length).toBeGreaterThan(0);
    // Tech clauses are typically 'clause' type
    expect(industrySection.content[0].type).toBe('clause');
    expect(industrySection.content[0].number).toBe(1);
  });

  it('should include return clause when includeReturn is true', () => {
    const data = generateDocument({ ...baseFormData, includeReturn: true });
    const exclusionsSection = data.sections.find(s => s.title.includes('Permitted Use and Exclusions'));
    // Exclusions + Term + Return
    expect(exclusionsSection.content.length).toBe(3);
    // Return clause is paragraph
    expect(exclusionsSection.content[2].type).toBe('paragraph');
    expect(exclusionsSection.content[2].text).toContain('return or destroy');
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

  it('should throw an error if an invalid industry is provided', () => {
    expect(() => {
      generateDocument({ ...baseFormData, industry: 'invalid-industry' });
    }).toThrow(TypeError);
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

    it('should return an empty string if documentData is null', () => {
        expect(generatePlainText(null, baseFormData)).toBe('');
    });

    it('should use [Party Name] fallback when party names are missing', () => {
        const formData = { ...baseFormData, disclosing: '', receiving: '' };
        const docData = generateDocument(formData);
        const text = generatePlainText(docData, formData);
        expect(text).toContain('DISCLOSING PARTY: [Party Name]');
        expect(text).toContain('RECEIVING PARTY: [Party Name]');
    });

    it('should correctly format paragraph and clause items and uppercase section titles', () => {
        const docData = {
            title: 'Test NDA',
            effectiveDate: 'October 27, 2023',
            intro: 'Intro text',
            sections: [
                {
                    title: 'Article 1: Section 1',
                    content: [
                        { type: 'paragraph', text: 'Paragraph content' },
                        { type: 'clause', number: 1, title: 'Clause Title', text: 'Clause content' }
                    ]
                }
            ]
        };
        const text = generatePlainText(docData, baseFormData);
        expect(text).toContain('ARTICLE 1: SECTION 1');
        expect(text).toContain('Paragraph content');
        expect(text).toContain('1. Clause Title');
        expect(text).toContain('Clause content');
    });

    it('should generate an exact text match given mock data', () => {
        const docData = {
            title: 'Exact Test NDA',
            effectiveDate: 'October 27, 2023',
            intro: 'Exact Intro text',
            sections: [
                {
                    title: 'Article 1: Exact Section',
                    content: [
                        { type: 'paragraph', text: 'Exact Paragraph content' },
                        { type: 'clause', number: 1, title: 'Exact Clause Title', text: 'Exact Clause content' }
                    ]
                }
            ]
        };
        const formData = {
            type: 'unilateral',
            disclosing: 'Party A',
            receiving: 'Party B'
        };
        const text = generatePlainText(docData, formData);

        const expectedText = `Exact Test NDA
Effective Date: October 27, 2023

RECITALS
Exact Intro text

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:

ARTICLE 1: EXACT SECTION

Exact Paragraph content

1. Exact Clause Title
Exact Clause content

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
        expect(text).toBe(expectedText);
    });
});
