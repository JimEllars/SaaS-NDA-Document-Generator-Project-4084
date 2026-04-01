import { describe, it } from 'vitest';
import { generateDocument, generatePlainText } from '../utils/documentGenerator';
import { getDefaultFormData } from '../data/ndaData';

const baseFormData = {
  ...getDefaultFormData(),
  isPaid: true,
  disclosing: 'Company A'.repeat(10),
  receiving: 'Company B'.repeat(10),
  effectiveDate: '2023-10-27',
  includeReturn: true,
  strictness: 'robust',
  industry: 'tech'
};

const docData = generateDocument(baseFormData);

// Create a larger document data for better measurement
const largeDocData = {
    ...docData,
    sections: Array(50).fill(docData.sections).flat()
};

describe('generatePlainText Benchmark', () => {
  it('measures execution time', () => {
    const iterations = 10000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      generatePlainText(largeDocData, baseFormData);
    }
    const end = performance.now();
    console.log(`Execution time for ${iterations} iterations: ${end - start}ms`);
  });
});
