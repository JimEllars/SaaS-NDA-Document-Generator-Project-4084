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
      const sanitize = (str) => {
        if (!str) return '';
        // Strip HTML tags and replace layout-breaking characters
        const stripped = str.replace(/<[^>]*>?/gm, '');
        return stripped;
      };

      const checkCharacters = (str) => {
        if (!str) return true;
        return /^[\p{L}0-9\s.,&'-]+$/u.test(str);
      };

      const sanitizedDisclosing = sanitize(formData.disclosing);
      const sanitizedReceiving = sanitize(formData.receiving);

      if (!formData.disclosing || formData.disclosing.trim().length < 2 || formData.disclosing.length > 100) {
        setValidationMessage('Please enter a valid Disclosing Party name (min 2 characters, max 100).');
        setIsValid(false);
        return;
      }

      if (!checkCharacters(sanitizedDisclosing) || formData.disclosing !== sanitizedDisclosing) {
        setValidationMessage('Disclosing Party name contains invalid characters.');
        setIsValid(false);
        return;
      }

      if (!formData.receiving || formData.receiving.trim().length < 2 || formData.receiving.length > 100) {
        setValidationMessage('Please enter a valid Receiving Party name (min 2 characters, max 100).');
        setIsValid(false);
        return;
      }

      if (!checkCharacters(sanitizedReceiving) || formData.receiving !== sanitizedReceiving) {
        setValidationMessage('Receiving Party name contains invalid characters.');
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
