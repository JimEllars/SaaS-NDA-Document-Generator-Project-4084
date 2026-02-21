import { CLAUSES } from '../data/ndaData';

/**
 * Generates the NDA document structure based on form data.
 * @param {Object} formData - The data from the form.
 * @returns {Object|null} - The generated document data or null if not paid.
 */
export const generateDocument = (formData) => {
  if (!formData.isPaid) return null;

  const industry = CLAUSES[formData.industry];
  const isRobust = formData.strictness === 'robust';

  // Fix date parsing to avoid timezone issues with 'YYYY-MM-DD' strings
  let effectiveDateFormatted;
  if (formData.effectiveDate) {
      // Optimization: Avoid array creation from split().map(Number)
      const year = parseInt(formData.effectiveDate.substring(0, 4), 10);
      const month = parseInt(formData.effectiveDate.substring(5, 7), 10);
      const day = parseInt(formData.effectiveDate.substring(8, 10), 10);
      // Create date using local time
      effectiveDateFormatted = new Date(year, month - 1, day).toLocaleDateString();
  } else {
      effectiveDateFormatted = new Date().toLocaleDateString();
  }

  return {
    title: `${formData.type === 'mutual' ? 'Mutual' : 'Unilateral'} Non-Disclosure Agreement`,
    intro: CLAUSES.general.intro(formData.disclosing, formData.receiving, formData.type, effectiveDateFormatted),
    effectiveDate: effectiveDateFormatted,
    sections: [
      {
        title: "Article 1: Definition of Confidential Information",
        content: [
          CLAUSES.general.definition,
          ...(isRobust ? [CLAUSES.robust.clauses[1].text] : [])
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
        content: CLAUSES.robust.clauses.map(clause => ({ title: clause.title, text: clause.text }))
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
