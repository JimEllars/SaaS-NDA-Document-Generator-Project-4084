import { useState, useEffect, useRef, useCallback } from 'react';
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

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      try {
        localStorage.setItem('ndaFormData', JSON.stringify(formData));
      } catch (e) {
        // Silently fail if localStorage is unavailable
      }
    }, FORM_SAVE_DEBOUNCE_MS);

    return () => clearTimeout(handler);
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(getDefaultFormData());
  }, []);

  return { formData, setFormData, resetForm };
};

export default useNDAForm;
