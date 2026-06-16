import { useState, useCallback, useEffect, useRef } from "react";
import { encrypt, decrypt } from "../utils/crypto";

export const getDefaultFormData = () => {
  let utm = {};
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    utm = {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      gclid: params.get("gclid") || ""
    };
  }
  return {
    ...utm,
    disclosing: "",
    receiving: "",
    industry: "general",
    strictness: "standard",
    type: "unilateral",
    email: "",
    recipientEmail: "",
    jurisdiction: "Delaware",
    term: "3",
    includeReturn: true,
    includeNonSolicitation: false,
    effectiveDate: new Date().toISOString().split("T")[0],
    notarizeOnChain: false,
    theme: "classic",
  };
};

const STORAGE_KEY = "axim_nda_draft";

const useNDAForm = () => {
  const [formData, setFormDataInternal] = useState(() => {
    try {
      const savedData = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (savedData) {
        const decrypted = decrypt(savedData);
        const parsed = JSON.parse(decrypted);
        if (parsed.timestamp && Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(STORAGE_KEY);
          return getDefaultFormData();
        }
        if (parsed.formData) return parsed.formData;
        return parsed;
      }
    } catch (err) {
      console.warn("Failed to read from localStorage, falling back to memory:", err);
    }
    return getDefaultFormData();
  });

  const [currentStep, setCurrentStepInternal] = useState(() => {
    try {
      const savedData = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (savedData) {
        const decrypted = decrypt(savedData);
        const parsed = JSON.parse(decrypted);
        if (parsed.timestamp && Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(STORAGE_KEY);
          return 1;
        }
        if (parsed.currentStep !== undefined) return parsed.currentStep;
      }
    } catch (err) {
      console.warn("Failed to read from localStorage, falling back to memory:", err);
    }
    return 1;
  });


  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [isResumed, setIsResumed] = useState(() => {
    try {
      return typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) !== null : false;
    } catch (err) {
      console.warn("Failed to access localStorage, running in memory-only mode:", err);
      return false;
    }
  });

  const currentStepRef = useRef(currentStep);
  const formDataRef = useRef(formData);

  const setCurrentStep = useCallback((value) => {
    setCurrentStepInternal((prev) => {
      const nextData = typeof value === "function" ? value(prev) : value;
      currentStepRef.current = nextData;
      return nextData;
    });
  }, []);

  const setFormData = useCallback((value) => {
    setFormDataInternal((prev) => {
      const nextData = typeof value === "function" ? value(prev) : value;
      formDataRef.current = nextData;
      return nextData;
    });
  }, []);

  useEffect(() => {
    if (isOffline) return;
    const timeoutId = setTimeout(() => {
      try {
        const dataToSave = JSON.stringify({
          formData: formDataRef.current,
          currentStep: currentStepRef.current,
          timestamp: Date.now(),
        });
        if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, encrypt(dataToSave));
      } catch (err) {
        // Handle QuotaExceededError or disabled local storage by logging and falling back gracefully to memory
        console.warn("Failed to save to localStorage (quota exceeded or disabled), maintaining state in memory:", err);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData, currentStep]);

  const resetForm = useCallback(() => {
    const defaultData = getDefaultFormData();
    setFormDataInternal(defaultData);
    setCurrentStepInternal(1);
    formDataRef.current = defaultData;
    currentStepRef.current = 1;
    try {
      if (typeof localStorage !== "undefined") localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Failed to remove from localStorage:", err);
    }
  }, []);

  return {
    formData,
    setFormData,
    currentStep,
    setCurrentStep,
    resetForm,
    isResumed,
  };
};

export default useNDAForm;
