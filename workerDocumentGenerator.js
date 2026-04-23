import { CLAUSES } from './workerNdaData.js';
import { formatEffectiveDate } from './workerDateUtils.js';

/**
 * Processes an array of content items, formatting them into paragraphs or clauses.
 * @param {Array<string|Object>} content - The content items to process.
 * @returns {Array<Object>} - Processed content items with standardized structure.
 */
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

/**
 * Builds the array of document sections based on the provided configuration.
 * @param {Object} formData - The data from the form.
 * @param {boolean} isRobust - Whether to include robust clauses.
 * @param {Object} industry - Industry-specific data and clauses.
 * @returns {Array<Object>} - Array of configured sections with formatting.
 */
const buildSections = (formData, isRobust, industry) => {
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
        ...(formData.includeReturn ? [CLAUSES.general.return] : []),
        ...(formData.includeNonSolicitation ? [{ title: "Non-Solicitation", text: CLAUSES.general.nonSolicitation }] : [])
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

  return rawSections.map((section, index) => ({
    ...section,
    title: `Article ${index + 1}: ${section.title}`
  }));
};

/**
 * Generates the NDA document structure based on form data.
 * @param {Object} formData - The data from the form.
 * @returns {Object|null} - The generated document data or null if not paid.
 */
export const generateDocument = (formData) => {
  if (!formData) return null;
  if (!formData.isPaid) return null;

  const industry = CLAUSES[formData.industry];
  const isRobust = formData.strictness === 'robust';
  const effectiveDateFormatted = formatEffectiveDate(formData.effectiveDate);

  const sections = buildSections(formData, isRobust, industry);

  return {
    title: `${formData.type === 'mutual' ? 'Mutual' : 'Unilateral'} Non-Disclosure Agreement`,
    intro: CLAUSES.general.intro(formData.disclosing, formData.receiving, formData.type, effectiveDateFormatted),
    effectiveDate: effectiveDateFormatted,
    sections
  };
};

const generateHeaderParts = (documentData, textParts) => {
  textParts.push(`${documentData.title}\n`);
  textParts.push(`Effective Date: ${documentData.effectiveDate}\n\n`);
  textParts.push('RECITALS\n');
  textParts.push(`${documentData.intro}\n\n`);
  textParts.push('NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:\n\n');
};

const generateSectionsParts = (documentData, textParts) => {
  for (const section of documentData.sections) {
    textParts.push(`${section.title.toUpperCase()}\n\n`);
    for (const item of section.content) {
      if (item.type === 'paragraph') {
        textParts.push(`${item.text}\n\n`);
      } else {
        textParts.push(`${item.number}. ${item.title}\n`);
        textParts.push(`${item.text}\n\n`);
      }
    }
  }
};

const generateExecutionParts = (formData, textParts) => {
  textParts.push('EXECUTION\n\n');
  textParts.push('IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.\n\n');

  // Add formatted signature blocks
  const party1Label = formData.type === 'mutual' ? 'PARTY 1' : 'DISCLOSING PARTY';
  const party2Label = formData.type === 'mutual' ? 'PARTY 2' : 'RECEIVING PARTY';

  textParts.push(`${party1Label}: ${formData.disclosing || '[Party Name]'}\n`);
  textParts.push('Print Name: _________________________\n');
  textParts.push('Title: _______________________________\n');
  textParts.push('Date: _______________________________\n\n');

  textParts.push(`${party2Label}: ${formData.receiving || '[Party Name]'}\n`);
  textParts.push('Print Name: _________________________\n');
  textParts.push('Title: _______________________________\n');
  textParts.push('Date: _______________________________\n');
};

export const generatePlainText = (documentData, formData) => {
  if (!documentData) return '';

  const textParts = [];
  generateHeaderParts(documentData, textParts);
  generateSectionsParts(documentData, textParts);
  generateExecutionParts(formData, textParts);

  return textParts.join('');
};
