import { useState, useEffect } from "react";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

/**
 * Custom hook for form validation.
 * @param {Object} formData - The form data object.
 * @returns {Object} - An object containing validation status and messages.
 */
const useFormValidation = (formData) => {
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    const validate = () => {
      const sendTelemetry = (failed_field_id, inputLength) => {
        try {
          fetchWithTimeout('/api/v1/telemetry/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_type: 'validation_failure',
              failed_field_id: failed_field_id,
              input_length: inputLength || 0,
              timestamp: new Date().toISOString()
            })
          }).catch(() => {});
        } catch (e) { /* ignore */ }
      };

      const sanitize = (str) => {
        if (!str) return "";
        // Strip HTML tags and replace layout-breaking characters
        const stripped = str.replace(/<[^>]*>?/gm, "");
        return stripped;
      };

      const checkCharacters = (str) => {
        if (!str) return true;
        return /^[\p{L}0-9\s.,&'-]+$/u.test(str);
      };

      const sanitizedDisclosing = sanitize(formData.disclosing);
      const sanitizedReceiving = sanitize(formData.receiving);

      if (
        !formData.disclosing ||
        formData.disclosing.trim().length < 2 ||
        formData.disclosing.length > 100
      ) {
        sendTelemetry('disclosing_out_of_bounds', formData.disclosing?.length);
        setValidationMessage(
          "Please enter a valid Disclosing Party name (min 2 characters, max 100).",
        );
        setIsValid(false);
        return;
      }

      if (
        !checkCharacters(sanitizedDisclosing) ||
        formData.disclosing !== sanitizedDisclosing
      ) {
        sendTelemetry('disclosing_invalid_characters', formData.disclosing?.length);
        setValidationMessage(
          "Disclosing Party name contains invalid characters.",
        );
        setIsValid(false);
        return;
      }

      if (
        !formData.receiving ||
        formData.receiving.trim().length < 2 ||
        formData.receiving.length > 100
      ) {
        sendTelemetry('receiving_out_of_bounds', formData.receiving?.length);
        setValidationMessage(
          "Please enter a valid Receiving Party name (min 2 characters, max 100).",
        );
        setIsValid(false);
        return;
      }

      if (
        !checkCharacters(sanitizedReceiving) ||
        formData.receiving !== sanitizedReceiving
      ) {
        sendTelemetry('receiving_invalid_characters', formData.receiving?.length);
        setValidationMessage(
          "Receiving Party name contains invalid characters.",
        );
        setIsValid(false);
        return;
      }

      // Validate Effective Date
      const date = new Date(formData.effectiveDate);
      if (!formData.effectiveDate || isNaN(date.getTime())) {
        sendTelemetry('effectiveDate_invalid', formData.effectiveDate?.length);
        setValidationMessage("Please enter a valid effective date.");
        setIsValid(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const dateToCompare = new Date(date);
      dateToCompare.setHours(0, 0, 0, 0);

      if (dateToCompare > today) {
        sendTelemetry('effectiveDate_future', formData.effectiveDate?.length);
        setValidationMessage("Effective date cannot be in the future.");
        setIsValid(false);
        return;
      }

      if (dateToCompare < thirtyDaysAgo) {
        sendTelemetry('effectiveDate_past', formData.effectiveDate?.length);
        setValidationMessage(
          "Effective date cannot be more than 30 days in the past.",
        );
        setIsValid(false);
        return;
      }

      if (!formData.jurisdiction || formData.jurisdiction.trim() === "") {
        sendTelemetry('jurisdiction_missing', formData.jurisdiction?.length);
        setValidationMessage("Please select a governing law jurisdiction.");
        setIsValid(false);
        return;
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        sendTelemetry('email_invalid', formData.email?.length);
        setValidationMessage("Please enter a valid email address.");
        setIsValid(false);
        return;
      }

      if (formData.recipientEmail && !emailRegex.test(formData.recipientEmail)) {
        sendTelemetry('recipientEmail_invalid', formData.recipientEmail?.length);
        setValidationMessage("Please enter a valid counterparty email address.");
        setIsValid(false);
        return;
      }

      // If all checks pass
      setValidationMessage("");
      setIsValid(true);
    };

    validate();
  }, [formData]);

  return { isValid, validationMessage };
};

export default useFormValidation;
