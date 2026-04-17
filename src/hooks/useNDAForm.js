import { useState, useCallback, useEffect, useRef } from 'react';
import { getDefaultFormData } from '../data/ndaData';

const STORAGE_KEY = 'axim_nda_draft';

const useNDAForm = () => {
  const [formData, setFormDataInternal] = useState(() => {
    try {
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (err) {
      console.warn("Failed to read from sessionStorage:", err);
    }
    return getDefaultFormData();
  });

  const formDataRef = useRef(formData);

  const setFormData = useCallback((value) => {
    setFormDataInternal((prev) => {
      const nextData = typeof value === 'function' ? value(prev) : value;
      formDataRef.current = nextData;
      return nextData;
    });
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formDataRef.current));
      } catch (err) {
        console.warn("Failed to save to sessionStorage:", err);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData]); // We trigger the effect when formData changes

  const resetForm = useCallback(() => {
    const defaultData = getDefaultFormData();
    setFormDataInternal(defaultData);
    formDataRef.current = defaultData;
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Failed to remove from sessionStorage:", err);
    }
  }, []);

  return { formData, setFormData, resetForm };
};

export default useNDAForm;