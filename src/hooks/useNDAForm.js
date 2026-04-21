import { useState, useCallback, useEffect, useRef } from 'react';
import { getDefaultFormData } from '../data/ndaData';
import { encrypt, decrypt } from '../utils/crypto';

const STORAGE_KEY = 'axim_nda_draft';

const useNDAForm = () => {
  const [formData, setFormDataInternal] = useState(() => {
    try {
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const decrypted = decrypt(savedData);
        const parsed = JSON.parse(decrypted);
        if (parsed.formData) return parsed.formData;
        return parsed;
      }
    } catch (err) {
      console.warn("Failed to read from sessionStorage:", err);
    }
    return getDefaultFormData();
  });

  const [currentStep, setCurrentStepInternal] = useState(() => {
    try {
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const decrypted = decrypt(savedData);
        const parsed = JSON.parse(decrypted);
        if (parsed.currentStep !== undefined) return parsed.currentStep;
      }
    } catch (err) {
      console.warn("Failed to read from sessionStorage:", err);
    }
    return 1;
  });

  const [isResumed, setIsResumed] = useState(() => {
    try {
        return sessionStorage.getItem(STORAGE_KEY) !== null;
    } catch (err) {
        return false;
    }
  });

  const currentStepRef = useRef(currentStep);

  const formDataRef = useRef(formData);

  const setCurrentStep = useCallback((value) => {
    setCurrentStepInternal((prev) => {
      const nextData = typeof value === 'function' ? value(prev) : value;
      currentStepRef.current = nextData;
      return nextData;
    });
  }, []);

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
        const dataToSave = JSON.stringify({
            formData: formDataRef.current,
            currentStep: currentStepRef.current
        });
        sessionStorage.setItem(STORAGE_KEY, encrypt(dataToSave));
      } catch (err) {
        console.warn("Failed to save to sessionStorage:", err);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData, currentStep]); // We trigger the effect when formData changes

  const resetForm = useCallback(() => {
    const defaultData = getDefaultFormData();
    setFormDataInternal(defaultData);
    setCurrentStepInternal(1);
    formDataRef.current = defaultData;
    currentStepRef.current = 1;
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Failed to remove from sessionStorage:", err);
    }
  }, []);

  return { formData, setFormData, currentStep, setCurrentStep, resetForm, isResumed };
};

export default useNDAForm;