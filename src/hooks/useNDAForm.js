import { useState, useEffect, useRef } from 'react';
import useDebounce from './useDebounce';

const DEFAULT_FORM_DATA = {
  disclosing: '',
  receiving: '',
  industry: 'general',
  strictness: 'standard',
  type: 'unilateral',
  jurisdiction: 'Delaware',
  term: '3',
  isPaid: false,
  includeReturn: true,
  effectiveDate: new Date().toISOString().split('T')[0]
};

const FORM_SAVE_DEBOUNCE_MS = 500;

const useNDAForm = () => {
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('ndaFormData');
      return saved ? JSON.parse(saved) : DEFAULT_FORM_DATA;
    } catch (e) {
      console.warn("Failed to load from localStorage", e);
      return DEFAULT_FORM_DATA;
    }
  });

  const debouncedFormData = useDebounce(formData, FORM_SAVE_DEBOUNCE_MS);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      localStorage.setItem('ndaFormData', JSON.stringify(debouncedFormData));
    } catch (e) {
      console.warn("Failed to save to localStorage", e);
    }
  }, [debouncedFormData]);

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
  };

  return { formData, setFormData, resetForm };
};

export default useNDAForm;
