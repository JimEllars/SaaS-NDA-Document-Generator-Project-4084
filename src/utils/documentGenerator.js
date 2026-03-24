import { CLAUSES } from '../data/ndaData';
import { formatEffectiveDate } from './dateUtils';

/**
 * Generates the NDA document structure based on form data.
 * @param {Object} formData - The data from the form.
 * @returns {Object|null} - The generated document data or null if not paid.
 */
export const generateDocument = (formData) => {
  if (!formData.isPaid) return null;

  const industry = CLAUSES[formData.industry];
  const isRobust = formData.strictness === 'robust';

  const effectiveDateFormatted = formatEffectiveDate(formData.effectiveDate);

  const processContent = (content) => {
    let clauseCounter = 0;
    return content.map(item => {
      if (typeof item === 'string') {
        return { type: 'paragraph', text: item };
      } else {
        clauseCounter++;
        return {
          type: 'clause',
          number: clauseCounter,
          title: item.title,
          text: item.text
        };
      }
    });
  };

  const rawSections = [
    {
      title: "Definition of Confidential Information",
      content: processContent([
        CLAUSES.general.definition,
        ...(isRobust ? [CLAUSES.robust.definition] : [])
      ])
    },
    ...(formData.industry !== 'general' ? [{
      title: `${industry.label} Specific Provisions`,
      content: processContent(industry.clauses)
    }] : []),
    {
      title: "Permitted Use and Exclusions",
      content: processContent([
        CLAUSES.general.exclusions,
        CLAUSES.general.term(formData.term),
        ...(formData.includeReturn ? [CLAUSES.general.return] : [])
      ])
    },
    ...(isRobust ? [{
      title: "Enforcement and Remedies",
      content: processContent(CLAUSES.robust.enforcement)
    }] : []),
    {
      title: "Governing Law and Jurisdiction",
      content: processContent([
        `This Agreement shall be governed by and construed in accordance with the laws of the State of ${formData.jurisdiction}, without regard to conflict of law principles. Any disputes arising under this Agreement shall be subject to the exclusive jurisdiction of the courts of ${formData.jurisdiction}.`
      ])
    }
  ];

  const sections = rawSections.map((section, index) => ({
    ...section,
    title: `Article ${index + 1}: ${section.title}`
  }));

  return {
    title: `${formData.type === 'mutual' ? 'Mutual' : 'Unilateral'} Non-Disclosure Agreement`,
    intro: CLAUSES.general.intro(formData.disclosing, formData.receiving, formData.type, effectiveDateFormatted),
    effectiveDate: effectiveDateFormatted,
    sections
  };
};

export const generatePlainText = (documentData, formData) => {
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
