import { useState, useRef, useCallback } from 'react';
import { getDefaultFormData } from '../data/ndaData';

const FORM_SAVE_DEBOUNCE_MS = 500;

// Simple obfuscation to prevent casual reading of sensitive data in sessionStorage
const encodeData = (data) => btoa(encodeURIComponent(JSON.stringify(data)));
const decodeData = (str) => {
  try {
    return JSON.parse(decodeURIComponent(atob(str)));
  } catch (e) {
    // Fallback in case of existing un-obfuscated data
    return JSON.parse(str);
  }
};

const useNDAForm = () => {
  const [formData, setFormDataInternal] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ndaFormData');
      return saved ? decodeData(saved) : getDefaultFormData();
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
        sessionStorage.setItem('ndaFormData', encodeData(data));
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
