import { useState, useEffect } from 'react';

/**
 * Custom hook for form validation.
 * @param {Object} formData - The form data object.
 * @returns {Object} - An object containing validation status and messages.
 */
const useFormValidation = (formData) => {
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    const validate = () => {
      // Validate Party Names
      if (!formData.disclosing || formData.disclosing.trim().length < 2 || formData.disclosing.length > 255) {
        setValidationMessage('Please enter a valid Disclosing Party name (min 2 characters, max 255).');
        setIsValid(false);
        return;
      }

      if (!formData.receiving || formData.receiving.trim().length < 2 || formData.receiving.length > 255) {
        setValidationMessage('Please enter a valid Receiving Party name (min 2 characters, max 255).');
        setIsValid(false);
        return;
      }

      // Validate Effective Date
      const date = new Date(formData.effectiveDate);
      if (!formData.effectiveDate || isNaN(date.getTime())) {
        setValidationMessage('Please enter a valid effective date.');
        setIsValid(false);
        return;
      }

      // If all checks pass
      setValidationMessage('');
      setIsValid(true);
    };

    validate();
  }, [formData]);

  return { isValid, validationMessage };
};

export default useFormValidation;
