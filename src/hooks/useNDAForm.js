import { useState, useEffect, useRef, useCallback } from 'react';
import { getDefaultFormData } from '../data/ndaData';

const FORM_SAVE_DEBOUNCE_MS = 500;

const useNDAForm = () => {
  const [formData, setFormDataInternal] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ndaFormData');
      return saved ? JSON.parse(saved) : getDefaultFormData();
    } catch (e) {
      // Ignore sessionStorage errors (e.g., in incognito mode or restricted environments)
      return getDefaultFormData();
    }
  });

  const debounceTimeoutRef = useRef(null);

  const saveToLocal = useCallback((data) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      try {
        sessionStorage.setItem('ndaFormData', JSON.stringify(data));
      } catch (e) {
        // Silently fail if sessionStorage is unavailable
      }
    }, FORM_SAVE_DEBOUNCE_MS);
  }, []);

  const setFormData = useCallback((value) => {
    setFormDataInternal((prev) => {
      const nextData = typeof value === 'function' ? value(prev) : value;
      saveToLocal(nextData);
      return nextData;
    });
  }, [saveToLocal]);

  const resetForm = useCallback(() => {
    const defaultData = getDefaultFormData();
    setFormDataInternal(defaultData);
    saveToLocal(defaultData);
  }, [saveToLocal]);

  return { formData, setFormData, resetForm };
};

export default useNDAForm;
