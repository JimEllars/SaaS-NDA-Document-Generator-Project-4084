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

  return {
    title: `${formData.type === 'mutual' ? 'Mutual' : 'Unilateral'} Non-Disclosure Agreement`,
    intro: CLAUSES.general.intro(formData.disclosing, formData.receiving, formData.type, effectiveDateFormatted),
    effectiveDate: effectiveDateFormatted,
    sections: [
      {
        title: "Article 1: Definition of Confidential Information",
        content: [
          CLAUSES.general.definition,
          ...(isRobust ? [CLAUSES.robust.definition.text] : [])
        ]
      },
      ...(formData.industry !== 'general' ? [{
        title: `Article 2: ${industry.label} Specific Provisions`,
        content: industry.clauses.map(clause => ({ title: clause.title, text: clause.text }))
      }] : []),
      {
        title: "Article 3: Permitted Use and Exclusions",
        content: [
          CLAUSES.general.exclusions,
          CLAUSES.general.term(formData.term),
          ...(formData.includeReturn ? [CLAUSES.general.return] : [])
        ]
      },
      ...(isRobust ? [{
        title: "Article 4: Enforcement and Remedies",
        content: CLAUSES.robust.enforcement.map(clause => ({ title: clause.title, text: clause.text }))
      }] : []),
      {
        title: "Article 5: Governing Law and Jurisdiction",
        content: [
          `This Agreement shall be governed by and construed in accordance with the laws of the State of ${formData.jurisdiction}, without regard to conflict of law principles. Any disputes arising under this Agreement shall be subject to the exclusive jurisdiction of the courts of ${formData.jurisdiction}.`
        ]
      }
    ]
  };
};
