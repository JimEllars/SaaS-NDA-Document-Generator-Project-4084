import { useState, useCallback } from 'react';
import { getDefaultFormData } from '../data/ndaData';

const useNDAForm = () => {
  const [formData, setFormDataInternal] = useState(() => getDefaultFormData());

  const setFormData = useCallback((value) => {
    setFormDataInternal((prev) => {
      const nextData = typeof value === 'function' ? value(prev) : value;
      return nextData;
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormDataInternal(getDefaultFormData());
  }, []);

  return { formData, setFormData, resetForm };
};

export default useNDAForm;