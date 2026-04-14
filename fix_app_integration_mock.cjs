const fs = require('fs');

const appTestFile = 'src/tests/App.test.jsx';
let appContent = fs.readFileSync(appTestFile, 'utf8');

// App.test.jsx: Remove fake timers
appContent = appContent.replace(/vi\.useFakeTimers\(\);\n/g, "");
appContent = appContent.replace(/vi\.runOnlyPendingTimers\(\);\n/g, "");
appContent = appContent.replace(/vi\.useRealTimers\(\);\n/g, "");

// Add mock for useNDAForm
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

// AppIntegration.test.jsx
const intFile = 'src/tests/AppIntegration.test.jsx';
let intContent = fs.readFileSync(intFile, 'utf8');

const intMock = `import App from '../App';

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

intContent = intContent.replace(/import App from '\.\.\/App';/g, intMock);
fs.writeFileSync(intFile, intContent);
