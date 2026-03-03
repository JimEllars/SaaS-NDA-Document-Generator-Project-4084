import { useState, useEffect, useRef } from 'react';
import useDebounce from './useDebounce';
import { getDefaultFormData } from '../data/ndaData';

const FORM_SAVE_DEBOUNCE_MS = 500;

const useNDAForm = () => {
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('ndaFormData');
      return saved ? JSON.parse(saved) : getDefaultFormData();
    } catch (e) {
      // Ignore localStorage errors (e.g., in incognito mode or restricted environments)
      return getDefaultFormData();
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
      // Silently fail if localStorage is unavailable
    }
  }, [debouncedFormData]);

  const resetForm = () => {
    setFormData(getDefaultFormData());
  };

  return { formData, setFormData, resetForm };
};

export default useNDAForm;
