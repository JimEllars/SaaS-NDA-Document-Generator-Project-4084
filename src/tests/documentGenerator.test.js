import { describe, it, expect } from 'vitest';
import { generateDocument, generatePlainText } from '../utils/documentGenerator';
import { getDefaultFormData } from '../data/ndaData';

const baseFormData = {
  ...getDefaultFormData(),
  isPaid: true,
  disclosing: 'Company A',
  receiving: 'Company B',
  effectiveDate: '2023-10-27',
  includeReturn: false,
};

describe('documentGenerator error handling', () => {
  it('should handle missing form data gracefully', () => {
    // Attempting to generate a document with undefined should probably throw or return null gracefully.
    // The implementation currently expects formData to be an object. Let's pass an empty object.
    expect(() => {
        generateDocument({});
    }).not.toThrow();

    expect(generateDocument({})).toBeNull(); // because isPaid is not true
  });

  it('should not throw if receiving or disclosing party is missing but isPaid is true', () => {
      const data = { ...baseFormData, disclosing: undefined, receiving: undefined };
      const doc = generateDocument(data);
      expect(doc).toBeDefined();
      expect(doc.intro).toContain('[Disclosing Party]'); // CLAUSES.general.intro handles missing names gracefully
      expect(doc.intro).toContain('[Receiving Party]'); // CLAUSES.general.intro handles missing names gracefully
  });
});
