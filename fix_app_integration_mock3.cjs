const fs = require('fs');

const appTestFile = 'src/tests/App.test.jsx';
let appContent = fs.readFileSync(appTestFile, 'utf8');

const mockUseNDAForm = `import * as paymentService from '../api/paymentService';

// Mock useNDAForm
vi.mock('../hooks/useNDAForm', () => ({
  default: vi.fn(() => ({
    formData: {
      disclosing: 'Alice Corp',
      receiving: 'Bob Inc',
      type: 'unilateral',
      industry: 'general',
      strictness: 'standard',
      jurisdiction: 'Delaware',
      term: '3',
      includeReturn: true,
      effectiveDate: '2023-01-01',
    },
    setFormData: vi.fn(),
    resetForm: vi.fn(),
    debouncedFormData: {},
  }))
}));
`;

appContent = appContent.replace(/import \* as paymentService from '\.\.\/api\/paymentService';/g, mockUseNDAForm);
fs.writeFileSync(appTestFile, appContent);
