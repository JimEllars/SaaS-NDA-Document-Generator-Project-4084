import { generateDocument } from '../utils/documentGenerator';

/**
 * Simulates a secure backend API for processing payments and generating documents.
 * In a real-world application, this logic would live on a secure server.
 * The client would send the paymentMethodId to the server, the server would
 * verify the payment with Stripe, and then securely generate and return the document.
 */
export const verifyPaymentAndGetDocument = async (paymentMethodId, formData) => {
  return new Promise((resolve, reject) => {
    // Simulate network delay and backend processing
    setTimeout(() => {
      if (!paymentMethodId) {
        reject(new Error("Invalid payment method"));
        return;
      }

      try {
        // The server generates the document based on the provided data.
        // We set a temporary flag `isPaid: true` just for the generator function
        // because the generator function internally checks for `isPaid`.
        // In a real backend, the generator wouldn't need a client-provided `isPaid` flag.
        const documentData = generateDocument({ ...formData, isPaid: true });

        resolve({
          success: true,
          document: documentData
        });
      } catch (error) {
        reject(new Error("Failed to generate document securely"));
      }
    }, 2000);
  });
};

/**
 * Simulates a secure backend API for updating a document that has already been paid for.
 * In a real-world application, the server would verify the user's session or a secure token
 * to ensure they have the right to regenerate the document.
 */
export const updateDocument = async (formData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const documentData = generateDocument({ ...formData, isPaid: true });
        resolve({
          success: true,
          document: documentData
        });
      } catch (error) {
        reject(new Error("Failed to update document"));
      }
    }, 1000);
  });
};
