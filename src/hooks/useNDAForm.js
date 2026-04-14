import { useState, useCallback, useRef, useEffect } from 'react';
import { getDefaultFormData } from '../data/ndaData';

const useNDAForm = () => {
  const [formData, setFormDataInternal] = useState(() => getDefaultFormData());
  const debouncedFormDataRef = useRef(formData);

  const setFormData = useCallback((value) => {
    setFormDataInternal((prev) => {
      const nextData = typeof value === 'function' ? value(prev) : value;
      return nextData;
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormDataInternal(getDefaultFormData());
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      debouncedFormDataRef.current = formData;
    }, 500);

    return () => clearTimeout(handler);
  }, [formData]);

  return { formData, setFormData, resetForm, debouncedFormData: debouncedFormDataRef.current };
};

export default useNDAForm;
