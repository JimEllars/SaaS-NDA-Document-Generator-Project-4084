import { describe, bench } from 'vitest';
import { generateDocument, generatePlainText } from '../utils/documentGenerator';
import { getDefaultFormData } from '../data/ndaData';

const baseFormData = {
  ...getDefaultFormData(),
  isPaid: true,
  disclosing: 'Company A',
  receiving: 'Company B',
  effectiveDate: '2023-10-27',
  includeReturn: true,
  strictness: 'robust',
  industry: 'tech',
  type: 'mutual'
};

const documentData = generateDocument(baseFormData);

// Re-implement the old version for comparison
const oldGeneratePlainText = (documentData, formData) => {
    if (!documentData) return '';

    let text = `${documentData.title}\n`;
    text += `Effective Date: ${documentData.effectiveDate}\n\n`;
    text += `RECITALS\n`;
    text += `${documentData.intro}\n\n`;
    text += `NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:\n\n`;

    documentData.sections.forEach(section => {
        text += `${section.title.toUpperCase()}\n\n`;
        section.content.forEach(item => {
            if (item.type === 'paragraph') {
                text += `${item.text}\n\n`;
            } else {
                text += `${item.number}. ${item.title}\n`;
                text += `${item.text}\n\n`;
            }
        });
    });

    text += `EXECUTION\n\n`;
    text += `IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.\n\n`;

    // Add formatted signature blocks
    const party1Label = formData.type === 'mutual' ? 'PARTY 1' : 'DISCLOSING PARTY';
    const party2Label = formData.type === 'mutual' ? 'PARTY 2' : 'RECEIVING PARTY';

    text += `${party1Label}: ${formData.disclosing || '[Party Name]'}\n`;
    text += `Print Name: _________________________\n`;
    text += `Title: _______________________________\n`;
    text += `Date: _______________________________\n\n`;

    text += `${party2Label}: ${formData.receiving || '[Party Name]'}\n`;
    text += `Print Name: _________________________\n`;
    text += `Title: _______________________________\n`;
    text += `Date: _______________________________\n`;

    return text;
};

const oneBigTemplateString = (documentData, formData) => {
    if (!documentData) return '';

    const party1Label = formData.type === 'mutual' ? 'PARTY 1' : 'DISCLOSING PARTY';
    const party2Label = formData.type === 'mutual' ? 'PARTY 2' : 'RECEIVING PARTY';

    let sectionsText = '';
    for (let i = 0; i < documentData.sections.length; i++) {
        const section = documentData.sections[i];
        sectionsText += `${section.title.toUpperCase()}\n\n`;
        for (let j = 0; j < section.content.length; j++) {
            const item = section.content[j];
            if (item.type === 'paragraph') {
                sectionsText += `${item.text}\n\n`;
            } else {
                sectionsText += `${item.number}. ${item.title}\n${item.text}\n\n`;
            }
        }
    }

    return `${documentData.title}
Effective Date: ${documentData.effectiveDate}

RECITALS
${documentData.intro}

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:

${sectionsText}EXECUTION

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

${party1Label}: ${formData.disclosing || '[Party Name]'}
Print Name: _________________________
Title: _______________________________
Date: _______________________________

${party2Label}: ${formData.receiving || '[Party Name]'}
Print Name: _________________________
Title: _______________________________
Date: _______________________________
`;
};

describe('generatePlainText Performance', () => {
    bench('generatePlainText current implementation (newly updated)', () => {
        generatePlainText(documentData, baseFormData);
    });
    bench('generatePlainText oneBigTemplateString', () => {
        oneBigTemplateString(documentData, baseFormData);
    });
    bench('generatePlainText old (string concat template)', () => {
        oldGeneratePlainText(documentData, baseFormData);
    });
});
