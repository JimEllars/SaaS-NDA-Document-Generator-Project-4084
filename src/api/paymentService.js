import { generateDocument } from '../utils/documentGenerator';

/**
 * Helper to simulate a network delay.
 * @param {number} ms The delay in milliseconds.
 * @returns {Promise<void>}
 */
const simulateDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Simulates a secure backend API for processing payments and generating documents.
 * In a real-world application, this logic would live on a secure server.
 * The client would send the paymentMethodId to the server, the server would
 * verify the payment with Stripe, and then securely generate and return the document.
 */
export const verifyPaymentAndGetDocument = async (paymentMethodId, formData) => {
  // Simulate network delay and backend processing
  await simulateDelay(2000);

  if (!paymentMethodId) {
    throw new Error("Invalid payment method");
  }

  try {
    // The server generates the document based on the provided data.
    // We set a temporary flag `isPaid: true` just for the generator function
    // because the generator function internally checks for `isPaid`.
    // In a real backend, the generator wouldn't need a client-provided `isPaid` flag.
    const documentData = generateDocument({ ...formData, isPaid: true });

    return {
      success: true,
      document: documentData
    };
  } catch (error) {
    throw new Error("Failed to generate document securely");
  }
};

/**
 * Simulates a secure backend API for updating a document that has already been paid for.
 * In a real-world application, the server would verify the user's session or a secure token
 * to ensure they have the right to regenerate the document.
 */
export const updateDocument = async (formData) => {
  await simulateDelay(1000);

  try {
    const documentData = generateDocument({ ...formData, isPaid: true });
    return {
      success: true,
      document: documentData
    };
  } catch (error) {
    throw new Error("Failed to update document");
  }
};
